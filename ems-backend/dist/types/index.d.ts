import { Request } from 'express';
import { Types } from 'mongoose';
export interface JwtPayload {
    id: string;
    role: UserRole;
    email: string;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export type UserRole = 'Admin' | 'Dev' | 'Designer' | 'SEO' | 'QA' | 'BA';
export type ProjectStatus = 'Active' | 'Completed';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type ObjectId = Types.ObjectId;
//# sourceMappingURL=index.d.ts.map