import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { User } from '../database/models/User';
import crypto from 'crypto';

export class AuthService {
  async register(data: any): Promise<User> {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) throw new Error('Email is already registered.');

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) throw new Error('Username is already taken.');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    return userRepository.create({
      ...data,
      password: hashedPassword,
      verificationToken,
      emailVerified: false
    });
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password.');
    if (user.status === 'suspended') throw new Error('Your account is currently suspended.');

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new Error('Invalid email or password.');

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user.id, uuid: user.uuid, role: user.role },
      process.env.JWT_SECRET || 'jwt_secret_token_12345',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_98765',
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_98765') as any;
      const user = await userRepository.findById(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new Error('Invalid refresh token.');
      }

      const newAccessToken = jwt.sign(
        { id: user.id, uuid: user.uuid, role: user.role },
        process.env.JWT_SECRET || 'jwt_secret_token_12345',
        { expiresIn: '1h' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_98765',
        { expiresIn: '7d' }
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new Error('Invalid or expired refresh token.');
    }
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('No user found with this email.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    await user.save();

    // In a real application, send an email here.
    return resetToken;
  }

  async resetPassword(token: string, newPass: string): Promise<void> {
    const user = await User.findOne({ where: { resetToken: token } });
    if (!user) throw new Error('Invalid or expired reset token.');

    user.password = await bcrypt.hash(newPass, 10);
    user.resetToken = null;
    await user.save();
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) throw new Error('Invalid or expired verification token.');

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();
  }

  async changePassword(userId: number, currentPass: string, newPass: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');

    const matches = await bcrypt.compare(currentPass, user.password);
    if (!matches) throw new Error('Current password does not match.');

    user.password = await bcrypt.hash(newPass, 10);
    await user.save();
  }
}
export const authService = new AuthService();
