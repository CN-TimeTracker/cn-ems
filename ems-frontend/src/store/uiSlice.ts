import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState, Toast } from '../types';

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState: UiState = {
  sidebarOpen: true,
  toasts: [],
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    // Sidebar toggle
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Toast notifications
    addToast: (
      state,
      action: PayloadAction<Omit<Toast, 'id'>>
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      state.toasts.push({ ...action.payload, id });
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export default uiSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectToasts      = (state: { ui: UiState }) => state.ui.toasts;
