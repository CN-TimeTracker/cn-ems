import { Types, Document } from 'mongoose';
import { Request } from 'express';

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export enum UserRole {
  Admin    = 'Admin',
  Dev      = 'Dev',
  Designer = 'Designer',
  SEO      = 'SEO',
  QA       = 'QA',
  BA       = 'BA',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'Prefer not to say',
}

export enum ProjectStatus {
  Active    = 'Active',
  Completed = 'Completed',
}

export enum TaskStatus {
  CurrentlyWorking              = 'Currently Working',
  DevelopmentCompNeedTesting    = 'Development Comp [Need Testing]',
  DesignCompleted               = 'Design Completed',
  ClientFeedback                = 'Client Feedback',
  BugFixing                     = 'Bug Fixing',
  TestingStarted                = 'Testing Started',
  IssueReportedNeedTesting      = 'Issue Reported [Need Testing]',
  TestingVerified               = 'Testing Verified',
  ProjectCompleted              = 'Project Completed',
  MockupWorking                 = 'Mockup Working',
  MockupApproved                = 'Mockup Approved',
  DevelopmentCompOnlyTesting    = 'Development Comp [Only Testing, No Designer]',
  DevelopmentCompNeedDesigner   = 'Development Comp [Need Designer, No Testing]',
  DesignCompNeedTesting         = 'Design Comp [Need Testing]',
  WebsiteMovedToLiveNeedTesting = 'Website Moved to live [Need Testing]',
  WebsiteMovedToLiveVerified    = 'Website Moved to live [Verified Testing]',
}

export enum LeaveStatus {
  Pending  = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum LeaveType {
  Casual    = 'Casual',
  Sick      = 'Sick',
  Emergency = 'Emergency',
}

export enum LeaveDuration {
  FullDay = 'Full Day',
  HalfDay = 'Half Day',
}

export enum HalfDayType {
  FirstHalf  = 'First Half',
  SecondHalf = 'Second Half',
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  profilePicture?: string;
  
  // Custom details
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
  
  // Account details
  salary?: number;
  bankName?: string;
  accountNo?: string;
  branchName?: string;
  ifscCode?: string;
  aadharNo?: string;
  panNo?: string;

  createdAt: Date;
  updatedAt: Date;

  // Instance method declared here so TypeScript knows it exists on the model
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

// ─────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  clientName: string;
  category: string;         // 'Custom Product' | 'Support' | 'Product'
  description?: string;
  startDate: Date;
  deadline: Date;
  status: ProjectStatus;
  allocatedHours: number;      // Total estimated hours
  assignedTo: Types.ObjectId[]; // Users who can see/work on this
  createdBy: Types.ObjectId;    // ref → User
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────

export interface ITask extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;  // ref → Project
  workType: string;
  description?: string;
  assignedTo: Types.ObjectId; // User who logs it
  status: TaskStatus;
  date: Date;
  time: string;
  
  // New Timer Fields
  totalMinutesSpent: number;  // Cumulative time in minutes
  isRunning: boolean;         // Is the timer actively ticking?
  lastStartedAt: Date | null; // Timestamp of the most recent "Start"
  
  createdBy: Types.ObjectId;  // ref → User
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// WORK LOG
// ─────────────────────────────────────────────

export interface IWorkLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;    // ref → User
  projectId: Types.ObjectId; // ref → Project
  taskId: Types.ObjectId;    // ref → Task  (only assigned tasks)
  hours: number;             // max 10
  notes?: string;
  startTime?: Date;          // session start
  endTime?: Date;            // session end
  date: Date;                // stored as midnight UTC
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// LEAVE
// ─────────────────────────────────────────────

export interface ILeave extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;  // ref → User
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  leaveType: LeaveType;
  duration: LeaveDuration;
  halfDayType?: HalfDayType;
  reviewedBy?: Types.ObjectId; // ref → User (Admin)
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

export interface IBreakEntry {
  startTime: Date;
  endTime?: Date;
}

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;   // ref → User
  date: Date;               // midnight UTC — one record per user per day
  punchInTime: Date;        // full timestamp of punch-in
  punchOutTime?: Date;      // optional punch-out timestamp
  breaks: IBreakEntry[];    // break periods
  totalWorkMs?: number;     // net working time in milliseconds
  isLate: boolean;          // true if after 10:15 AM IST
  lateReason?: string;      // required when isLate = true
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// SERVICE LAYER — INPUT / OUTPUT TYPES
// ─────────────────────────────────────────────

// Auth
export interface ILoginInput {
  email: string;
  password: string;
}

export interface ILoginResult {
  token: string;
  user: IUserPublic;
}

// User
export interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Let admin create with details if they want
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

export enum ProfileUpdateRequestStatus {
  Pending  = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Revoked  = 'Revoked',
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

// Project
export interface ICreateProjectInput {
  name: string;
  clientName: string;
  category: string;
  description?: string;
  startDate: Date;
  deadline: Date;
  allocatedHours: number;
  assignedTo?: string[]; // Array of User IDs
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

// Task
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

// Work Log
export interface ICreateWorkLogInput {
  projectId: string;
  taskId?:  string;
  hours:     number;
  notes?:    string;
  startTime?: Date;
  endTime?:   Date;
  date?:     Date;
}

export interface IWorkLogFilters {
  userId?: string;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Leave
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

// Attendance
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

// Dashboard
export interface IAdminDashboardData {
  totalUsersLogged: number;
  usersNotLoggedToday: IUserPublic[];
  usersUnder4Hours: { user: IUserPublic; totalHours: number }[];

  projectHours: { project: string; totalHours: number }[];
  totalHoursToday: number;
  usersWithNoTasks: IUserPublic[];
}

export interface IHolidaySimple {
  name: string;
  date: Date;
}

export interface IEmployeeDashboardData {
  todaysTasks: any[];
  todaysLoggedHours: number;
  pendingTasks: any[];
  recentLogs: any[];
  todayAttendance: any;
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
  upcomingHolidays: IHolidaySimple[];
  salaryStatus: {
    month: string;
    status: 'Verified' | 'Processing';
  } | null;
}

// ─────────────────────────────────────────────
// PAYSLIP
// ─────────────────────────────────────────────

export interface IPayslip extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;  // ref → User
  month: number;           // 1-12
  year: number;
  fileUrl: string;         // URL to the file
  filename: string;        // original or generated name
  uploadedBy: Types.ObjectId; // ref → User (Admin)
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
