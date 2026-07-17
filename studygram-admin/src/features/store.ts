import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './adminAuthSlice';
import adminUiReducer from './adminUiSlice';
import moderationReducer from './moderationSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    adminUi: adminUiReducer,
    moderation: moderationReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
