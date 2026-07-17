import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Conversation } from './Conversation';
import { User } from './User';

@Table({
  tableName: 'conversation_participants',
  timestamps: true,
  underscored: true
})
export class ConversationParticipant extends Model {
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
  userId!: number;

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User)
  user!: User;
}
