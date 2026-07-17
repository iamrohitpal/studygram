import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';

class FirebaseService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase credentials not fully provided in .env. Push notifications will be skipped.');
        return;
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      this.initialized = true;
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }

  async sendPushNotification(tokens: string[], title: string, body: string, data?: { [key: string]: string }) {
    if (!this.initialized || tokens.length === 0) {
      return;
    }

    const message: MulticastMessage = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      console.log(`Successfully sent message: ${response.successCount} successes, ${response.failureCount} failures.`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

export const firebaseService = new FirebaseService();
