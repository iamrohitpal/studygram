import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'device_tokens',
  timestamps: true,
  underscored: true
})
export class DeviceToken extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  token!: string;

  @BelongsTo(() => User)
  user!: User;
}
