'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { AuthService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { addToast } from '../store/uiSlice';
import { LoginInput } from '../types';

// ─────────────────────────────────────────────
// useLogin
// Calls POST /auth/login, stores JWT + user in Redux
// ─────────────────────────────────────────────

export const useLogin = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => AuthService.login(input),

    onSuccess: (data) => {
      // 1. Persist token + user to Redux (redux-persist writes to sessionStorage)
      dispatch(setCredentials({ token: data.token, user: data.user }));

      // 2. Seed the cache so /auth/me query doesn't need a separate request
      queryClient.setQueryData(queryKeys.auth.me(), data.user);

      dispatch(addToast({ type: 'success', message: `Welcome back, ${data.user.name}!` }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useLogout
// Calls POST /auth/logout, clears Redux + cache
// ─────────────────────────────────────────────

export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),

    onSettled: () => {
      // Clear everything regardless of server response
      dispatch(clearCredentials());
      queryClient.clear();
    },
  });
};

// ─────────────────────────────────────────────
// useMe
// GET /auth/me — hydrates current user profile
// Only runs when authenticated
// ─────────────────────────────────────────────

export const useMe = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => AuthService.getMe(),
    enabled,
    staleTime: 1000 * 60 * 10, // User profile rarely changes — 10 min
  });
};
