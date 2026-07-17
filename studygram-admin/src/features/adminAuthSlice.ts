import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'moderator';
}

interface AdminAuthState {
  isAuthenticated: boolean;
  adminUser: AdminProfile | null;
  token: string | null;
  loading: boolean;
}

const savedToken = localStorage.getItem('studygram_admin_token');
const savedUserStr = localStorage.getItem('studygram_admin_user');
let savedUser: AdminProfile | null = null;
try {
  savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
} catch (e) {
  console.error('Error parsing admin user from localStorage:', e);
}

const initialState: AdminAuthState = {
  isAuthenticated: !!savedToken,
  adminUser: savedUser,
  token: savedToken,
  loading: false,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    loginAdmin(state, action: PayloadAction<{ user: AdminProfile; token: string }>) {
      state.isAuthenticated = true;
      state.adminUser = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('studygram_admin_token', action.payload.token);
      localStorage.setItem('studygram_admin_user', JSON.stringify(action.payload.user));
    },
    logoutAdmin(state) {
      state.isAuthenticated = false;
      state.adminUser = null;
      state.token = null;
      localStorage.removeItem('studygram_admin_token');
      localStorage.removeItem('studygram_admin_user');
    },
  },
});

export const { loginAdmin, logoutAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
export type { AdminAuthState };
