import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'followers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['follower_id', 'following_id'] },
    { fields: ['following_id'] }
  ]
})
export class Follower extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  followerId!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  followingId!: number;

  @BelongsTo(() => User, 'followerId')
  followerUser!: User;

  @BelongsTo(() => User, 'followingId')
  followingUser!: User;
}
