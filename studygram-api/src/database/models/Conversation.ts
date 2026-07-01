import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { ConversationParticipant } from './ConversationParticipant';
import { Message } from './Message';

@Table({
  tableName: 'conversations',
  timestamps: true,
  underscored: true
})
export class Conversation extends Model {
  @Column({
    type: DataType.ENUM('private', 'group'),
    defaultValue: 'private',
    allowNull: false
  })
  type!: 'private' | 'group';

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  name?: string; // For group chats

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  avatarUrl?: string; // For group chats

  @BelongsToMany(() => User, () => ConversationParticipant)
  participants!: User[];

  @HasMany(() => ConversationParticipant)
  participantDetails!: ConversationParticipant[];

  @HasMany(() => Message)
  messages!: Message[];
}
