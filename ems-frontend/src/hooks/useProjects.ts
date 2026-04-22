'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ProjectService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { addToast } from '../store/uiSlice';
import { CreateProjectInput, UpdateProjectInput } from '../types';

// ─────────────────────────────────────────────
// useAllProjects      [Protected]
// ─────────────────────────────────────────────

export const useAllProjects = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn:  () => ProjectService.getAllProjects(),
    enabled
  });
};

// ─────────────────────────────────────────────
// useActiveProjects   [Protected]
// For dropdowns in task/log forms
// ─────────────────────────────────────────────

export const useActiveProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.active(),
    queryFn:  () => ProjectService.getActiveProjects(),
    staleTime: 1000 * 60 * 3,
  });
};

// ─────────────────────────────────────────────
// useProject          [Protected]
// ─────────────────────────────────────────────

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn:  () => ProjectService.getProjectById(id),
    enabled:  !!id,
  });
};

// ─────────────────────────────────────────────
// useCreateProject    [Admin]
// ─────────────────────────────────────────────

export const useCreateProject = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      ProjectService.createProject(input),

    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.active() });
      dispatch(addToast({ type: 'success', message: `Project "${newProject.name}" created` }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useUpdateProject    [Admin]
// ─────────────────────────────────────────────

export const useUpdateProject = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      ProjectService.updateProject(id, input),

    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.projects.detail(updated._id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.active() });
      dispatch(addToast({ type: 'success', message: 'Project updated' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// useDeleteProject    [Admin]
// ─────────────────────────────────────────────

export const useDeleteProject = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProjectService.deleteProject(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.active() });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      dispatch(addToast({ type: 'success', message: 'Project deleted' }));
    },

    onError: (error: Error) => {
      dispatch(addToast({ type: 'error', message: error.message }));
    },
  });
};

// ─────────────────────────────────────────────
// Timer & Assignment hooks
// ─────────────────────────────────────────────

export const useAssignedProjects = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.assigned(),
    queryFn:  () => ProjectService.getAssignedProjects(),
    enabled
  });
};

export const useProjectRemainingHours = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.remaining(id),
    queryFn:  () => ProjectService.getProjectRemainingHours(id),
    enabled: !!id,
    refetchInterval: 1000 * 60, // Refresh every minute
  });
};
