import express from 'express';
import { authController } from '../controllers/AuthController';
import { postController } from '../controllers/PostController';
import { adminController } from '../controllers/AdminController';
import { profileController } from '../controllers/ProfileController';
import { categoryController } from '../controllers/CategoryController';
import { searchController } from '../controllers/SearchController';
import { notificationController } from '../controllers/NotificationController';
import { reminderController } from '../controllers/ReminderController';
import { chatController } from '../controllers/ChatController';
import { authenticateJWT, authorizeRoles, optionalAuthenticateJWT } from '../middlewares/authMiddleware';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { upload } from '../middlewares/uploadMiddleware';
import { SocialAuthController } from '../controllers/SocialAuthController';

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, email, password]
 *             properties:
 *               name: { type: string }
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               mobile: { type: string }
 *               bio: { type: string }
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/auth/register', apiRateLimiter, authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/auth/login', apiRateLimiter, authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout current user session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/auth/logout', authController.logout);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/auth/refresh', authController.refresh);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Trigger forgot password reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Verification code sent
 */
router.post('/auth/forgot-password', authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with validation token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Reset successful
 */
router.post('/auth/reset-password', authController.resetPassword);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verify email token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post('/auth/verify-email', authController.verifyEmail);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change user password (protected)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post('/auth/change-password', authenticateJWT, authController.changePassword);

/**
 * @openapi
 * /profile/{username}:
 *   get:
 *     summary: Retrieve user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profile retrieved
 */
router.get('/profile/:username', authenticateJWT, profileController.getProfile);

/**
 * @openapi
 * /profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               username: { type: string }
 *               bio: { type: string }
 *               mobile: { type: string }
 *               avatar: { type: string, format: binary }
 *               cover: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticateJWT, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), profileController.updateProfile);

/**
 * @openapi
 * /profile/fcm-token:
 *   put:
 *     summary: Update Firebase Cloud Messaging token
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken: { type: string }
 *     responses:
 *       200:
 *         description: Token updated
 */
router.put('/profile/fcm-token', authenticateJWT, profileController.updateFcmToken);

/**
 * @openapi
 * /profile/follow:
 *   post:
 *     summary: Follow or unfollow user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [followingId]
 *             properties:
 *               followingId: { type: integer }
 *     responses:
 *       200:
 *         description: Follow/unfollow complete
 */
router.post('/profile/follow', authenticateJWT, profileController.toggleFollow);

/**
 * @openapi
 * /profile/{userId}/followers:
 *   get:
 *     summary: List followers of user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Followers list
 */
router.get('/profile/:userId/followers', authenticateJWT, profileController.getFollowers);

/**
 * @openapi
 * /profile/{userId}/following:
 *   get:
 *     summary: List following of user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Following list
 */
router.get('/profile/:userId/following', authenticateJWT, profileController.getFollowing);

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a post (optionally attach file using "media" key)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               categoryId: { type: integer }
 *               visibility: { type: string, enum: [public, followers, private] }
 *               media: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Post published
 */
router.post('/posts', authenticateJWT, upload.single('media'), postController.create);

/**
 * @openapi
 * /posts/feed:
 *   get:
 *     summary: Get main feed (cached via Redis)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts list
 */
router.get('/posts/feed', optionalAuthenticateJWT, postController.getFeed);

/**
 * @openapi
 * /posts/trending:
 *   get:
 *     summary: Get trending posts (cached via Redis)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trending posts list
 */
router.get('/posts/trending', optionalAuthenticateJWT, postController.getTrending);

/**
 * @openapi
 * /posts/like:
 *   post:
 *     summary: Like/unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId]
 *             properties:
 *               postId: { type: integer }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post('/posts/like', authenticateJWT, postController.like);

/**
 * @openapi
 * /posts/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId, content]
 *             properties:
 *               postId: { type: integer }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/posts/comment', authenticateJWT, postController.comment);

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     security:
 *       - bearerAuth: []
 */
router.delete('/posts/:postId', authenticateJWT, postController.deletePost);

/**
 * @openapi
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get post comments
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Comments list
 */
router.get('/posts/:postId/comments', authenticateJWT, postController.getComments);

/**
 * @openapi
 * /posts/{postId}/likes:
 *   get:
 *     summary: Get post likes
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Likes list
 */
router.get('/posts/:postId/likes', authenticateJWT, postController.getLikes);

/**
 * @openapi
 * /posts/save:
 *   post:
 *     summary: Save/unsave a post (Bookmark)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId]
 *             properties:
 *               postId: { type: integer }
 *     responses:
 *       200:
 *         description: Bookmark updated
 */
router.post('/posts/save', authenticateJWT, postController.save);

/**
 * @openapi
 * /posts/share:
 *   post:
 *     summary: Share a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId]
 *             properties:
 *               postId: { type: integer }
 *     responses:
 *       200:
 *         description: Post shared
 */
router.post('/posts/share', authenticateJWT, postController.share);

/**
 * @openapi
 * /posts/saved:
 *   get:
 *     summary: Retrieve saved posts list
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved posts list
 */
router.get('/posts/saved', authenticateJWT, postController.getSaved);

/**
 * @openapi
 * /posts/user/{username}:
 *   get:
 *     summary: Retrieve posts uploaded by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User posts list
 */
router.get('/posts/user/:username', optionalAuthenticateJWT, postController.getUserPosts);

/**
 * @swagger
 * /posts/trending-tags:
 *   get:
 *     summary: Get dynamic trending tags
 */
router.get('/posts/trending-tags', postController.getTrendingTags);

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get single post
 *     tags: [Posts]
 */
router.get('/posts/:postId', optionalAuthenticateJWT, postController.getPost);

/**
 * @swagger
 * /users/top-creators:
 *   get:
 *     summary: Get dynamic top creators
 */
router.get('/users/top-creators', optionalAuthenticateJWT, profileController.getTopCreators);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Retrieve all active categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category list
 */
router.get('/categories', optionalAuthenticateJWT, categoryController.getCategories);

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Search users, posts, and categories
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching records
 */
router.get('/search', optionalAuthenticateJWT, searchController.search);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Fetch active notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/notifications', authenticateJWT, notificationController.getNotifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Alert marked read
 */
router.put('/notifications/:id/read', authenticateJWT, notificationController.markAsRead);

/**
 * @openapi
 * /reminders/status:
 *   get:
 *     summary: Check upload reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminder state
 */
router.get('/reminders/status', authenticateJWT, reminderController.getStatus);

/**
 * @openapi
 * /reminders/dismiss:
 *   post:
 *     summary: Dismiss alert notifications
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dismissed
 */
router.post('/reminders/dismiss', authenticateJWT, reminderController.dismiss);

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Fetch dashboard summary metrics (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 */
router.get('/admin/stats', authenticateJWT, authorizeRoles('superadmin'), adminController.getStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all users (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 */
router.get('/admin/users', authenticateJWT, authorizeRoles('superadmin'), adminController.getUsers);

/**
 * @openapi
 * /admin/users/status:
 *   post:
 *     summary: Moderate user status active/suspended (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, status]
 *             properties:
 *               userId: { type: integer }
 *               status: { type: string, enum: [active, suspended] }
 *     responses:
 *       200:
 *         description: User status modified
 */
router.post('/admin/users/status', authenticateJWT, authorizeRoles('superadmin'), adminController.moderateUserStatus);

/**
 * @openapi
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user account (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Account removed
 */
router.delete('/admin/users/:userId', authenticateJWT, authorizeRoles('superadmin'), adminController.deleteUser);

/**
 * @openapi
 * /admin/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password from Admin Panel (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/admin/users/:userId/reset-password', authenticateJWT, authorizeRoles('superadmin'), adminController.resetUserPassword);

/**
 * @openapi
 * /admin/categories:
 *   post:
 *     summary: Create new category category tag (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, icon]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               icon: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/admin/categories', authenticateJWT, authorizeRoles('superadmin'), adminController.createCategory);

/**
 * @openapi
 * /admin/categories/{categoryId}:
 *   put:
 *     summary: Update category properties (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               icon: { type: string }
 *               status: { type: string, enum: [active, disabled] }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/admin/categories/:categoryId', authenticateJWT, authorizeRoles('superadmin'), adminController.updateCategory);

/**
 * @openapi
 * /admin/categories/{categoryId}:
 *   delete:
 *     summary: Delete category tag (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete('/admin/categories/:categoryId', authenticateJWT, authorizeRoles('superadmin'), adminController.deleteCategory);

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     summary: Fetch content & user flags list (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports list
 */
router.get('/admin/reports', authenticateJWT, authorizeRoles('superadmin'), adminController.getReports);

/**
 * @openapi
 * /admin/reports/{reportId}/resolve:
 *   post:
 *     summary: Resolve reported flags (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [keep, remove] }
 *     responses:
 *       200:
 *         description: Resolved
 */
router.post('/admin/reports/:reportId/resolve', authenticateJWT, authorizeRoles('superadmin'), adminController.resolveReport);

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     summary: Fetch platform uploads breakdown data (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 */
router.get('/admin/analytics', authenticateJWT, authorizeRoles('superadmin'), adminController.getPlatformAnalytics);

/**
 * @openapi
 * /admin/social:
 *   get:
 *     summary: Get admin social media API integration settings (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Social API settings
 */
router.get('/admin/social', authenticateJWT, authorizeRoles('superadmin'), adminController.getSocialSettings);

/**
 * @openapi
 * /admin/social:
 *   put:
 *     summary: Update admin social media API integration settings (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instagramKey: { type: string }
 *               facebookKey: { type: string }
 *               linkedinKey: { type: string }
 *               youtubeKey: { type: string }
 *               xKey: { type: string }
 *     responses:
 *       200:
 *         description: Settings saved
 */
router.put('/admin/social', authenticateJWT, authorizeRoles('superadmin'), adminController.updateSocialSettings);

// CHAT ROUTES
/**
 * @openapi
 * /chat/conversations:
 *   get:
 *     summary: Get user conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/chat/conversations', authenticateJWT, chatController.getConversations);

/**
 * @openapi
 * /chat/conversation/{id}:
 *   get:
 *     summary: Get conversation details
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/chat/conversation/:id', authenticateJWT, chatController.getConversation);

/**
 * @openapi
 * /chat/messages/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/chat/messages/:conversationId', authenticateJWT, chatController.getMessages);

/**
 * @openapi
 * /chat/conversation:
 *   post:
 *     summary: Create new conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.post('/chat/conversation', authenticateJWT, chatController.createConversation);

/**
 * @openapi
 * /chat/search-users:
 *   get:
 *     summary: Search users for chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/chat/search-users', authenticateJWT, chatController.searchUsers);

/**
 * @openapi
 * /chat/upload:
 *   post:
 *     summary: Upload chat attachment
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.post('/chat/upload', authenticateJWT, upload.single('file'), chatController.uploadAttachment);

// Social Auth routes
router.get('/social-auth/accounts', authenticateJWT, SocialAuthController.getAccounts);
router.post('/social-auth/connect/:platform', authenticateJWT, SocialAuthController.connectAccount);
router.delete('/social-auth/disconnect/:platform', authenticateJWT, SocialAuthController.disconnectAccount);

export default router;
