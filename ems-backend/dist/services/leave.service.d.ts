import { ILeave, ICreateLeaveInput, IReviewLeaveInput } from '../interfaces';
export declare class LeaveService {
    /**
     * Employee applies for leave.
     * Validates no overlapping pending/approved leave exists for the same period.
     */
    applyLeave(userId: string, input: ICreateLeaveInput): Promise<ILeave>;
    /**
     * Returns all leave requests — Admin sees all, employees see only theirs.
     */
    getLeaves(userId?: string): Promise<ILeave[]>;
    /**
     * Returns pending leave requests — Admin dashboard uses this.
     */
    getPendingLeaves(): Promise<ILeave[]>;
    /**
     * Admin approves or rejects a leave request.
     * Records who reviewed it and when.
     */
    reviewLeave(leaveId: string, adminId: string, input: IReviewLeaveInput): Promise<ILeave>;
    /**
     * Employee can cancel a PENDING leave (cannot cancel already-approved).
     */
    cancelLeave(leaveId: string, userId: string): Promise<void>;
    /**
     * Returns whether a user is on approved leave on a given date.
     * Used by the accountability engine to determine absent vs not-logged status.
     */
    isOnLeave(userId: string, date: Date): Promise<boolean>;
}
//# sourceMappingURL=leave.service.d.ts.map