import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  followersCount: number;
  followingCount: number;
  joinedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const savedToken = localStorage.getItem('studygram_token');
const savedUserJson = localStorage.getItem('studygram_user');
let savedUser: UserProfile | null = null;
if (savedUserJson) {
  try {
    savedUser = JSON.parse(savedUserJson);
  } catch (e) {
    savedUser = null;
  }
}

const initialState: AuthState = {
  isAuthenticated: !!savedToken,
  user: savedUser,
  token: savedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: any; token: string }>) {
      const formattedUser: UserProfile = {
        id: String(action.payload.user.id),
        username: action.payload.user.username,
        email: action.payload.user.email,
        fullName: action.payload.user.name || action.payload.user.username,
        bio: action.payload.user.bio || '',
        avatarUrl: action.payload.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(action.payload.user.name || action.payload.user.username || 'User')}&background=6366f1&color=fff`,
        coverUrl: action.payload.user.coverUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(action.payload.user.name || action.payload.user.username || 'User')}&background=6366f1&color=fff`,
        followersCount: action.payload.user.followersCount || 0,
        followingCount: action.payload.user.followingCount || 0,
        joinedAt: action.payload.user.createdAt || '',
      };

      state.isAuthenticated = true;
      state.user = formattedUser;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;

      localStorage.setItem('studygram_token', action.payload.token);
      localStorage.setItem('studygram_user', JSON.stringify(formattedUser));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('studygram_token');
      localStorage.removeItem('studygram_user');
    },
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('studygram_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
