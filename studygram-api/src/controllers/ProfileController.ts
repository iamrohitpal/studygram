import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { profileService } from '../services/ProfileService';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await profileService.getProfile(username, req.user?.id);
      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const files = req.files as any;
      const updatedUser = await profileService.updateProfile(userId, req.body, files);
      
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully.',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          bio: updatedUser.bio,
          profileImage: updatedUser.profileImage,
          coverImage: updatedUser.coverImage,
          coverUrl: updatedUser.coverImage,
          mobile: updatedUser.mobile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleFollow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const followerId = req.user!.id;
      const { followingId } = req.body;
      if (!followingId) throw new Error('followingId is required.');

      const result = await profileService.toggleFollow(followerId, Number(followingId));
      res.status(200).json({
        status: 'success',
        message: result.followed ? 'Followed successfully.' : 'Unfollowed successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const followers = await profileService.getFollowers(Number(userId), req.user?.id, page, limit);
      res.status(200).json({
        status: 'success',
        data: followers
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const following = await profileService.getFollowing(Number(userId), req.user?.id, page, limit);
      res.status(200).json({
        status: 'success',
        data: following
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopCreators(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const topCreators = await profileService.getTopCreators(req.user?.id, page, limit);
      res.status(200).json({
        status: 'success',
        data: topCreators
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
