import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'reminder';
  senderName: string;
  senderAvatar: string;
  targetId?: string; // post ID or event ID
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: NotificationItem[];
  hasNewPosts: boolean;
  hasNewReels: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'like',
    senderName: 'Sarah Jenkins',
    senderAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    targetId: 'post_1',
    message: 'liked your React 19 architecture notes',
    timestamp: '2 mins ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'comment',
    senderName: 'Alex Mercer',
    senderAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    targetId: 'post_2',
    message: 'commented: "This is super helpful for UPSC preparation!"',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'follow',
    senderName: 'Priya Sharma',
    senderAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    message: 'started following you',
    timestamp: '5 hours ago',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'reminder',
    senderName: 'StudyGram Bot',
    senderAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    message: 'Reminder: Study group "UPSC Mains preparation" starts in 15 minutes!',
    timestamp: '1 day ago',
    isRead: true,
  },
];

const initialState: UiState = {
  themeMode: 'light',
  sidebarOpen: false,
  notifications: mockNotifications,
  hasNewPosts: false,
  hasNewReels: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
    },
    addNotification(state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>>) {
      state.notifications.unshift({
        ...action.payload,
        id: Math.random().toString(),
        timestamp: 'Just now',
        isRead: false,
      });
    },
    setHasNewPosts(state, action: PayloadAction<boolean>) {
      state.hasNewPosts = action.payload;
    },
    setHasNewReels(state, action: PayloadAction<boolean>) {
      state.hasNewReels = action.payload;
    }
  },
});

export const { toggleTheme, setTheme, toggleSidebar, markAllAsRead, addNotification, setHasNewPosts, setHasNewReels } = uiSlice.actions;
export default uiSlice.reducer;
export type { NotificationItem };
