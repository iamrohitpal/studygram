import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { chatService } from '../services/ChatService';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';

export class ChatController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await chatService.getConversations(req.user!.id);
      res.status(200).json({ status: 'success', data: conversations });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const conversation = await chatService.getConversation(Number(id), req.user!.id);
      res.status(200).json({ status: 'success', data: conversation });
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { page, limit } = req.query;
      const messages = await chatService.getMessages(
        Number(conversationId), 
        req.user!.id, 
        page ? Number(page) : 1, 
        limit ? Number(limit) : 50
      );
      res.status(200).json({ status: 'success', data: messages });
    } catch (err) {
      next(err);
    }
  }

  async createConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { otherUserId } = req.body;
      if (!otherUserId) throw new Error('otherUserId is required');
      
      const conversation = await chatService.createConversation(req.user!.id, Number(otherUserId));
      res.status(201).json({ status: 'success', data: conversation });
    } catch (err) {
      next(err);
    }
  }

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') throw new Error('Query parameter is required');
      
      const users = await chatService.searchUsers(query);
      // Filter out self
      const filtered = users.filter(u => u.id !== req.user!.id);
      res.status(200).json({ status: 'success', data: filtered });
    } catch (err) {
      next(err);
    }
  }

  async uploadAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('File is required');
      
      let contentType = 'file';
      let mediaUrl = '';

      if (req.file.mimetype.startsWith('image/')) {
        contentType = 'image';
        const uploadResult = await CloudinaryUploader.uploadImage(req.file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else if (req.file.mimetype.startsWith('video/')) {
        contentType = 'video';
        const uploadResult = await CloudinaryUploader.uploadVideo(req.file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else {
        contentType = 'file';
        const uploadResult = await CloudinaryUploader.uploadRaw(req.file.buffer, req.file.originalname);
        mediaUrl = uploadResult.secure_url;
      }

      res.status(201).json({
        status: 'success',
        data: {
          mediaUrl,
          contentType
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
