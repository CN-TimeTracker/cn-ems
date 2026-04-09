'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { WorkLogService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { addToast } from '../store/uiSlice';
import { CreateWorkLogInput, WorkLogFilters } from '../types';

// ─────────────────────────────────────────────
// useMyLogs           [Protected]
// Employee's own log history with optional filters
// ─────────────────────────────────────────────

export const useMyLogs = (filters?: WorkLogFilters) => {
  return useQuery({
    queryKey: queryKeys.logs.my(filters),
    queryFn:  () => WorkLogService.getMyLogs(filters),
  });
};

// ─────────────────────────────────────────────
// useTodayHours       [Protected]
// Hours logged today + remaining capacity
// Auto-refreshes every 2 minutes
// ─────────────────────────────────────────────

export const useTodayHours = () => {
  return useQuery({
    queryKey: queryKeys.logs.today(),
    queryFn:  () => WorkLogService.getTodayHours(),
    refetchInterval: 1000 * 60 * 2,
    staleTime: 0, // Always check — this is a live counter
  });
};

// ─────────────────────────────────────────────
// useAllLogs          [Admin]
// All logs with optional filters
// ─────────────────────────────────────────────

export const useAllLogs = (filters?: WorkLogFilters) => {
  return useQuery({
    queryKey: queryKeys.logs.all(filters),
    queryFn:  () => WorkLogService.getAllLogs(filters),
  });
};

// ─────────────────────────────────────────────
// useProjectHoursSummary  [Admin]
// Per-project hours chart data
// ─────────────────────────────────────────────

export const useProjectHoursSummary = () => {
  return useQuery({
    queryKey: queryKeys.logs.summary(),
    queryFn:  () => WorkLogService.getProjectHoursSummary(),
  });
};

// ─────────────────────────────────────────────
// useCreateLog        [Protected]
// Log work entry — invalidates today counter + log history
// ─────────────────────────────────────────────

export const useCreateLog = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkLogInput) =>
      WorkLogService.createLog(input),

    onSuccess: (newLog) => {
      // Immediately update today's hours counter
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.today() });
      // Refresh log history
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.my() });
      // Refresh admin views
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.summary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee() });
      // Refresh project-specific today hours
      queryClient.invalidateQueries({ queryKey: ['logs', 'my', 'project'] });

      dispatch(
        addToast({
          type: 'success',
          message: `${newLog.hours}h logged successfully`,
        })
      );
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useMyProjectTodayHours   [Protected]
// Total hours for a specific project today
// ─────────────────────────────────────────────

export const useMyProjectTodayHours = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: ['logs', 'my', 'project', projectId, 'today'],
    queryFn:  () => WorkLogService.getMyProjectTodayHours(projectId),
    enabled: !!projectId && enabled,
    staleTime: 0,
  });
};

// ─────────────────────────────────────────────
// useAdminProjectBreakdown  [Admin]
// Detailed breakdown of project hours by user
// ─────────────────────────────────────────────

export const useAdminProjectBreakdown = () => {
  return useQuery({
    queryKey: ['logs', 'admin', 'breakdown'],
    queryFn:  () => WorkLogService.getAdminProjectBreakdown(),
  });
};
