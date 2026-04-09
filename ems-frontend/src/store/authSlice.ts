import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    // Called on successful login — stores token + user
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token           = action.payload.token;
      state.user            = action.payload.user;
      state.isAuthenticated = true;
    },

    // Called on logout / 401 — wipes everything
    clearCredentials: (state) => {
      state.token           = null;
      state.user            = null;
      state.isAuthenticated = false;
    },

    // Called when admin updates a user profile — keeps store in sync
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateCurrentUser } =
  authSlice.actions;

export default authSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectToken           = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentUser     = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole        = (state: { auth: AuthState }) => state.auth.user?.role;
