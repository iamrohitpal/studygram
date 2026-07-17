import { notificationRepository } from '../repositories/NotificationRepository';
import { Notification } from '../database/models/Notification';

export class NotificationService {
  async getUserNotifications(userId: number, page: number = 1, limit: number = 20): Promise<Notification[]> {
    return notificationRepository.findUserNotifications(userId, page, limit);
  }

  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found.');
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async createNotification(userId: number, title: string, message: string): Promise<Notification> {
    return notificationRepository.create({
      userId,
      title,
      message,
      isRead: false
    });
  }
}

export const notificationService = new NotificationService();
