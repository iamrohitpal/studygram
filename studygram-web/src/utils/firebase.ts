import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { apiClient } from "./apiClient";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging: any = null;

export const initializeFirebase = () => {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase configuration is missing. Push notifications are disabled.");
      return;
    }
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      let registration = null;
      if ('serviceWorker' in navigator) {
        const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&projectId=${firebaseConfig.projectId}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}&authDomain=${firebaseConfig.authDomain}&storageBucket=${firebaseConfig.storageBucket}`;
        registration = await navigator.serviceWorker.register(swUrl);
      }

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration || undefined
      });
      if (token) {
        await apiClient.put('/profile/fcm-token', { fcmToken: token });
        console.log('FCM Token registered successfully.');
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

export const setupMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};
