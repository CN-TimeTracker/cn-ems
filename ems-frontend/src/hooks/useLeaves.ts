'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { LeaveService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { addToast } from '../store/uiSlice';
import { CreateLeaveInput, ReviewLeaveInput, LeaveStatus } from '../types';

// ─────────────────────────────────────────────
// useLeaves           [Protected]
// Admin → all leaves (optional ?userId filter)
// Employee → own leaves only
// ─────────────────────────────────────────────

export const useLeaves = (filters?: { userId?: string }) => {
  return useQuery({
    queryKey: queryKeys.leaves.all(filters),
    queryFn:  () => LeaveService.getLeaves(filters),
  });
};

// ─────────────────────────────────────────────
// usePendingLeaves    [Admin]
// Approval queue — auto-refreshes every 3 minutes
// ─────────────────────────────────────────────

export const usePendingLeaves = () => {
  return useQuery({
    queryKey: queryKeys.leaves.pending(),
    queryFn:  () => LeaveService.getPendingLeaves(),
    refetchInterval: 1000 * 60 * 3,
  });
};

// ─────────────────────────────────────────────
// useApplyLeave       [Protected]
// ─────────────────────────────────────────────

export const useApplyLeave = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeaveInput) => LeaveService.applyLeave(input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.pending() });
      dispatch(addToast({ type: 'success', message: 'Leave application submitted' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useReviewLeave      [Admin]
// Approve or reject a leave request
// ─────────────────────────────────────────────

export const useReviewLeave = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewLeaveInput }) =>
      LeaveService.reviewLeave(id, input),

    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.pending() });
      // Refresh admin dashboard — approved leave affects accountability engine
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin() });

      const action =
        updated.status === LeaveStatus.Approved ? 'approved' : 'rejected';
      dispatch(
        addToast({
          type: updated.status === LeaveStatus.Approved ? 'success' : 'info',
          message: `Leave ${action} for ${(updated.userId as any)?.name ?? 'employee'}`,
        })
      );
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useCancelLeave      [Protected]
// Employee cancels their own pending leave
// ─────────────────────────────────────────────

export const useCancelLeave = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LeaveService.cancelLeave(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() });
      dispatch(addToast({ type: 'success', message: 'Leave request cancelled' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};
