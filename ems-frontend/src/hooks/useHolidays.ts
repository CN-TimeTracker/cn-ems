import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holidayService } from '@/services/holiday.service';
import { addToast } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';

export const useHolidays = () => {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: holidayService.getAll,
  });
};

export const useAddHoliday = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: holidayService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      dispatch(addToast({ type: 'success', message: 'Holiday added successfully' }));
    },
    onError: (error: any) => {
      dispatch(addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to add holiday' 
      }));
    },
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date?: string; name?: string } }) => holidayService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      dispatch(addToast({ type: 'success', message: 'Holiday updated successfully' }));
    },
    onError: (error: any) => {
      dispatch(addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update holiday' 
      }));
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: holidayService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      dispatch(addToast({ type: 'success', message: 'Holiday deleted successfully' }));
    },
    onError: (error: any) => {
      dispatch(addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete holiday' 
      }));
    },
  });
};
