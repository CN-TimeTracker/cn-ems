// Auth
export { useLogin, useLogout, useMe } from './useAuth';

// Users
export {
  useAllUsers,
  useActiveEmployees,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useActivateUser,
} from './useUsers';

// Projects
export {
  useAllProjects,
  useActiveProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAssignedProjects,
  useProjectRemainingHours,
} from './useProjects';

// Tasks
export {
  useTasks,
  useMyTasks,
  useOverdueTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useStartTimer,
  usePauseTimer,
  useStopTimer,
} from './useTasks';

// Work Logs
export {
  useMyLogs,
  useTodayHours,
  useAllLogs,
  useProjectHoursSummary,
  useCreateLog,
  useMyProjectTodayHours,
  useAdminProjectBreakdown,
} from './useWorkLogs';

// Leaves
export {
  useLeaves,
  usePendingLeaves,
  useApplyLeave,
  useReviewLeave,
  useCancelLeave,
} from './useLeaves';

// Attendance
export { useUpdateLateReason, usePunchIn } from './useAttendance';

// Dashboard
export {
  useAdminDashboard,
  useEmployeeDashboard,
  useDashboard,
} from './useDashboard';

// Session
export * from './useMidnightLogout';
export * from './useHolidays';
