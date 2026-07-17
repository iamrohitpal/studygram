import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminUiState {
  themeMode: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

const initialState: AdminUiState = {
  themeMode: 'light',
  sidebarCollapsed: false,
};

const adminUiSlice = createSlice({
  name: 'adminUi',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar } = adminUiSlice.actions;
export default adminUiSlice.reducer;
