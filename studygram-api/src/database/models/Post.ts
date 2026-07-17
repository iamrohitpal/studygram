import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Category } from './Category';
import { Like } from './Like';
import { Comment } from './Comment';
import { SavedPost } from './SavedPost';

@Table({
  tableName: 'posts',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category_id'] },
    { fields: ['status', 'visibility', 'created_at'] },
    { fields: ['engagement_score'] }
  ]
})
export class Post extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  categoryId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;

  @Column({
    type: DataType.ENUM('image', 'video', 'note'),
    allowNull: false
  })
  contentType!: 'image' | 'video' | 'note';

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  mediaUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  thumbnailUrl!: string;

  @Column({
    type: DataType.ENUM('public', 'registered', 'followers', 'private'),
    defaultValue: 'public',
    allowNull: false
  })
  visibility!: 'public' | 'followers' | 'private';

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  viewsCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  likesCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  commentsCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  savesCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  sharesCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  engagementScore!: number;

  @Column({
    type: DataType.ENUM('active', 'flagged', 'hidden'),
    defaultValue: 'active',
    allowNull: false
  })
  status!: 'active' | 'flagged' | 'hidden';

  // Associations
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Category)
  category!: Category;

  @HasMany(() => Like)
  likes!: Like[];

  @HasMany(() => Comment)
  comments!: Comment[];

  @HasMany(() => SavedPost)
  savedPosts!: SavedPost[];
}
