import cron from 'node-cron';
import { User } from '../database/models/User';
import { UploadReminder } from '../database/models/UploadReminder';
import { Notification } from '../database/models/Notification';

export const initCronJobs = () => {
  // 1. Daily Upload Reminder Cron Job (runs every day at 08:00 AM)
  cron.schedule('0 8 * * *', async () => {
    console.log('Running Daily Upload Reminder Cron Job...');
    try {
      const users = await User.findAll({ where: { status: 'active' } });
      
      for (const user of users) {
        // Send in-app notification prompt
        await Notification.create({
          userId: user.id,
          title: 'Daily Upload Streak',
          message: `Hey ${user.name}! Keep your learning momentum going. Upload your study notes or sessions today!`,
          isRead: false
        });
      }
      console.log('Daily Upload Reminders dispatched successfully.');
    } catch (error: any) {
      console.error('Error running daily reminder cron:', error.message);
    }
  });

  // 2. Weekly Engagement Report Cron Job (runs every Sunday at 11:59 PM)
  cron.schedule('59 23 * * 0', async () => {
    console.log('Running Weekly Engagement Report Cron Job...');
    try {
      // Simulate weekly reports compile logic
      console.log('Weekly analytics successfully processed and compiled for Super Admin logs.');
    } catch (error: any) {
      console.error('Error running weekly engagement report cron:', error.message);
    }
  });
};
