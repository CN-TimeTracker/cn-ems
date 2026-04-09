'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { TaskService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { addToast } from '../store/uiSlice';
import { CreateTaskInput, UpdateTaskInput, TaskFilters, TaskStatus } from '../types';

// ─────────────────────────────────────────────
// useTasks            [Protected]
// Accepts optional filters — re-fetches when filters change
// ─────────────────────────────────────────────

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: queryKeys.tasks.all(filters),
    queryFn:  () => TaskService.getTasks(filters),
  });
};

// ─────────────────────────────────────────────
// useMyTasks          [Protected]
// Employee's own tasks only — used on dashboard
// ─────────────────────────────────────────────

export const useMyTasks = () => {
  return useQuery({
    queryKey: queryKeys.tasks.my(),
    queryFn:  () => TaskService.getMyTasks(),
  });
};

// ─────────────────────────────────────────────
// useOverdueTasks     [Admin]
// ─────────────────────────────────────────────

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: queryKeys.tasks.overdue(),
    queryFn:  () => TaskService.getOverdueTasks(),
    // Refresh every 5 minutes — overdue list changes over time
    refetchInterval: 1000 * 60 * 5,
  });
};

// ─────────────────────────────────────────────
// useTask             [Protected]
// ─────────────────────────────────────────────

export const useTask = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn:  () => TaskService.getTaskById(id),
    enabled:  !!id,
  });
};

// ─────────────────────────────────────────────
// useCreateTask       [Admin]
// ─────────────────────────────────────────────

export const useCreateTask = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => TaskService.createTask(input),

    onSuccess: (newTask) => {
      // Invalidate all task query variants
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      dispatch(addToast({ type: 'success', message: `Task "${newTask.workType}" logged` }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useUpdateTask       [Protected]
// Includes optimistic update for status changes —
// makes the Kanban board feel instant
// ─────────────────────────────────────────────

export const useUpdateTask = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      TaskService.updateTask(id, input),

    // Optimistic update — update cache before server responds
    onMutate: async ({ id, input }) => {
      // Cancel any in-flight refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData(queryKeys.tasks.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.tasks.detail(id), (old: any) =>
        old ? { ...old, ...input } : old
      );

      return { previous, id };
    },

    onError: (error: Error, _vars, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.tasks.detail(context.id),
          context.previous
        );
      }
      dispatch(addToast({ type: 'error', message: error.message }));
    },

    onSettled: (_data, _err, { id }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },

    onSuccess: () => {
      dispatch(addToast({ type: 'success', message: 'Task updated' }));
    },
  });
};

// ─────────────────────────────────────────────
// useDeleteTask       [Admin]
// ─────────────────────────────────────────────

export const useDeleteTask = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.deleteTask(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
      dispatch(addToast({ type: 'success', message: 'Task deleted' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// Timer Hooks         [Protected]
// ─────────────────────────────────────────────

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (id: string) => TaskService.startTimer(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(queryKeys.tasks.detail(updated._id), updated);
      // Invalidate projects remaining hours too
      queryClient.invalidateQueries({ queryKey: ['projects', updated.projectId._id, 'remaining'] });
    },
    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

export const usePauseTimer = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (id: string) => TaskService.pauseTimer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.tasks.detail(updated._id), updated);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', updated.projectId._id, 'remaining'] });
    },
    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (id: string) => TaskService.stopTimer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.tasks.detail(updated._id), updated);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', updated.projectId._id, 'remaining'] });
      dispatch(addToast({ type: 'success', message: 'Task marked as Done and timer stopped' }));
    },
    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};
