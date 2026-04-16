// ─────────────────────────────────────────────
// ENUMS  (mirror backend exactly)
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
// API RESPONSE WRAPPER
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  lateReason?: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  profilePicture?: string;

  employeeCode?: string;
  username?: string;
  phoneNumber?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
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

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;

  employeeCode?: string;
  username?: string;
  phoneNumber?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
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

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  isActive?: boolean;

  employeeCode?: string;
  username?: string;
  phoneNumber?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
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

// ─────────────────────────────────────────────
// PROFILE UPDATES
// ─────────────────────────────────────────────

export enum ProfileUpdateRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Revoked = 'Revoked',
}

export interface ProfileUpdateChanges {
  name?: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  gender?: Gender;
  fatherName?: string;
  currentAddress?: string;
  permanentAddress?: string;
  description?: string;
  displayDateOfBirth?: string;
}

export interface ProfileUpdateRequest {
  _id: string;
  userId: string | User;
  requestedChanges: ProfileUpdateChanges;
  previousValues?: ProfileUpdateChanges;
  status: ProfileUpdateRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────

export interface Project {
  _id: string;
  name: string;
  clientName: string;
  category: string;
  description?: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  allocatedHours: number;
  assignedTo: string[] | User[];
  createdBy: Pick<User, '_id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  category: string;
  description?: string;
  startDate: string;
  deadline: string;
  allocatedHours: number;
  assignedTo?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  clientName?: string;
  category?: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  status?: ProjectStatus;
  allocatedHours?: number;
  assignedTo?: string[];
}

// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────

export interface Task {
  _id: string;
  projectId: Pick<Project, '_id' | 'name' | 'clientName' | 'status' | 'deadline'>;
  workType: string;
  description?: string;
  assignedTo: Pick<User, '_id' | 'name' | 'email' | 'role'>;
  status: TaskStatus;
  date: string;
  time: string;
  totalMinutesSpent: number;
  isRunning: boolean;
  lastStartedAt: string | null;
  createdBy: Pick<User, '_id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: string;
  workType: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  workType?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskFilters {
  projectId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
}

// ─────────────────────────────────────────────
// WORK LOG
// ─────────────────────────────────────────────

export interface WorkLog {
  _id: string;
  userId: Pick<User, '_id' | 'name' | 'email'>;
  projectId: Pick<Project, '_id' | 'name' | 'clientName'>;
  taskId: Pick<Task, '_id' | 'workType' | 'description' | 'status'>;
  hours: number;
  notes?: string;
  startTime?: string;
  endTime?: string;
  date: string;
  createdAt: string;
}

export interface CreateWorkLogInput {
  projectId: string;
  taskId?:  string; // Optional for "Task as Text"
  hours:     number;
  notes?:    string;
  startTime?: string; // ISO String
  endTime?:   string; // ISO String
  date?:      string;
}

export interface WorkLogFilters {
  userId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TodayHours {
  hours: number;
  remaining: number;
}

export interface ProjectHoursSummary {
  projectId: string;
  projectName: string;
  totalHours: number;
}

// ─────────────────────────────────────────────
// LEAVE
// ─────────────────────────────────────────────

export interface Leave {
  _id: string;
  userId: Pick<User, '_id' | 'name' | 'email' | 'role'>;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  leaveType: LeaveType;
  duration: LeaveDuration;
  halfDayType?: HalfDayType;
  reviewedBy?: Pick<User, '_id' | 'name'>;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateLeaveInput {
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: LeaveType;
  duration: LeaveDuration;
  halfDayType?: HalfDayType;
}

export interface ReviewLeaveInput {
  status: LeaveStatus.Approved | LeaveStatus.Rejected;
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

export interface BreakEntry {
  startTime: string;
  endTime?: string;
}

export interface Attendance {
  _id: string;
  userId: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  breaks: BreakEntry[];
  isLate: boolean;
  lateReason?: string;
  createdAt: string;
}

export interface CreatePunchInInput {
  lateReason?: string;
}

export interface AdminAttendanceEntry {
  user: User;
  punchInTime: string | null;
  punchOutTime?: string | null;
  breaks: BreakEntry[];
  totalBreakMs: number;
  isLate: boolean;
  lateReason?: string;
  hasPunchedIn: boolean;
  hasPunchedOut: boolean;
  date?: string;
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export interface AdminDashboardData {
  totalUsersLogged: number;
  usersNotLoggedToday: User[];
  usersUnder4Hours: { user: User; totalHours: number }[];

  projectHours: { project: string; totalHours: number }[];
  totalHoursToday: number;
  usersWithNoTasks: User[];
}

export interface EmployeeDashboardData {
  todaysTasks: Task[];
  todaysLoggedHours: number;
  pendingTasks: Task[];
  recentLogs: WorkLog[];
  todayAttendance?: Attendance;
  totalProjects: number;
  totalLeaves: number;
  projectBreakdown: {
    projectId: string;
    name: string;
    clientName: string;
    category: string;
    allocatedHours: number;
    workedHours: number;
    deadline: string;
  }[];
}

// ─────────────────────────────────────────────
// PAYSLIP
// ─────────────────────────────────────────────

export interface Payslip {
  _id: string;
  userId: string | User;
  month: number;
  year: number;
  fileUrl: string;
  filename: string;
  uploadedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface UploadPayslipInput {
  employeeCode: string;
  month: number;
  year: number;
  file: File;
}

// ─────────────────────────────────────────────
// REDUX AUTH STATE
// ─────────────────────────────────────────────

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ─────────────────────────────────────────────
// EVENT
// ─────────────────────────────────────────────

export interface IEvent {
  _id: string;
  name: string;
  slug: string;
  info?: string;
  images: string[];
  createdBy: Pick<User, '_id' | 'name'> | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  name: string;
  info?: string;
  images?: File[];
}

export interface UpdateEventInput {
  name?: string;
  info?: string;
  images?: File[];
  removeImages?: string[];
}

// ─────────────────────────────────────────────
// REDUX UI STATE
// ─────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
}
