import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { clearCredentials } from '../store/authSlice';

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Injects JWT token from sessionStorage (via Redux) on every request
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from Redux store directly
    if (typeof window !== 'undefined') {
      const state = store.getState() as any;
      const token = state.auth?.token;
      
      if (token) {
        // Just in case it somehow still has quotes (e.g. from previous manual localStorage modifications)
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Normalises errors + handles 401 auto-logout
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    // Token expired or invalid
    if (error.response?.status === 401) {
      // Clear Redux state — this will trigger AuthGuard redirection
      store.dispatch(clearCredentials());
    }

    // Surface a readable error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;
