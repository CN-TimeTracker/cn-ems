'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services';
import { queryKeys } from '../lib/queryKeys';
import { UserRole } from '../types';

// ─────────────────────────────────────────────
// useAdminDashboard   [Admin]
// Accountability snapshot — refreshes every 5 minutes
// ─────────────────────────────────────────────

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.admin(),
    queryFn:  () => DashboardService.getAdminDashboard(),
    // Live accountability data — refresh every 5 minutes
    refetchInterval: 1000 * 60 * 5,
    staleTime: 0,
  });
};

// ─────────────────────────────────────────────
// useEmployeeDashboard  [Protected]
// Personal snapshot for the logged-in employee
// ─────────────────────────────────────────────

export const useEmployeeDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.employee(),
    queryFn:  () => DashboardService.getEmployeeDashboard(),
    refetchInterval: 1000 * 60 * 3,
    staleTime: 0,
  });
};

// ─────────────────────────────────────────────
// useDashboard  — role-aware convenience hook
// Returns the right dashboard based on user role.
// Components call this and don't need to branch.
// ─────────────────────────────────────────────

export const useDashboard = (role?: UserRole) => {
  const isAdmin = role === UserRole.Admin;

  const adminQuery    = useAdminDashboard();
  const employeeQuery = useEmployeeDashboard();

  return isAdmin ? adminQuery : employeeQuery;
};
