import { Request, Response } from 'express';
import { SocialAccount } from '../database/models/SocialAccount';
import { AuthRequest } from '../middlewares/authMiddleware';

export class SocialAuthController {
  public static async getAccounts(req: AuthRequest, res: Response) {
    try {
      let accounts = await SocialAccount.findOne({ where: { userId: req.user!.id } });
      if (!accounts) {
        accounts = await SocialAccount.create({ userId: req.user!.id });
      }

      res.json({
        instagram: !!accounts.instagramToken,
        facebook: !!accounts.facebookToken,
        linkedin: !!accounts.linkedinToken,
        youtube: !!accounts.youtubeToken,
        twitter: !!accounts.twitterToken,
      });
    } catch (error) {
      console.error('Error fetching social accounts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async connectAccount(req: AuthRequest, res: Response) {
    try {
      const { platform } = req.params;
      const validPlatforms = ['instagram', 'facebook', 'linkedin', 'youtube', 'twitter'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ message: 'Invalid platform' });
      }

      let accounts = await SocialAccount.findOne({ where: { userId: req.user!.id } });
      if (!accounts) {
        accounts = await SocialAccount.create({ userId: req.user!.id });
      }

      // Mock connecting by saving a fake token
      const mockToken = `mock_${platform}_token_${Date.now()}`;
      (accounts as any)[`${platform}Token`] = mockToken;
      await accounts.save();

      res.json({ success: true, message: `Successfully connected to ${platform}` });
    } catch (error) {
      console.error('Error connecting social account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async disconnectAccount(req: AuthRequest, res: Response) {
    try {
      const { platform } = req.params;
      const validPlatforms = ['instagram', 'facebook', 'linkedin', 'youtube', 'twitter'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ message: 'Invalid platform' });
      }

      let accounts = await SocialAccount.findOne({ where: { userId: req.user!.id } });
      if (accounts) {
        (accounts as any)[`${platform}Token`] = null;
        await accounts.save();
      }

      res.json({ success: true, message: `Successfully disconnected from ${platform}` });
    } catch (error) {
      console.error('Error disconnecting social account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
