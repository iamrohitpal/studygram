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
    if (existingLike) {
      await existingLike.destroy();
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      await Like.create({ userId, postId });
      post.likesCount += 1;
    }
    await post.save();
    await redisClient.del('feed_posts_public');
  }

  async addComment(userId: number, postId: number, text: string): Promise<Comment> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found.');

    const comment = await Comment.create({ userId, postId, comment: text });
    post.commentsCount += 1;
    await post.save();
    await redisClient.del('feed_posts_public');

    return comment;
  }

  async getComments(postId: number, page: number = 1, limit: number = 20): Promise<Comment[]> {
    const offset = (page - 1) * limit;
    return Comment.findAll({
      where: { postId },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [['created_at', 'ASC']],
      limit,
      offset
    });
  }

  async savePost(userId: number, postId: number): Promise<{ saved: boolean }> {
    const existingSave = await SavedPost.findOne({ where: { userId, postId } });
    if (existingSave) {
      await existingSave.destroy();
      return { saved: false };
    } else {
      await SavedPost.create({ userId, postId });
      return { saved: true };
    }
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
