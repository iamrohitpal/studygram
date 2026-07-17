import { BaseRepository } from './BaseRepository';
import { Follower } from '../database/models/Follower';
import { User } from '../database/models/User';

export class FollowerRepository extends BaseRepository<Follower> {
  constructor() {
    super(Follower);
  }

  async findFollowers(userId: number, options: any = {}): Promise<Follower[]> {
    return this.findAll({
      where: { followingId: userId },
      include: [
        { model: User, as: 'followerUser', attributes: ['id', 'name', 'username', 'profileImage', 'bio'] }
      ],
      ...options
    });
  }

  async findFollowing(userId: number, options: any = {}): Promise<Follower[]> {
    return this.findAll({
      where: { followerId: userId },
      include: [
        { model: User, as: 'followingUser', attributes: ['id', 'name', 'username', 'profileImage', 'bio'] }
      ],
      ...options
    });
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.findOne({
      where: { followerId, followingId }
    });
    return !!follow;
  }
}

export const followerRepository = new FollowerRepository();
