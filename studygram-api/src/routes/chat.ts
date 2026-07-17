import { Router } from 'express';
import { chatController } from '../controllers/ChatController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/conversations', authenticateJWT, chatController.getConversations);
router.get('/conversation/:id', authenticateJWT, chatController.getConversation);
router.get('/messages/:conversationId', authenticateJWT, chatController.getMessages);
router.post('/conversation', authenticateJWT, chatController.createConversation);
router.get('/search-users', authenticateJWT, chatController.searchUsers);
router.post('/upload', authenticateJWT, upload.single('file'), chatController.uploadAttachment);

export default router;
