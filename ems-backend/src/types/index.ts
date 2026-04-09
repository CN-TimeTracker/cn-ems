import { Request } from 'express';
import { Types } from 'mongoose';

// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Enums ────────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Dev' | 'Designer' | 'SEO' | 'QA' | 'BA';

export type ProjectStatus = 'Active' | 'Completed';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

// ─── Mongoose Document IDs ────────────────────────────────────────────────────
export type ObjectId = Types.ObjectId;
