import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UploadReminder } from '../database/models/UploadReminder';

export class ReminderController {
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      let reminder = await UploadReminder.findOne({ where: { userId } });
      if (!reminder) {
        reminder = await UploadReminder.create({
          userId,
          lastUploadDate: new Date(),
          reminderSent: false
        });
      }

      res.status(200).json({
        status: 'success',
        data: reminder
      });
    } catch (error) {
      next(error);
    }
  }

  async dismiss(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const reminder = await UploadReminder.findOne({ where: { userId } });
      if (!reminder) throw new Error('Reminder log not found.');

      reminder.reminderSent = false;
      await reminder.save();

      res.status(200).json({
        status: 'success',
        message: 'Reminder notification dismissed.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reminderController = new ReminderController();
