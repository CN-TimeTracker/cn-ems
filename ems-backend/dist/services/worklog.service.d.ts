import { IWorkLog, ICreateWorkLogInput, IWorkLogFilters } from '../interfaces';
export declare class WorkLogService {
    /**
     * Creates a work log entry.
     *
     * Rules enforced here:
     *   1. User can only log against tasks assigned to them.
     *   2. Total hours logged per day (across all entries) cannot exceed 10.
     *   3. Cannot log if an approved leave exists for that day.
     */
    createLog(userId: string, input: ICreateWorkLogInput): Promise<IWorkLog>;
    /**
     * Returns logs for the calling user with optional date-range filter.
     */
    getMyLogs(userId: string, filters: IWorkLogFilters): Promise<IWorkLog[]>;
    /**
     * Admin: returns all logs across all users with optional filters.
     */
    getAllLogs(filters: IWorkLogFilters): Promise<IWorkLog[]>;
    /**
     * Returns total hours logged by a user on a specific date.
     * Used for dashboard stats and daily cap validation.
     */
    getTodayHoursForUser(userId: string, date?: Date): Promise<number>;
    /**
     * Returns every user who has logged at least one entry today.
     * Used by the accountability engine.
     */
    getUsersWhoLoggedToday(): Promise<string[]>;
    /**
     * Per-project total hours — used in admin dashboard project-hours widget.
     */
    getProjectHoursSummary(): Promise<{
        projectId: string;
        projectName: string;
        totalHours: number;
    }[]>;
    /**
     * Returns total hours logged by a specific user on a specific project today.
     * Used to resume the project timer from where it left off.
     */
    getProjectHoursForUserToday(userId: string, projectId: string): Promise<number>;
    /**
     * Admin: Detailed breakdown of project hours by user for today.
     */
    getAdminProjectUserBreakdown(): Promise<any[]>;
    private _populate;
}
//# sourceMappingURL=worklog.service.d.ts.map