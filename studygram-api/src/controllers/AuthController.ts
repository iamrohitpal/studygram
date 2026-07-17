import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(211).json({
        status: 'success',
        message: 'Registration successful. Verification email sent.',
        data: {
          uuid: user.uuid,
          name: user.name,
          username: user.username,
          email: user.email,
          verificationToken: user.verificationToken // exposed for easier local/dev verification
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      res.status(200).json({
        status: 'success',
        message: 'Login successful.',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token is required.');

      const tokens = await authService.refresh(refreshToken);
      res.status(200).json({
        status: 'success',
        message: 'Tokens refreshed.',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: 'Password reset token generated.',
        data: { resetToken } // exposed for easy dev testing
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password has been reset.'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      res.status(200).json({
        status: 'success',
        message: 'Email verification successful.'
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password successfully changed.'
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out.'
    });
  }
}
export const authController = new AuthController();
