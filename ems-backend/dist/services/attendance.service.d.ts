import { ICreateAttendanceInput, IAdminAttendanceEntry, IBreakEntry } from '../interfaces';
export declare class AttendanceService {
    /** Returns true if punchInTime is after 10:15 AM IST */
    private computeIsLate;
    /** Calculate total break milliseconds from a breaks array, context-aware of the date */
    calcTotalBreakMs(breaks: IBreakEntry[], recordDate?: Date): number;
    /** Calculate total work duration excluding breaks */
    calculateWorkDuration(punchIn: Date, punchOut: Date, breaks: IBreakEntry[]): number;
    /** Dynamically calculate work duration up to the current moment if not punched out */
    calculateLiveWorkMs(record: any): number;
    punchIn(userId: string, input: ICreateAttendanceInput): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IAttendance, {}, {}> & import("../interfaces").IAttendance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateTodayLateReason(userId: string, reason: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IAttendance, {}, {}> & import("../interfaces").IAttendance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    punchOut(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IAttendance, {}, {}> & import("../interfaces").IAttendance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    startBreak(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IAttendance, {}, {}> & import("../interfaces").IAttendance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    endBreak(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IAttendance, {}, {}> & import("../interfaces").IAttendance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getTodayForUser(userId: string): Promise<(import("mongoose").FlattenMaps<import("../interfaces").IAttendance> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getAdminTodayView(): Promise<IAdminAttendanceEntry[]>;
    getAdminAllAttendanceHistory(filters: {
        userId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<IAdminAttendanceEntry[]>;
}
//# sourceMappingURL=attendance.service.d.ts.map