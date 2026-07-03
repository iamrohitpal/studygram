import { BaseRepository } from './BaseRepository';
import { Post } from '../database/models/Post';
import { User } from '../database/models/User';
import { Category } from '../database/models/Category';

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post);
  }

  async findFeedPosts(options?: any, visibilities: string[] = ['public'], currentUserId?: number, followedUserIds: number[] = [], preferredCategoryIds: number[] = []): Promise<Post[]> {
    const { Op } = require('sequelize');
    
    let whereCondition: any = { status: 'active', visibility: { [Op.in]: visibilities } };

    if (currentUserId) {
      whereCondition = {
        status: 'active',
        [Op.or]: [
          { visibility: { [Op.in]: visibilities } },
          { visibility: 'followers', userId: { [Op.in]: followedUserIds } },
          { visibility: 'followers', userId: currentUserId },
          { visibility: 'private', userId: currentUserId }
        ]
      };
    }

    if (options?.where) {
      whereCondition = { ...whereCondition, ...options.where };
      delete options.where;
    }

    const followedIdsStr = followedUserIds.length > 0 ? followedUserIds.join(',') : '0';
    const preferredCatsStr = preferredCategoryIds.length > 0 ? preferredCategoryIds.join(',') : '0';

    const orderLiteral = `
      (likes_count * 2) + 
      (comments_count * 3) + 
      IF(\`Post\`.\`user_id\` IN (${followedIdsStr}), 1000, 0) + 
      IF(\`Post\`.\`user_id\` IN (${followedIdsStr}) AND \`Post\`.\`created_at\` > (NOW() - INTERVAL 1 DAY), 2000, 0) + 
      IF(\`Post\`.\`category_id\` IN (${preferredCatsStr}), 500, 0)
    `;

    try {
      return await this.findAll({
        where: whereCondition,
        include: [
          { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
          { model: Category, attributes: ['id', 'name', 'slug'] }
        ],
        order: [
          [require('sequelize').literal(orderLiteral), 'DESC'],
          [require('sequelize').col('Post.created_at'), 'DESC']
        ],
        ...options
      });
    } catch (error) {
      console.error("SQL Error in findFeedPosts:", error);
      throw error;
    }
  }

  async findTrendingPosts(limit: number = 10, visibilities: string[] = ['public'], currentUserId?: number, followedUserIds: number[] = []): Promise<Post[]> {
    const { Op } = require('sequelize');
    
    let whereCondition: any = { status: 'active', visibility: { [Op.in]: visibilities } };

    if (currentUserId) {
      whereCondition = {
        status: 'active',
        [Op.or]: [
          { visibility: { [Op.in]: visibilities } },
          { visibility: 'followers', userId: { [Op.in]: followedUserIds } },
          { visibility: 'followers', userId: currentUserId },
          { visibility: 'private', userId: currentUserId }
        ]
      };
    }

    return this.findAll({
      where: whereCondition,
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [
        ['likesCount', 'DESC'],
        ['viewsCount', 'DESC']
      ],
      limit
    });
  }
}
export const postRepository = new PostRepository();
