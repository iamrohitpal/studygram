import { Conversation } from '../database/models/Conversation';
import { ConversationParticipant } from '../database/models/ConversationParticipant';
import { Message } from '../database/models/Message';
import { MessageStatus } from '../database/models/MessageStatus';
import { User } from '../database/models/User';
import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';

export class ChatService {
  async getConversations(userId: number) {
    const participants = await ConversationParticipant.findAll({
      where: { userId },
      attributes: ['conversationId']
    });

    const conversationIds = participants.map(p => p.conversationId);
    if (conversationIds.length === 0) return [];

    const conversations = await Conversation.findAll({
      where: { id: conversationIds },
      include: [
        {
          model: ConversationParticipant,
          include: [{ model: User, attributes: ['id', 'username', 'name', 'profileImage'] }]
        },
        {
          model: Message,
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{ model: MessageStatus }]
        }
      ],
      order: [
        // Sequelize struggles with nested ordering sometimes, we might need to sort in JS
      ]
    });

    const formattedPromises = conversations.map(async c => {
      const participants = c.participantDetails.map(pd => pd.user);
      const otherUser = participants.find(u => u.id !== userId) || participants[0]; // Self chat fallback
      
      const lastMessage = c.messages && c.messages.length > 0 ? c.messages[0] : null;
      
      const unreadCount = await MessageStatus.count({
        where: { userId, seen: false },
        include: [{
          model: Message,
          where: { conversationId: c.id },
          required: true
        }]
      });
      
      return {
        id: c.id,
        type: c.type,
        name: c.type === 'private' ? otherUser.name : c.name,
        avatar: c.type === 'private' ? otherUser.profileImage : c.avatarUrl,
        unreadCount,
        lastMessage: lastMessage ? {
          text: lastMessage.messageType === 'text' ? lastMessage.message : `[${lastMessage.messageType}]`,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        } : null,
        participants
      };
    });

    return (await Promise.all(formattedPromises)).sort((a, b) => {
      const t1 = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const t2 = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return t2 - t1;
    });
  }

  async getConversation(conversationId: number, userId: number) {
    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId }
    });
    if (!participant) throw new Error('Unauthorized');

    return Conversation.findByPk(conversationId, {
      include: [
        {
          model: ConversationParticipant,
          include: [{ model: User, attributes: ['id', 'username', 'name', 'profileImage'] }]
        }
      ]
    });
  }

  async getMessages(conversationId: number, userId: number, page: number = 1, limit: number = 50) {
    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId }
    });
    if (!participant) throw new Error('Unauthorized');

    const offset = (page - 1) * limit;
    return Message.findAndCountAll({
      where: { conversationId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, attributes: ['id', 'username', 'profileImage'] },
        { model: MessageStatus, where: { userId }, required: false } // Get status for current user
      ]
    });
  }

  async createConversation(userId: number, otherUserId: number) {
    if (userId === otherUserId) throw new Error('Cannot create conversation with yourself');

    // Check if private conversation already exists
    const myConversations = await ConversationParticipant.findAll({ where: { userId }, attributes: ['conversationId'] });
    const otherConversations = await ConversationParticipant.findAll({ where: { userId: otherUserId }, attributes: ['conversationId'] });
    
    const myIds = myConversations.map(c => c.conversationId);
    const otherIds = otherConversations.map(c => c.conversationId);
    const commonIds = myIds.filter(id => otherIds.includes(id));

    if (commonIds.length > 0) {
      // Find the private one
      const existing = await Conversation.findOne({ where: { id: commonIds, type: 'private' } });
      if (existing) return existing;
    }

    const t = await sequelize.transaction();
    try {
      const conv = await Conversation.create({ type: 'private' }, { transaction: t });
      await ConversationParticipant.bulkCreate([
        { conversationId: conv.id, userId },
        { conversationId: conv.id, userId: otherUserId }
      ], { transaction: t });
      await t.commit();
      return conv;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async searchUsers(query: string) {
    return User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { name: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'name', 'profileImage'],
      limit: 10
    });
  }
}

export const chatService = new ChatService();
