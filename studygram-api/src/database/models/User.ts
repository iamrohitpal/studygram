import { Table, Column, Model, DataType, HasMany, HasOne } from 'sequelize-typescript';
import { Post } from './Post';
import { Like } from './Like';
import { Comment } from './Comment';
import { SavedPost } from './SavedPost';
import { Notification } from './Notification';
import { UploadReminder } from './UploadReminder';
import { SocialAccount } from './SocialAccount';
import { ConversationParticipant } from './ConversationParticipant';
import { Message } from './Message';
import { MessageStatus } from './MessageStatus';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    unique: true
  })
  uuid!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  mobile!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  })
  profileImage!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
  })
  coverImage!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  bio!: string;

  @Column({
    type: DataType.ENUM('user', 'superadmin'),
    defaultValue: 'user',
    allowNull: false
  })
  role!: 'user' | 'superadmin';

  @Column({
    type: DataType.ENUM('active', 'suspended'),
    defaultValue: 'active',
    allowNull: false
  })
  status!: 'active' | 'suspended';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  emailVerified!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastLogin!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  verificationToken!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  resetToken!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  refreshToken!: string | null;

  // Associations
  @HasMany(() => Post)
  posts!: Post[];

  @HasMany(() => Like)
  likes!: Like[];

  @HasMany(() => Comment)
  comments!: Comment[];

  @HasMany(() => SavedPost)
  savedPosts!: SavedPost[];

  @HasMany(() => Notification)
  notifications!: Notification[];

  @HasOne(() => UploadReminder)
  uploadReminder!: UploadReminder;

  @HasMany(() => SocialAccount)
  socialAccounts!: SocialAccount[];

  @HasMany(() => ConversationParticipant)
  conversations!: ConversationParticipant[];

  @HasMany(() => Message, 'senderId')
  sentMessages!: Message[];

  @HasMany(() => MessageStatus)
  messageStatuses!: MessageStatus[];
}
