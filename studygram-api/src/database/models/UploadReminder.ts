import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'upload_reminders',
  timestamps: true,
  underscored: true
})
export class UploadReminder extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastUploadDate!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  reminderSent!: boolean;

  @BelongsTo(() => User)
  user!: User;
}
