import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../database/models/User';
import { Post } from '../database/models/Post';
import { Category } from '../database/models/Category';
import { Follower } from '../database/models/Follower';
import { Op } from 'sequelize';

export class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) throw new Error('Search query parameter "q" is required.');

      const term = String(q);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Search users
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${term}%` } },
            { username: { [Op.like]: `%${term}%` } }
          ],
          status: 'active'
        },
        attributes: ['id', 'uuid', 'name', 'username', 'profileImage', 'bio'],
        limit,
        offset
      });

      const visibilities = ['public'];
      let visibilityCondition: any = { visibility: { [Op.in]: visibilities } };
      
      if (req.user) {
        const currentUserId = req.user.id;
        const follows = await Follower.findAll({ where: { followerId: currentUserId } });
        const followedUserIds = follows.map(f => f.followingId);
        
        visibilityCondition = {
          [Op.or]: [
            { visibility: { [Op.in]: visibilities } },
            { visibility: 'followers', userId: { [Op.in]: followedUserIds } },
            { visibility: 'followers', userId: currentUserId },
            { visibility: 'private', userId: currentUserId }
          ]
        };
      }

      // Search posts
      const posts = await Post.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${term}%` } },
            { description: { [Op.like]: `%${term}%` } }
          ],
          status: 'active',
          ...visibilityCondition
        },
        include: [
          { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
        ],
        limit,
        offset
      });

      // Search categories
      const categories = await Category.findAll({
        where: {
          name: { [Op.like]: `%${term}%` },
          status: 'active'
        },
        limit,
        offset
      });

      let mappedPosts = posts;
      if (req.user) {
        const { Like } = require('../database/models/Like');
        const { SavedPost } = require('../database/models/SavedPost');
        const postIds = posts.map((p: any) => p.id);
        if (postIds.length > 0) {
          const likes = await Like.findAll({ where: { userId: req.user.id, postId: postIds } });
          const saves = await SavedPost.findAll({ where: { userId: req.user.id, postId: postIds } });
          const likedIds = new Set(likes.map((l: any) => l.postId));
          const savedIds = new Set(saves.map((s: any) => s.postId));
          mappedPosts = posts.map((p: any) => {
            const postJson = p.toJSON() as any;
            postJson.hasLiked = likedIds.has(p.id);
            postJson.hasSaved = savedIds.has(p.id);
            return postJson;
          }) as any;
        }
      }

      res.status(200).json({
        status: 'success',
        data: {
          users,
          posts: mappedPosts,
          categories
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
