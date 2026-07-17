import { BaseRepository } from './BaseRepository';
import { User } from '../database/models/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return this.findOne({ where: { uuid } });
  }
}
export const userRepository = new UserRepository();
