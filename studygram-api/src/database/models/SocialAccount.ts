import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'social_accounts',
  timestamps: true,
  underscored: true
})
export class SocialAccount extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  instagramToken!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  facebookToken!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  linkedinToken!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  youtubeToken!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  twitterToken!: string;

  @BelongsTo(() => User)
  user!: User;
}
