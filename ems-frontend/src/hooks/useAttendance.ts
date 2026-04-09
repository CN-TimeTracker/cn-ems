import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as attendanceService from '@/services/attendance.service';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';

export const useUpdateLateReason = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => attendanceService.updateTodayLateReason(reason),
    onSuccess: () => {
      dispatch(addToast({ type: 'success', message: 'Reason submitted successfully' }));
      // Invalidate dashboard to refresh attendance state
      queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] });
    },
    onError: (error: any) => {
      dispatch(addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit reason' 
      }));
    },
  });
};

export const usePunchIn = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: attendanceService.punchIn,
    onSuccess: () => {
      dispatch(addToast({ type: 'success', message: 'Punched in successfully' }));
      queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};
