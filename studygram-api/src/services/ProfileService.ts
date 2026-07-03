import { userRepository } from '../repositories/UserRepository';
import { followerRepository } from '../repositories/FollowerRepository';
import { Follower } from '../database/models/Follower';
import { User } from '../database/models/User';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';

export class ProfileService {
  async getProfile(username: string, currentUserId?: number): Promise<any> {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error('User not found.');

    const followersCount = await Follower.count({ where: { followingId: user.id } });
    const followingCount = await Follower.count({ where: { followerId: user.id } });
    
    let isFollowing = false;
    if (currentUserId) {
      const followRecord = await Follower.findOne({ where: { followerId: currentUserId, followingId: user.id } });
      isFollowing = !!followRecord;
    }

    return {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      coverUrl: user.coverImage, // backward compatibility
      bio: user.bio,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      followersCount,
      followingCount,
      isFollowing,
      createdAt: user.createdAt
    };
  }

  async updateProfile(userId: number, data: any, files?: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] }): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');

    if (data.username && data.username !== user.username) {
      const existing = await userRepository.findByUsername(data.username);
      if (existing) throw new Error('Username is already taken.');
      user.username = data.username;
    }

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.mobile) user.mobile = data.mobile;

    // Handle avatar file upload
    if (files && files.avatar && files.avatar[0]) {
      const uploadRes = await CloudinaryUploader.uploadImage(files.avatar[0].buffer);
      user.profileImage = uploadRes.secure_url;
    } else if (data.profileImage) {
      user.profileImage = data.profileImage;
    }

    // Handle cover file upload
    if (files && files.cover && files.cover[0]) {
      const uploadRes = await CloudinaryUploader.uploadImage(files.cover[0].buffer);
      user.coverImage = uploadRes.secure_url;
    } else if (data.coverImage) {
      user.coverImage = data.coverImage;
    }

    await user.save();
    return user;
  }

  async toggleFollow(followerId: number, followingId: number): Promise<{ followed: boolean }> {
    if (followerId === followingId) throw new Error('You cannot follow yourself.');

    const targetUser = await userRepository.findById(followingId);
    if (!targetUser) throw new Error('Target user not found.');

    const existingFollow = await Follower.findOne({ where: { followerId, followingId } });
    if (existingFollow) {
      await existingFollow.destroy();
      return { followed: false };
    } else {
      await Follower.create({ followerId, followingId });
      return { followed: true };
    }
  }

  async getFollowers(userId: number, currentUserId?: number, page: number = 1, limit: number = 20): Promise<any[]> {
    const offset = (page - 1) * limit;
    const followers = await followerRepository.findFollowers(userId, { limit, offset });
    let followingIds = new Set<number>();
    if (currentUserId) {
      const currentUserFollowing = await Follower.findAll({ where: { followerId: currentUserId } });
      followingIds = new Set(currentUserFollowing.map(f => f.followingId));
    }

    return followers.map(f => {
      const data = f.toJSON();
      data.follower = data.followerUser;
      data.follower.isFollowing = followingIds.has(data.follower.id);
      delete data.followerUser;
      return data;
    });
  }

  async getFollowing(userId: number, currentUserId?: number, page: number = 1, limit: number = 20): Promise<any[]> {
    const offset = (page - 1) * limit;
    const following = await followerRepository.findFollowing(userId, { limit, offset });
    let followingIds = new Set<number>();
    if (currentUserId) {
      const currentUserFollowing = await Follower.findAll({ where: { followerId: currentUserId } });
      followingIds = new Set(currentUserFollowing.map(f => f.followingId));
    }

    return following.map(f => {
      const data = f.toJSON();
      data.following = data.followingUser;
      data.following.isFollowing = followingIds.has(data.following.id);
      delete data.followingUser;
      return data;
    });
  }

  async getTopCreators(currentUserId?: number, page: number = 1, limit: number = 10): Promise<any[]> {
    const offset = (page - 1) * limit;
    const users = await User.findAll({
      where: { status: 'active', role: 'user' },
      attributes: ['id', 'name', 'username', 'profileImage'],
      limit,
      offset
    });
    
    // Fallback if no users
    if (users.length === 0) {
      return [
        { id: 9991, name: 'Alice Walker', handle: '@alicestudies', posts: 142, isFollowing: false },
        { id: 9992, name: 'Dr. Jane Smith', handle: '@janesmith', posts: 89, isFollowing: false },
        { id: 9993, name: 'Code Ninja', handle: '@codeninja', posts: 320, isFollowing: false }
      ];
    }

    let followingIds = new Set<number>();
    if (currentUserId) {
      const currentUserFollowing = await Follower.findAll({ where: { followerId: currentUserId } });
      followingIds = new Set(currentUserFollowing.map(f => f.followingId));
    }
    
    return users.map(u => ({
      id: u.id,
      name: u.name,
      handle: `@${u.username}`,
      profileImage: u.profileImage,
      posts: Math.floor(Math.random() * 200) + 10, // Dynamic mockup count
      isFollowing: followingIds.has(u.id)
    })).filter(u => u.id !== currentUserId); // don't suggest the current user
  }
}

export const profileService = new ProfileService();
