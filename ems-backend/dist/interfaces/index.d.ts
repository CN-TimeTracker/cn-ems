import { Types, Document } from 'mongoose';
import { Request } from 'express';
export declare enum UserRole {
    Admin = "Admin",
    Dev = "Dev",
    Designer = "Designer",
    SEO = "SEO",
    QA = "QA",
    BA = "BA"
}
export declare enum Gender {
    Male = "Male",
    Female = "Female",
    Other = "Other",
    PreferNotToSay = "Prefer not to say"
}
export declare enum ProjectStatus {
    Active = "Active",
    Completed = "Completed"
}
export declare enum TaskStatus {
    ToDo = "To Do",
    InProgress = "In Progress",
    Done = "Done"
}
export declare enum LeaveStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected"
}
export interface IJwtPayload {
    id: string;
    role: UserRole;
    email: string;
    name: string;
}
/** Extends Express Request to carry the decoded JWT user */
export interface IAuthRequest extends Request {
    user?: IJwtPayload;
}
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    employeeCode?: string;
    username?: string;
    phoneNumber?: string;
    dateOfJoining?: Date;
    dateOfBirth?: Date;
    gender?: Gender;
    fatherName?: string;
    currentAddress?: string;
    permanentAddress?: string;
    description?: string;
    salary?: number;
    bankName?: string;
    accountNo?: string;
    branchName?: string;
    ifscCode?: string;
    aadharNo?: string;
    panNo?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
/** Shape returned to the client — no password, no __v */
export interface IUserPublic {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    employeeCode?: string;
    username?: string;
    phoneNumber?: string;
    dateOfJoining?: Date;
    dateOfBirth?: Date;
    gender?: Gender;
    fatherName?: string;
    currentAddress?: string;
    permanentAddress?: string;
    description?: string;
    salary?: number;
    bankName?: string;
    accountNo?: string;
    branchName?: string;
    ifscCode?: string;
    aadharNo?: string;
    panNo?: string;
    createdAt: Date;
}
export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    clientName: string;
    description?: string;
    startDate: Date;
    deadline: Date;
    status: ProjectStatus;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ITask extends Document {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    title: string;
    description?: string;
    assignedTo: Types.ObjectId;
    roleTag: UserRole;
    status: TaskStatus;
    deadline: Date;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IWorkLog extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    taskId: Types.ObjectId;
    hours: number;
    notes?: string;
    startTime: Date;
    endTime: Date;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ILeave extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBreakEntry {
    startTime: Date;
    endTime?: Date;
}
export interface IAttendance extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    date: Date;
    punchInTime: Date;
    punchOutTime?: Date;
    breaks: IBreakEntry[];
    isLate: boolean;
    lateReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ILoginInput {
    email: string;
    password: string;
}
export interface ILoginResult {
    token: string;
    user: IUserPublic;
}
export interface ICreateUserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    employeeCode?: string;
    username?: string;
    phoneNumber?: string;
    dateOfJoining?: Date;
    dateOfBirth?: Date;
    gender?: Gender;
    fatherName?: string;
    currentAddress?: string;
    permanentAddress?: string;
    description?: string;
    salary?: number;
    bankName?: string;
    accountNo?: string;
    branchName?: string;
    ifscCode?: string;
    aadharNo?: string;
    panNo?: string;
}
export interface IUpdateUserInput {
    name?: string;
    role?: UserRole;
    isActive?: boolean;
    employeeCode?: string;
    username?: string;
    phoneNumber?: string;
    dateOfJoining?: Date;
    dateOfBirth?: Date;
    gender?: Gender;
    fatherName?: string;
    currentAddress?: string;
    permanentAddress?: string;
    description?: string;
    salary?: number;
    bankName?: string;
    accountNo?: string;
    branchName?: string;
    ifscCode?: string;
    aadharNo?: string;
    panNo?: string;
}
export declare enum ProfileUpdateRequestStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected"
}
export interface IProfileUpdateChanges {
    name?: string;
    username?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    fatherName?: string;
    currentAddress?: string;
    permanentAddress?: string;
    description?: string;
}
export interface IProfileUpdateRequest extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    requestedChanges: IProfileUpdateChanges;
    status: ProfileUpdateRequestStatus;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateProjectInput {
    name: string;
    clientName: string;
    description?: string;
    startDate: Date;
    deadline: Date;
}
export interface IUpdateProjectInput {
    name?: string;
    clientName?: string;
    description?: string;
    startDate?: Date;
    deadline?: Date;
    status?: ProjectStatus;
}
export interface ICreateTaskInput {
    projectId: string;
    title: string;
    description?: string;
    assignedTo: string;
    roleTag: UserRole;
    deadline: Date;
}
export interface IUpdateTaskInput {
    title?: string;
    description?: string;
    assignedTo?: string;
    roleTag?: UserRole;
    status?: TaskStatus;
    deadline?: Date;
}
export interface ITaskFilters {
    projectId?: string;
    assignedTo?: string;
    status?: TaskStatus;
}
export interface ICreateWorkLogInput {
    projectId: string;
    taskId?: string;
    hours: number;
    notes?: string;
    startTime: Date;
    endTime: Date;
    date?: Date;
}
export interface IWorkLogFilters {
    userId?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface ICreateLeaveInput {
    startDate: Date;
    endDate: Date;
    reason: string;
}
export interface IReviewLeaveInput {
    status: LeaveStatus.Approved | LeaveStatus.Rejected;
}
export interface ICreateAttendanceInput {
    lateReason?: string;
}
export interface IAdminAttendanceEntry {
    user: IUserPublic;
    punchInTime: Date | null;
    punchOutTime?: Date | null;
    breaks: IBreakEntry[];
    totalBreakMs: number;
    isLate: boolean;
    lateReason?: string;
    hasPunchedIn: boolean;
    hasPunchedOut: boolean;
}
export interface IAdminDashboardData {
    totalUsersLogged: number;
    usersNotLoggedToday: IUserPublic[];
    usersUnder4Hours: {
        user: IUserPublic;
        totalHours: number;
    }[];
    overdueTasks: ITask[];
    projectHours: {
        project: string;
        totalHours: number;
    }[];
    totalHoursToday: number;
    usersWithNoTasks: IUserPublic[];
}
export interface IEmployeeDashboardData {
    todaysTasks: ITask[];
    todaysLoggedHours: number;
    pendingTasks: ITask[];
    recentLogs: IWorkLog[];
}
//# sourceMappingURL=index.d.ts.map