import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface BroadcastLog {
  id: string;
  title: string;
  message: string;
  sentBy: string;
  sentAt: string;
  recipientsCount: number;
}

interface NotificationState {
  broadcasts: BroadcastLog[];
}

const mockBroadcasts: BroadcastLog[] = [
  {
    id: 'b_1',
    title: 'Platform Maintenance Alert',
    message: 'StudyGram will be offline for 30 minutes tonight for database optimization updates.',
    sentBy: 'Super Admin',
    sentAt: '2 days ago',
    recipientsCount: 1480,
  }
];

const initialState: NotificationState = {
  broadcasts: mockBroadcasts,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    sendBroadcast(state, action: PayloadAction<{ title: string; message: string; sentBy: string; recipientsCount: number }>) {
      state.broadcasts.unshift({
        id: `b_${Math.random()}`,
        title: action.payload.title,
        message: action.payload.message,
        sentBy: action.payload.sentBy,
        sentAt: 'Just now',
        recipientsCount: action.payload.recipientsCount,
      });
    }
  }
});

export const { sendBroadcast } = notificationSlice.actions;
export default notificationSlice.reducer;
export type { NotificationState };
