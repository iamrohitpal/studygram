import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { Follower } from '../models/Follower';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { SavedPost } from '../models/SavedPost';
import { Notification } from '../models/Notification';
import { UploadReminder } from '../models/UploadReminder';
import { SocialAccount } from '../models/SocialAccount';
import { ReportedItem } from '../models/ReportedItem';

export async function seedDatabase(force = false) {
  try {
    const userCount = await User.count();
    if (userCount > 0 && !force) {
      console.log('Database already seeded. Skipping seed execution.');
      return;
    }

    console.log('Seeding Database with sample data...');

    // 1. Create Users (at least 10)
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersData = [];
    for (let i = 1; i <= 12; i++) {
      usersData.push({
        name: `User ${i}`,
        username: `user_${i}`,
        email: `user${i}@studygram.com`,
        password: hashedPassword,
        mobile: `987654321${i % 10}`,
        bio: `This is the profile bio of User ${i}. Passionate about studies!`,
        profileImage: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=150`,
        role: i === 1 ? 'superadmin' : 'user',
        status: 'active',
        emailVerified: true
      });
    }
    const createdUsers = await User.bulkCreate(usersData, { returning: true });
    console.log(`- Created ${createdUsers.length} Users`);

    // 2. Create Categories (at least 10)
    const categoriesData = [
      { name: 'Programming', slug: 'programming', icon: 'code', status: 'active' },
      { name: 'Mathematics', slug: 'mathematics', icon: 'functions', status: 'active' },
      { name: 'Science', slug: 'science', icon: 'science', status: 'active' },
      { name: 'UPSC', slug: 'upsc', icon: 'gavel', status: 'active' },
      { name: 'SSC', slug: 'ssc', icon: 'assignment', status: 'active' },
      { name: 'Language Learning', slug: 'languages', icon: 'language', status: 'active' },
      { name: 'Motivation', slug: 'motivation', icon: 'star', status: 'active' },
      { name: 'History', slug: 'history', icon: 'book', status: 'active' },
      { name: 'Geography', slug: 'geography', icon: 'public', status: 'active' },
      { name: 'Physics', slug: 'physics', icon: 'bolt', status: 'active' },
    ];
    const createdCategories = await Category.bulkCreate(categoriesData, { returning: true });
    console.log(`- Created ${createdCategories.length} Categories`);

    // 3. Create Posts (at least 10)
    const postsData = [];
    const contentTypes: Array<'image' | 'video' | 'note'> = ['image', 'video', 'note'];
    for (let i = 1; i <= 15; i++) {
      const user = createdUsers[i % createdUsers.length];
      const category = createdCategories[i % createdCategories.length];
      const cType = contentTypes[i % contentTypes.length];
      postsData.push({
        userId: user.id,
        categoryId: category.id,
        title: `Awesome ${category.name} Lesson ${i}`,
        description: `Here is some details about our latest ${category.name} notes. Let's learn together!`,
        contentType: cType,
        mediaUrl: cType === 'video' 
          ? 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4' 
          : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200',
        visibility: 'public',
        viewsCount: i * 5,
        likesCount: 0,
        commentsCount: 0,
        status: 'active'
      });
    }
    const createdPosts = await Post.bulkCreate(postsData, { returning: true });
    console.log(`- Created ${createdPosts.length} Posts`);

    // 4. Create Followers (at least 10 links)
    const followersData = [];
    for (let i = 0; i < 10; i++) {
      followersData.push({
        followerId: createdUsers[i].id,
        followingId: createdUsers[(i + 1) % createdUsers.length].id
      });
    }
    await Follower.bulkCreate(followersData);
    console.log('- Created Follower Relationships');

    // 5. Create Likes (at least 10)
    const likesData = [];
    for (let i = 0; i < 10; i++) {
      likesData.push({
        userId: createdUsers[i].id,
        postId: createdPosts[i % createdPosts.length].id
      });
    }
    await Like.bulkCreate(likesData);
    console.log('- Created Likes');

    // 6. Create Comments (at least 10)
    const commentsData = [];
    for (let i = 0; i < 10; i++) {
      commentsData.push({
        userId: createdUsers[i].id,
        postId: createdPosts[i % createdPosts.length].id,
        comment: `Excellent resources for studying! Keep it up! Post index ${i}`
      });
    }
    await Comment.bulkCreate(commentsData);
    console.log('- Created Comments');

    // 7. Create Saved Posts (at least 10)
    const savedPostsData = [];
    for (let i = 0; i < 10; i++) {
      savedPostsData.push({
        userId: createdUsers[i].id,
        postId: createdPosts[(i + 2) % createdPosts.length].id
      });
    }
    await SavedPost.bulkCreate(savedPostsData);
    console.log('- Created Saved Posts logs');

    // 8. Create Notifications (at least 10)
    const notificationsData = [];
    for (let i = 0; i < 10; i++) {
      notificationsData.push({
        userId: createdUsers[i].id,
        title: 'Welcome to StudyGram!',
        message: 'Get ready to explore amazing study notes and learning groups.',
        isRead: false
      });
    }
    await Notification.bulkCreate(notificationsData);
    console.log('- Created Notifications');

    // 9. Create Upload Reminders (at least 10)
    const remindersData = [];
    for (let i = 0; i < createdUsers.length; i++) {
      remindersData.push({
        userId: createdUsers[i].id,
        lastUploadDate: new Date(),
        reminderSent: false
      });
    }
    await UploadReminder.bulkCreate(remindersData);
    console.log('- Created Upload Reminders logs');

    // 10. Create Social Accounts (at least 10)
    const socialAccountsData = [];
    for (let i = 0; i < 10; i++) {
      socialAccountsData.push({
        userId: createdUsers[i].id,
        instagramToken: `ig_tok_mock_${i}`,
        facebookToken: `fb_tok_mock_${i}`,
        linkedinToken: `li_tok_mock_${i}`,
        youtubeToken: `yt_tok_mock_${i}`,
        twitterToken: `tw_tok_mock_${i}`
      });
    }
    await SocialAccount.bulkCreate(socialAccountsData);
    console.log('- Created Social Accounts logs');

    // 11. Create Reported Items (at least 10)
    const reportsData = [];
    for (let i = 0; i < 10; i++) {
      reportsData.push({
        targetId: createdPosts[i % createdPosts.length].id,
        targetType: 'content',
        reportedById: createdUsers[i].id,
        reason: 'Inappropriate content description/spam links',
        evidence: 'Review post context for verification',
        status: 'pending'
      });
    }
    await ReportedItem.bulkCreate(reportsData);
    console.log('- Created Reported Items logs');

    console.log('Database successfully seeded with 10+ records across all tables.');
  } catch (error: any) {
    console.error('Error seeding database:', error.message);
  }
}
