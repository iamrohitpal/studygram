import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Message } from './Message';
import { User } from './User';

@Table({
  tableName: 'message_statuses',
  timestamps: false,
  underscored: true
})
export class MessageStatus extends Model {
  @ForeignKey(() => Message)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  messageId!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  delivered!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  seen!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  seenAt?: Date;

  @BelongsTo(() => Message)
  message!: Message;

  @BelongsTo(() => User)
  user!: User;
}
