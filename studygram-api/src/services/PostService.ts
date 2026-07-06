import { postRepository } from '../repositories/PostRepository';
import { redisClient } from '../config/redis';
import { Post } from '../database/models/Post';
import { Like } from '../database/models/Like';
import { Comment } from '../database/models/Comment';
import { SavedPost } from '../database/models/SavedPost';
import { User } from '../database/models/User';
import { Follower } from '../database/models/Follower';
import { Category } from '../database/models/Category';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';
import { firebaseService } from './FirebaseService';
import { Notification } from '../database/models/Notification';

export class PostService {
  async createPost(data: any, file?: Express.Multer.File): Promise<Post> {
    let mediaUrl = data.mediaUrl || '';
    let contentType = data.contentType || 'image';

    if (file) {
      // Determine content type from mime type
      if (file.mimetype.startsWith('image/')) {
        contentType = 'image';
        const uploadResult = await CloudinaryUploader.uploadImage(file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else if (file.mimetype.startsWith('video/')) {
        contentType = 'video';
        const uploadResult = await CloudinaryUploader.uploadVideo(file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else {
        contentType = 'note';
        const uploadResult = await CloudinaryUploader.uploadRaw(file.buffer, file.originalname);
        mediaUrl = uploadResult.secure_url;
      }
    }

    const post = await postRepository.create({
      ...data,
      mediaUrl,
      contentType
    });

    // Clear feed caches in Redis
    await redisClient.del('feed_posts_public');
    await redisClient.del('feed_posts_public_registered');
    return post;
  }

  async getFeed(options?: any, visibilities: string[] = ['public'], currentUserId?: number): Promise<Post[]> {
    if (currentUserId) {
      // Fetch followed users
      const follows = await Follower.findAll({ where: { followerId: currentUserId } });
      const followedUserIds = follows.map(f => f.followingId);
      // Fetch preferred categories (interests)
      let preferredCategoryIds: number[] = [];
      try {
        const { sequelize } = require('../config/db');
        const [results] = await sequelize.query(`
          SELECT category_id FROM (
            SELECT p.category_id FROM likes l JOIN posts p ON l.post_id = p.id WHERE l.user_id = ${currentUserId}
            UNION ALL
            SELECT p.category_id FROM saved_posts s JOIN posts p ON s.post_id = p.id WHERE s.user_id = ${currentUserId}
          ) as t 
          WHERE category_id IS NOT NULL
          GROUP BY category_id 
          ORDER BY COUNT(*) DESC 
          LIMIT 3
        `);
        preferredCategoryIds = (results as any[]).map(r => r.category_id);
      } catch (err) {
        console.error('Error fetching preferred categories:', err);
      }

      // Bypass cache for personalized algorithmic feed
      const posts = await postRepository.findFeedPosts(options, visibilities, currentUserId, followedUserIds, preferredCategoryIds);
      
      const postIds = posts.map(p => p.id);
      if (postIds.length === 0) return [];

      const likes = await Like.findAll({ where: { userId: currentUserId, postId: postIds } });
      const saves = await SavedPost.findAll({ where: { userId: currentUserId, postId: postIds } });
      
      const likedIds = new Set(likes.map(l => l.postId));
      const savedIds = new Set(saves.map(s => s.postId));

      return posts.map(p => {
        const postJson = p.toJSON() as any;
        postJson.hasLiked = likedIds.has(p.id);
        postJson.hasSaved = savedIds.has(p.id);
        return postJson;
      });
    }

    const optionsHash = Buffer.from(JSON.stringify(options || {})).toString('base64');
    const cacheKey = `feed_posts_public_${optionsHash}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const posts = await postRepository.findFeedPosts(options, visibilities, undefined, [], []);
    await redisClient.set(cacheKey, JSON.stringify(posts), { EX: 60 });
    return posts;
  }

  async getTrending(visibilities: string[] = ['public'], currentUserId?: number): Promise<Post[]> {
    if (currentUserId) {
      const follows = await Follower.findAll({ where: { followerId: currentUserId } });
      const followedUserIds = follows.map(f => f.followingId);
      const posts = await postRepository.findTrendingPosts(10, visibilities, currentUserId, followedUserIds);
      
      const postIds = posts.map(p => p.id);
      if (postIds.length === 0) return [];

      const likes = await Like.findAll({ where: { userId: currentUserId, postId: postIds } });
      const saves = await SavedPost.findAll({ where: { userId: currentUserId, postId: postIds } });
      
      const likedIds = new Set(likes.map(l => l.postId));
      const savedIds = new Set(saves.map(s => s.postId));

      return posts.map(p => {
        const postJson = p.toJSON() as any;
        postJson.hasLiked = likedIds.has(p.id);
        postJson.hasSaved = savedIds.has(p.id);
        return postJson;
      });
    }

    const cacheKey = `trending_posts_public`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const posts = await postRepository.findTrendingPosts(10, visibilities);
    await redisClient.set(cacheKey, JSON.stringify(posts), { EX: 600 });
    return posts;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found.');

    const existingLike = await Like.findOne({ where: { userId, postId } });
    let justHitMilestone = false;
    if (existingLike) {
      await existingLike.destroy();
      post.likesCount = Math.max(0, post.likesCount - 1);
      post.engagementScore = Math.max(0, (post.engagementScore || 0) - 2);
    } else {
      await Like.create({ userId, postId });
      post.likesCount += 1;
      post.engagementScore = (post.engagementScore || 0) + 2;
      
      const milestones = [100, 1000, 10000, 20000, 100000, 1000000];
      if (milestones.includes(post.likesCount)) {
        justHitMilestone = true;
      }
    }

    await post.save();
    await redisClient.del('feed_posts_public');

    // Notifications
    if (!existingLike) {
      try {
        const postOwner = await User.findByPk(post.userId);
        const liker = await User.findByPk(userId);
        if (postOwner && liker && postOwner.id !== liker.id) {
          const { DeviceToken } = require('../database/models/DeviceToken');
          const deviceTokens = await DeviceToken.findAll({ where: { userId: postOwner.id } });
          const tokens = deviceTokens.map((t: any) => t.token);

          await Notification.create({
            userId: postOwner.id,
            title: 'New Like',
            message: `${liker.name} liked your post.`,
            postId: post.id
          });

          if (tokens.length > 0) {
            firebaseService.sendPushNotification(
              tokens,
              'New Like',
              `${liker.name} liked your post.`,
              { postId: String(post.id) }
            );
          }
          
          if (justHitMilestone && tokens.length > 0) {
            firebaseService.sendPushNotification(
              tokens,
              'Post Milestone!',
              `Congratulations! Your post just hit ${post.likesCount} likes!`,
              { postId: String(post.id) }
            );
          }
        }
      } catch (err) {
        console.error('Error sending like push notification:', err);
      }
    }
  }

  async addComment(userId: number, postId: number, text: string): Promise<Comment> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found.');

    const commentObj = await Comment.create({ userId, postId, comment: text });
    post.commentsCount += 1;
    post.engagementScore = (post.engagementScore || 0) + 3;
    await post.save();
    await redisClient.del('feed_posts_public');

    // Notifications
    try {
      const postOwner = await User.findByPk(post.userId);
      const commenter = await User.findByPk(userId);
      if (postOwner && commenter && postOwner.id !== commenter.id) {
        const { DeviceToken } = require('../database/models/DeviceToken');
        const deviceTokens = await DeviceToken.findAll({ where: { userId: postOwner.id } });
        const tokens = deviceTokens.map((t: any) => t.token);
        
        await Notification.create({
          userId: postOwner.id,
          title: 'New Comment',
          message: `${commenter.name} commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          postId: post.id
        });
        
        if (tokens.length > 0) {
          firebaseService.sendPushNotification(
            tokens,
            'New Comment',
            `${commenter.name} commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            { postId: String(post.id) }
          );
        }
      }
    } catch (err) {
      console.error('Error sending comment push notification:', err);
    }

    return commentObj;
  }

  async getComments(postId: number, page: number = 1, limit: number = 20): Promise<Comment[]> {
    const offset = (page - 1) * limit;
    return Comment.findAll({
      where: { postId },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  }

  async getLikes(postId: number, page: number = 1, limit: number = 20): Promise<any[]> {
    const offset = (page - 1) * limit;
    const likes = await Like.findAll({
      where: { postId },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    // Return just the user objects
    return likes.map(like => like.user);
  }

  async savePost(userId: number, postId: number): Promise<{ saved: boolean }> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found');

    const existingSave = await SavedPost.findOne({ where: { userId, postId } });
    if (existingSave) {
      await existingSave.destroy();
      post.savesCount = Math.max(0, (post.savesCount || 0) - 1);
      await post.save();
      return { saved: false };
    } else {
      await SavedPost.create({ userId, postId });
      post.savesCount = (post.savesCount || 0) + 1;
      await post.save();

      // Notifications
      try {
        const postOwner = await User.findByPk(post.userId);
        const saver = await User.findByPk(userId);
        if (postOwner && saver && postOwner.id !== saver.id) {
          await Notification.create({
            userId: postOwner.id,
            title: 'Post Saved',
            message: `${saver.name} saved your post.`,
            postId: post.id
          });

          const { DeviceToken } = require('../database/models/DeviceToken');
          const deviceTokens = await DeviceToken.findAll({ where: { userId: postOwner.id } });
          const tokens = deviceTokens.map((t: any) => t.token);
          if (tokens.length > 0) {
            firebaseService.sendPushNotification(
              tokens,
              'Post Saved',
              `${saver.name} saved your post.`,
              { postId: String(post.id) }
            );
          }
        }
      } catch (err) {
        console.error('Error sending save notification:', err);
      }

      return { saved: true };
    }
  }

  async sharePost(userId: number, postId: number): Promise<{ shared: boolean }> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found');

    post.sharesCount = (post.sharesCount || 0) + 1;
    await post.save();

    // Notifications
    try {
      const postOwner = await User.findByPk(post.userId);
      const sharer = await User.findByPk(userId);
      if (postOwner && sharer && postOwner.id !== sharer.id) {
        await Notification.create({
          userId: postOwner.id,
          title: 'Post Shared',
          message: `${sharer.name} shared your post.`,
          postId: post.id
        });

        const { DeviceToken } = require('../database/models/DeviceToken');
        const deviceTokens = await DeviceToken.findAll({ where: { userId: postOwner.id } });
        const tokens = deviceTokens.map((t: any) => t.token);
        if (tokens.length > 0) {
          firebaseService.sendPushNotification(
            tokens,
            'Post Shared',
            `${sharer.name} shared your post.`,
            { postId: String(post.id) }
          );
        }
      }
    } catch (err) {
      console.error('Error sending share notification:', err);
    }

    return { shared: true };
  }

  async getSavedPosts(userId: number, page: number = 1, limit: number = 10): Promise<any[]> {
    const offset = (page - 1) * limit;
    const savedList = await SavedPost.findAll({
      where: { userId },
      attributes: ['postId'],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const postIds = savedList.map(s => s.postId);
    if (postIds.length === 0) return [];

    const posts = await Post.findAll({
      where: { id: postIds, status: 'active' },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
        { model: Category, attributes: ['id', 'name'] }
      ]
    });

    return posts.map(p => {
      const data = p.toJSON();
      data.hasSaved = true; // since it's from saved posts
      return data;
    });
  }

  async getPostById(postId: number, currentUserId?: number): Promise<any> {
    const post = await Post.findOne({
      where: { id: postId },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
        { model: Category, attributes: ['id', 'name', 'slug'] }
      ]
    });

    if (!post) return null;

    let hasLiked = false;
    let hasSaved = false;
    let hasFollowed = false;

    if (currentUserId) {
      const [like, save, follow] = await Promise.all([
        Like.findOne({ where: { userId: currentUserId, postId: post.id } }),
        SavedPost.findOne({ where: { userId: currentUserId, postId: post.id } }),
        Follower.findOne({ where: { followerId: currentUserId, followingId: post.userId } })
      ]);
      hasLiked = !!like;
      hasSaved = !!save;
      hasFollowed = !!follow;
    }

    return {
      id: String(post.id),
      authorId: post.userId,
      authorName: post.user?.name || 'User',
      authorUsername: post.user?.username,
      authorAvatar: post.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      caption: post.caption,
      categorySlug: post.category?.slug,
      categoryName: post.category?.name,
      likesCount: post.likesCount,
      savesCount: post.savesCount,
      sharesCount: post.sharesCount,
      commentsCount: post.commentsCount,
      viewsCount: post.viewsCount,
      hasLiked,
      hasSaved,
      hasFollowed,
      createdAt: new Date(post.createdAt).toLocaleDateString(),
    };
  }

  async getUserPosts(username: string, page: number = 1, limit: number = 10, currentUserId?: number): Promise<any[]> {
    const targetUser = await User.findOne({ where: { username } });
    if (!targetUser) throw new Error('User not found');

    const offset = (page - 1) * limit;
    
    // Fetch posts created by target user
    const posts = await postRepository.findAll({
      where: { userId: targetUser.id, status: 'active' },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
        { model: Category, attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    if (posts.length === 0) return [];

    // Optional: decorate with hasLiked / hasSaved if current user
    let likedPostIds = new Set<number>();
    let savedPostIds = new Set<number>();

    if (currentUserId) {
      const userLikes = await Like.findAll({
        where: { userId: currentUserId, postId: posts.map(p => p.id) },
        attributes: ['postId']
      });
      userLikes.forEach(l => likedPostIds.add(l.postId));

      const userSaves = await SavedPost.findAll({
        where: { userId: currentUserId, postId: posts.map(p => p.id) },
        attributes: ['postId']
      });
      userSaves.forEach(s => savedPostIds.add(s.postId));
    }

    return posts.map(p => {
      const data = p.toJSON();
      data.hasLiked = likedPostIds.has(data.id);
      data.hasSaved = savedPostIds.has(data.id);
      return data;
    });
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) throw new Error('Post not found or unauthorized to delete.');
    
    // Delete associated records to avoid foreign key constraint failures
    await Like.destroy({ where: { postId } });
    await Comment.destroy({ where: { postId } });
    await SavedPost.destroy({ where: { postId } });

    await post.destroy();
  }

  async getTrendingTags(page: number = 1, limit: number = 10): Promise<{ tag: string, count: number }[]> {
    const posts = await Post.findAll({ attributes: ['description'] });
    const tagCounts: { [tag: string]: number } = {};
    posts.forEach(p => {
      if (p.description) {
        const matches = p.description.match(/#[a-zA-Z0-9_]+/g);
        if (matches) {
          matches.forEach(m => {
            const tag = m.toLowerCase();
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });
    
    let sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    const offset = (page - 1) * limit;
    return sorted.slice(offset, offset + limit);
  }
}
export const postService = new PostService();
