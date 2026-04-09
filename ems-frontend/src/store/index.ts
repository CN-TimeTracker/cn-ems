import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // sessionStorage

import authReducer from './authSlice';
import uiReducer   from './uiSlice';

// ─────────────────────────────────────────────
// PERSIST CONFIG
// Only auth is persisted — token survives refresh in the current tab.
// UI state resets on every load (sidebar, toasts).
// sessionStorage isolates logins per tab.
// ─────────────────────────────────────────────

const authPersistConfig = {
  key:     'ems-auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui:   uiReducer, // Not persisted — UI resets fresh
});

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Required when using redux-persist — avoids serialization warnings
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
