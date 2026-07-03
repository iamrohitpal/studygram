import { Response, NextFunction } from 'express';
import { postService } from '../services/PostService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { SocialMediaService } from '../services/SocialMediaService';
import { followerRepository } from '../repositories/FollowerRepository';
import { notificationService } from '../services/NotificationService';
import { firebaseService } from '../services/FirebaseService';
import { SocketServer } from '../socket/SocketServer';
import { User } from '../database/models/User';

export class PostController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await postService.createPost({
        ...req.body,
        userId: req.user!.id
      }, req.file);

      // Trigger cross-publish if requested
      if (req.body.publishTo) {
        let platforms: string[] = [];
        try {
          // If it's sent as a JSON string (e.g., from FormData), parse it
          platforms = typeof req.body.publishTo === 'string' 
            ? JSON.parse(req.body.publishTo) 
            : req.body.publishTo;
        } catch(e) {
          console.warn('Could not parse publishTo');
        }

        if (Array.isArray(platforms) && platforms.length > 0) {
          SocialMediaService.publishPost(req.user!.id, post, platforms);
        }
      }

      // Notify followers
      try {
        const currentUser = await User.findByPk(req.user!.id);
        const username = currentUser ? currentUser.username : 'Someone';

        const followers = await followerRepository.findFollowers(req.user!.id);
        const followerIds = followers.map(f => f.followerId);
        
        const title = 'New Post';
        const body = `${username} uploaded a new post.`;
        
        // Use Socket IO to emit live event
        const io = SocketServer.getIO();

        for (const followerId of followerIds) {
          await notificationService.createNotification(followerId, title, body);
          
          if (post.contentType === 'video') {
            io.to(`user_${followerId}`).emit('new_reel_from_following', { userId: req.user!.id, postId: post.id });
          } else {
            io.to(`user_${followerId}`).emit('new_post_from_following', { userId: req.user!.id, postId: post.id });
          }
        }

        // We can send push notifications (without FCM tokens, it skips silently)
        // Ideally we fetch FCM tokens for followers here
        // firebaseService.sendPushNotification(tokens, title, body);
      } catch (err) {
        console.error('Failed to notify followers for post:', err);
      }

      res.status(211).json({
        status: 'success',
        message: 'Post published successfully.',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const where: any = {};
      if (req.query.categoryId && req.query.categoryId !== 'all' && req.query.categoryId !== 'All') {
        where.categoryId = req.query.categoryId;
      }
      if (req.query.contentType) {
        where.contentType = req.query.contentType;
      }

      const options = { limit, offset, where };

      const visibilities = ['public']; // The 'followers' visibility logic is now handled based on currentUserId
      const feed = await postService.getFeed(options, visibilities, req.user?.id);
      res.status(200).json({
        status: 'success',
        data: feed
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visibilities = ['public']; 
      const trending = await postService.getTrending(visibilities, req.user?.id);
      res.status(200).json({
        status: 'success',
        data: trending
      });
    } catch (error) {
      next(error);
    }
  }

  async like(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.body;
      if (!postId) throw new Error('postId is required.');

      const userId = req.user!.id;
      await postService.likePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: 'Action completed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async comment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId, content } = req.body;
      if (!postId || !content) throw new Error('postId and content are required.');

      const userId = req.user!.id;
      const comment = await postService.addComment(userId, Number(postId), content);

      res.status(211).json({
        status: 'success',
        message: 'Comment added.',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const comments = await postService.getComments(Number(postId), page, limit);
      res.status(200).json({
        status: 'success',
        data: comments
      });
    } catch (error) {
      next(error);
    }
  }

  async save(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.body;
      if (!postId) throw new Error('postId is required.');

      const userId = req.user!.id;
      const result = await postService.savePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: result.saved ? 'Post saved.' : 'Post unsaved.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const userPosts = await postService.getUserPosts(username, page, limit, req.user?.id);

      res.status(200).json({
        status: 'success',
        data: userPosts
      });
    } catch (error) {
      next(error);
    }
  }

  async getSaved(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const savedPosts = await postService.getSavedPosts(userId, page, limit);

      res.status(200).json({
        status: 'success',
        data: savedPosts
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      
      await postService.deletePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tags = await postService.getTrendingTags(page, limit);
      res.status(200).json({
        status: 'success',
        data: tags
      });
    } catch (error) {
      next(error);
    }
  }
}
export const postController = new PostController();
