import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../database/models/User';
import { Post } from '../database/models/Post';
import { Category } from '../database/models/Category';
import { ReportedItem } from '../database/models/ReportedItem';
import { SocialAccount } from '../database/models/SocialAccount';
import bcrypt from 'bcryptjs';

export class AdminController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const totalUsers = await User.count();
      const totalPosts = await Post.count();
      const totalCategories = await Category.count();
      const pendingReports = await ReportedItem.count({ where: { status: 'pending' } });

      res.status(200).json({
        status: 'success',
        data: {
          totalUsers,
          totalPosts,
          totalCategories,
          pendingReports
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const users = await User.findAll({ 
        attributes: { exclude: ['password'] },
        limit,
        offset
      });
      res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, status } = req.body;
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found.');

      user.status = status;
      await user.save();

      res.status(200).json({
        status: 'success',
        message: `User status changed to ${status}.`
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await User.destroy({ where: { id: userId } });

      res.status(200).json({
        status: 'success',
        message: 'User account has been deleted.'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) throw new Error('newPassword is required.');

      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found.');

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'User password reset successful.'
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, slug, icon } = req.body;
      const category = await Category.create({ name, slug, icon, status: 'active' });

      res.status(211).json({
        status: 'success',
        message: 'Category created.',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const { name, slug, icon, status } = req.body;

      const category = await Category.findByPk(categoryId);
      if (!category) throw new Error('Category not found.');

      if (name) category.name = name;
      if (slug) category.slug = slug;
      if (icon) category.icon = icon;
      if (status) category.status = status;

      await category.save();

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully.',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      await Category.destroy({ where: { id: categoryId } });

      res.status(200).json({
        status: 'success',
        message: 'Category deleted.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const reports = await ReportedItem.findAll({
        order: [['created_at', 'DESC']],
        limit,
        offset
      });
      res.status(200).json({
        status: 'success',
        data: reports
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params;
      const { action } = req.body; // 'keep' or 'remove'

      const report = await ReportedItem.findByPk(reportId);
      if (!report) throw new Error('Report not found.');

      if (action === 'remove') {
        // Delete or suspend the post/comment associated
        if (report.targetType === 'content') {
          await Post.destroy({ where: { id: report.targetId } });
        }
      }

      report.status = 'resolved';
      await report.save();

      res.status(200).json({
        status: 'success',
        message: `Report resolved with action: ${action}.`
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlatformAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const imagesCount = await Post.count({ where: { contentType: 'image' } });
      const videosCount = await Post.count({ where: { contentType: 'video' } });
      const notesCount = await Post.count({ where: { contentType: 'note' } });

      const rolesBreakdown = {
        user: await User.count({ where: { role: 'user' } }),
        superadmin: await User.count({ where: { role: 'superadmin' } })
      };

      res.status(200).json({
        status: 'success',
        data: {
          postsByType: {
            images: imagesCount,
            videos: videosCount,
            notes: notesCount
          },
          usersByRole: rolesBreakdown
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async getSocialSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const record = await SocialAccount.findOne({ where: { userId: adminId } });
      res.status(200).json({
        status: 'success',
        data: {
          instagramKey: record?.instagramToken || '',
          facebookKey: record?.facebookToken || '',
          linkedinKey: record?.linkedinToken || '',
          youtubeKey: record?.youtubeToken || '',
          xKey: record?.twitterToken || '',
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSocialSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { instagramKey, facebookKey, linkedinKey, youtubeKey, xKey } = req.body;

      const [record] = await SocialAccount.findOrCreate({
        where: { userId: adminId },
        defaults: {
          userId: adminId,
          instagramToken: '',
          facebookToken: '',
          linkedinToken: '',
          youtubeToken: '',
          twitterToken: '',
        }
      });

      if (instagramKey !== undefined) record.instagramToken = instagramKey;
      if (facebookKey !== undefined) record.facebookToken = facebookKey;
      if (linkedinKey !== undefined) record.linkedinToken = linkedinKey;
      if (youtubeKey !== undefined) record.youtubeToken = youtubeKey;
      if (xKey !== undefined) record.twitterToken = xKey;

      await record.save();

      res.status(200).json({
        status: 'success',
        message: 'Social integration settings saved successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}
export const adminController = new AdminController();
