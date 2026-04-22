'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { UserService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { addToast } from '../store/uiSlice';
import { CreateUserInput, UpdateUserInput } from '../types';

// ─────────────────────────────────────────────
// useAllUsers     [Admin]
// ─────────────────────────────────────────────

export const useAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn:  () => UserService.getAllUsers(),
  });
};

// ─────────────────────────────────────────────
// useActiveEmployees  [Protected]
// Used in task assignment dropdowns
// ─────────────────────────────────────────────

export const useActiveEmployees = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.active(),
    queryFn:  () => UserService.getActiveEmployees(),
    staleTime: 1000 * 60 * 5,
    enabled
  });
};

// ─────────────────────────────────────────────
// useUser         [Admin]
// ─────────────────────────────────────────────

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn:  () => UserService.getUserById(id),
    enabled:  !!id,
  });
};

// ─────────────────────────────────────────────
// useCreateUser   [Admin]
// ─────────────────────────────────────────────

export const useCreateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => UserService.createUser(input),

    onSuccess: (newUser) => {
      // Invalidate both lists so they refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.active() });
      dispatch(addToast({ type: 'success', message: `${newUser.name} added successfully` }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useUpdateUser   [Admin]
// ─────────────────────────────────────────────

export const useUpdateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      UserService.updateUser(id, input),

    onSuccess: (updatedUser) => {
      // Update the specific user in cache without refetching the list
      queryClient.setQueryData(queryKeys.users.detail(updatedUser._id), updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.active() });
      dispatch(addToast({ type: 'success', message: 'User updated successfully' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useDeactivateUser  [Admin]
// ─────────────────────────────────────────────

export const useDeactivateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.deactivateUser(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.active() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      dispatch(addToast({ type: 'success', message: 'User deactivated' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useActivateUser    [Admin]
// ─────────────────────────────────────────────

export const useActivateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.activateUser(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.active() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      dispatch(addToast({ type: 'success', message: 'User activated' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};
