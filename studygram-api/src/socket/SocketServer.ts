import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../database/models/User';
import { Message } from '../database/models/Message';
import { MessageStatus } from '../database/models/MessageStatus';
import { ConversationParticipant } from '../database/models/ConversationParticipant';

export class SocketServer {
  private static instance: SocketIOServer;
  private io: SocketIOServer;
  
  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Adjust to specific frontend URL in production
        methods: ['GET', 'POST']
      }
    });
    
    SocketServer.instance = this.io;

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  public static getIO(): SocketIOServer {
    if (!SocketServer.instance) {
      throw new Error("Socket.io not initialized");
    }
    return SocketServer.instance;
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
        if (!token) return next(new Error('Authentication error: Token missing'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_token_12345') as { id: number };
        
        const user = await User.findByPk(decoded.id);
        if (!user) return next(new Error('Authentication error: User not found'));

        (socket as any).user = user;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as User;
      console.log(`Socket connected: User ${user.id} (${socket.id})`);

      // Join personal room for user-specific notifications
      socket.join(`user_${user.id}`);

      // Broadcast online status
      socket.broadcast.emit('user_online', { userId: user.id });

      socket.on('join_conversation', async (conversationId: number) => {
        // Validate access
        const participant = await ConversationParticipant.findOne({ where: { userId: user.id, conversationId } });
        if (participant) {
          socket.join(`conversation_${conversationId}`);
        }
      });

      socket.on('leave_conversation', (conversationId: number) => {
        socket.leave(`conversation_${conversationId}`);
      });

      socket.on('send_message', async (data: { conversationId: number, message: string, messageType: string, attachmentUrl?: string, replyTo?: number }) => {
        try {
          const participant = await ConversationParticipant.findOne({ where: { userId: user.id, conversationId: data.conversationId } });
          if (!participant) return;

          const newMessage = await Message.create({
            conversationId: data.conversationId,
            senderId: user.id,
            message: data.message,
            messageType: data.messageType || 'text',
            attachmentUrl: data.attachmentUrl,
            replyTo: data.replyTo
          });

          const messageWithSender = await Message.findByPk(newMessage.id, {
            include: [{ model: User, attributes: ['id', 'username', 'profileImage'] }]
          });

          // Create message statuses for all other participants
          const participants = await ConversationParticipant.findAll({ where: { conversationId: data.conversationId } });
          const statusPromises = participants
            .filter(p => p.userId !== user.id)
            .map(p => MessageStatus.create({ messageId: newMessage.id, userId: p.userId, seen: false }));
          await Promise.all(statusPromises);

          // Broadcast to conversation
          this.io.to(`conversation_${data.conversationId}`).emit('new_message', messageWithSender);
          
          // Also update conversation list for all participants
          participants.forEach(p => {
            this.io.to(`user_${p.userId}`).emit('conversation_updated', {
              conversationId: data.conversationId,
              lastMessage: messageWithSender
            });
          });

        } catch (err) {
          console.error('Error sending message via socket:', err);
        }
      });

      socket.on('typing', (data: { conversationId: number }) => {
        socket.to(`conversation_${data.conversationId}`).emit('typing', {
          conversationId: data.conversationId,
          userId: user.id,
          username: user.username
        });
      });

      socket.on('stop_typing', (data: { conversationId: number }) => {
        socket.to(`conversation_${data.conversationId}`).emit('stop_typing', {
          conversationId: data.conversationId,
          userId: user.id
        });
      });

      socket.on('message_seen', async (data: { messageId?: number, conversationId: number }) => {
        if (data.messageId) {
          await MessageStatus.update({ seen: true }, { where: { messageId: data.messageId, userId: user.id } });
        } else {
          // Find all unread messages in conversation for this user and mark as seen
          const messages = await Message.findAll({ where: { conversationId: data.conversationId } });
          const messageIds = messages.map(m => m.id);
          if (messageIds.length > 0) {
            await MessageStatus.update({ seen: true }, { where: { messageId: messageIds, userId: user.id, seen: false } });
          }
        }
        
        // Broadcast seen tracking
        socket.to(`conversation_${data.conversationId}`).emit('message_seen', {
          conversationId: data.conversationId,
          messageId: data.messageId,
          userId: user.id
        });
      });

      socket.on('check_online_status', (userIds: number[]) => {
        if (!Array.isArray(userIds)) return;
        const statuses: { [id: number]: boolean } = {};
        userIds.forEach(id => {
          const room = this.io.sockets.adapter.rooms.get(`user_${id}`);
          statuses[id] = room ? room.size > 0 : false;
        });
        socket.emit('online_status_result', statuses);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: User ${user.id} (${socket.id})`);
        socket.broadcast.emit('user_offline', { userId: user.id, lastSeen: new Date() });
      });
    });
  }
}
