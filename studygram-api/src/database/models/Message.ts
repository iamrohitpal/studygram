import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Conversation } from './Conversation';
import { User } from './User';
import { MessageStatus } from './MessageStatus';

@Table({
  tableName: 'messages',
  timestamps: true,
  underscored: true
})
export class Message extends Model {
  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  conversationId!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  senderId!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  message?: string;

  @Column({
    type: DataType.ENUM('text', 'image', 'video', 'pdf', 'file', 'audio', 'emoji', 'reply'),
    defaultValue: 'text',
    allowNull: false
  })
  messageType!: 'text' | 'image' | 'video' | 'pdf' | 'file' | 'audio' | 'emoji' | 'reply';

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  attachmentUrl?: string;

  @ForeignKey(() => Message)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  replyTo?: number;

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User)
  sender!: User;

  @BelongsTo(() => Message)
  repliedMessage!: Message;

  @HasMany(() => MessageStatus)
  statuses!: MessageStatus[];
}
