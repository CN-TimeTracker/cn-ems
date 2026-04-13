import { z } from 'zod';
import { UserRole, ProjectStatus, TaskStatus, LeaveStatus, LeaveType, LeaveDuration, HalfDayType } from '../interfaces';
import { TimeService } from '../services';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),

  employeeCode: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfJoining: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  fatherName: z.string().optional(),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  description: z.string().optional(),

  salary: z.number().optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  branchName: z.string().optional(),
  ifscCode: z.string().optional(),
  aadharNo: z.string().optional(),
  panNo: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  isActive: z.boolean().optional(),

  employeeCode: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfJoining: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  fatherName: z.string().optional(),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  description: z.string().optional(),

  salary: z.number().optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  branchName: z.string().optional(),
  ifscCode: z.string().optional(),
  aadharNo: z.string().optional(),
  panNo: z.string().optional(),
});

// ─────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(150),
  clientName: z.string().min(2, 'Client name is required').max(100),
  description: z.string().max(1000).optional(),
  startDate: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid start date'),
  deadline: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid deadline'),
  allocatedHours: z.number().min(0, 'Allocated hours cannot be negative'),
  assignedTo: z.array(z.string()).optional(),
}).refine((data) => new Date(data.deadline) > new Date(data.startDate), {
  message: 'Deadline must be after the start date',
  path: ['deadline'],
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  clientName: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  deadline: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  allocatedHours: z.number().min(0).optional(),
  assignedTo: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.deadline) {
      return new Date(data.deadline) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'Deadline must be after the start date',
    path: ['deadline'],
  }
);

// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  workType: z.string().min(1, 'Work type is required'),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = z.object({
  workType: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

// ─────────────────────────────────────────────
// WORK LOG
// ─────────────────────────────────────────────

export const createWorkLogSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  taskId: z.string().min(1, 'Task is required'),
  hours: z
    .number()
    .min(0, 'Cannot log negative hours')
    .max(10, 'Maximum 10 hours per entry'),
  notes: z.string().max(500).optional(),
  date: z
    .string()
    .refine((d: string) => !isNaN(Date.parse(d)), 'Invalid date')
    .optional(),
});

// ─────────────────────────────────────────────
// LEAVE
// ─────────────────────────────────────────────

export const createLeaveSchema = z.object({
  startDate: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d: string) => !isNaN(Date.parse(d)), 'Invalid end date'),
  reason: z.string().min(1, 'Please provide a reason').max(500),
  leaveType: z.nativeEnum(LeaveType),
  duration: z.nativeEnum(LeaveDuration),
  halfDayType: z.nativeEnum(HalfDayType).optional(),
}).superRefine((data, ctx) => {
  if (data.leaveType === LeaveType.Casual) {
    const today = TimeService.now();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5);
    
    // Create standard YYYY-MM-DD comparisons for safety
    const minStr = minDate.toISOString().split('T')[0];
    const startStr = data.startDate; // Already yyyy-mm-dd from frontend
    
    if (startStr < minStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Casual leaves must be applied at least 5 days in advance',
        path: ['startDate'],
      });
    }
  }
});

export const reviewLeaveSchema = z.object({
  status: z.enum([LeaveStatus.Approved, LeaveStatus.Rejected], {
    errorMap: () => ({ message: 'Status must be Approved or Rejected' }),
  }),
});
