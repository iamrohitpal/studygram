import { BaseRepository } from './BaseRepository';
import { Notification } from '../database/models/Notification';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  async findUserNotifications(userId: number, page: number = 1, limit: number = 20): Promise<Notification[]> {
    const offset = (page - 1) * limit;
    return this.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  }
}

export const notificationRepository = new NotificationRepository();
