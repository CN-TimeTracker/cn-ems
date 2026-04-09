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
    CurrentlyWorking = "Currently Working",
    DevelopmentCompNeedTesting = "Development Comp [Need Testing]",
    DesignCompleted = "Design Completed",
    ClientFeedback = "Client Feedback",
    BugFixing = "Bug Fixing",
    TestingStarted = "Testing Started",
    IssueReportedNeedTesting = "Issue Reported [Need Testing]",
    TestingVerified = "Testing Verified",
    ProjectCompleted = "Project Completed",
    MockupWorking = "Mockup Working",
    MockupApproved = "Mockup Approved",
    DevelopmentCompOnlyTesting = "Development Comp [Only Testing, No Designer]",
    DevelopmentCompNeedDesigner = "Development Comp [Need Designer, No Testing]",
    DesignCompNeedTesting = "Design Comp [Need Testing]",
    WebsiteMovedToLiveNeedTesting = "Website Moved to live [Need Testing]",
    WebsiteMovedToLiveVerified = "Website Moved to live [Verified Testing]"
}
export declare enum LeaveStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected"
}
export declare enum LeaveType {
    Casual = "Casual",
    Sick = "Sick",
    Emergency = "Emergency"
}
export declare enum LeaveDuration {
    FullDay = "Full Day",
    HalfDay = "Half Day"
}
export declare enum HalfDayType {
    FirstHalf = "First Half",
    SecondHalf = "Second Half"
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
    profilePicture?: string;
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
    profilePicture?: string;
}
export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    clientName: string;
    category: string;
    description?: string;
    startDate: Date;
    deadline: Date;
    status: ProjectStatus;
    allocatedHours: number;
    assignedTo: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ITask extends Document {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    workType: string;
    description?: string;
    assignedTo: Types.ObjectId;
    status: TaskStatus;
    date: Date;
    time: string;
    totalMinutesSpent: number;
    isRunning: boolean;
    lastStartedAt: Date | null;
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
    startTime?: Date;
    endTime?: Date;
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
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType;
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
    totalWorkMs?: number;
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
    password?: string;
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
    Rejected = "Rejected",
    Revoked = "Revoked"
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
export interface IProfileUpdateRequest {
    _id: string;
    userId: string | IUser;
    requestedChanges: IProfileUpdateChanges;
    previousValues?: IProfileUpdateChanges;
    status: ProfileUpdateRequestStatus;
    reviewedBy?: string | IUser;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateProjectInput {
    name: string;
    clientName: string;
    category: string;
    description?: string;
    startDate: Date;
    deadline: Date;
    allocatedHours: number;
    assignedTo?: string[];
}
export interface IUpdateProjectInput {
    name?: string;
    clientName?: string;
    category?: string;
    description?: string;
    startDate?: Date;
    deadline?: Date;
    status?: ProjectStatus;
    allocatedHours?: number;
    assignedTo?: string[];
}
export interface ICreateTaskInput {
    projectId: string;
    workType: string;
    description?: string;
    status?: TaskStatus;
}
export interface IUpdateTaskInput {
    workType?: string;
    description?: string;
    status?: TaskStatus;
}
export interface ITaskFilters {
    projectId?: string;
    assignedTo?: string;
    status?: TaskStatus;
    startDate?: string;
    endDate?: string;
}
export interface ICreateWorkLogInput {
    projectId: string;
    taskId?: string;
    hours: number;
    notes?: string;
    startTime?: Date;
    endTime?: Date;
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
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType;
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
    todayAttendance?: IAttendance;
    totalProjects: number;
    totalLeaves: number;
    projectBreakdown: {
        projectId: string;
        name: string;
        clientName: string;
        category: string;
        allocatedHours: number;
        workedHours: number;
        deadline: Date;
    }[];
}
export interface IPayslip extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    month: number;
    year: number;
    fileUrl: string;
    filename: string;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ISalaryRecord extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    month: number;
    year: number;
    lopOverride?: number;
    isApproved: boolean;
    approvedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=index.d.ts.map