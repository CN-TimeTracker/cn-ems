"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewLeaveSchema = exports.createLeaveSchema = exports.createWorkLogSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.updateUserSchema = exports.createUserSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.nativeEnum(interfaces_1.UserRole),
    employeeCode: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfJoining: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    fatherName: zod_1.z.string().optional(),
    currentAddress: zod_1.z.string().optional(),
    permanentAddress: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    salary: zod_1.z.number().optional(),
    bankName: zod_1.z.string().optional(),
    accountNo: zod_1.z.string().optional(),
    branchName: zod_1.z.string().optional(),
    ifscCode: zod_1.z.string().optional(),
    aadharNo: zod_1.z.string().optional(),
    panNo: zod_1.z.string().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    role: zod_1.z.nativeEnum(interfaces_1.UserRole).optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
    isActive: zod_1.z.boolean().optional(),
    employeeCode: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfJoining: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    fatherName: zod_1.z.string().optional(),
    currentAddress: zod_1.z.string().optional(),
    permanentAddress: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    salary: zod_1.z.number().optional(),
    bankName: zod_1.z.string().optional(),
    accountNo: zod_1.z.string().optional(),
    branchName: zod_1.z.string().optional(),
    ifscCode: zod_1.z.string().optional(),
    aadharNo: zod_1.z.string().optional(),
    panNo: zod_1.z.string().optional(),
});
// ─────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Project name is required').max(150),
    clientName: zod_1.z.string().min(2, 'Client name is required').max(100),
    description: zod_1.z.string().max(1000).optional(),
    startDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
    deadline: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid deadline'),
    allocatedHours: zod_1.z.number().min(0, 'Allocated hours cannot be negative'),
    assignedTo: zod_1.z.array(zod_1.z.string()).optional(),
}).refine((data) => new Date(data.deadline) > new Date(data.startDate), {
    message: 'Deadline must be after the start date',
    path: ['deadline'],
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150).optional(),
    clientName: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    startDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    deadline: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    status: zod_1.z.nativeEnum(interfaces_1.ProjectStatus).optional(),
    allocatedHours: zod_1.z.number().min(0).optional(),
    assignedTo: zod_1.z.array(zod_1.z.string()).optional(),
}).refine((data) => {
    if (data.startDate && data.deadline) {
        return new Date(data.deadline) > new Date(data.startDate);
    }
    return true;
}, {
    message: 'Deadline must be after the start date',
    path: ['deadline'],
});
// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────
exports.createTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project is required'),
    workType: zod_1.z.string().min(1, 'Work type is required'),
    description: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.nativeEnum(interfaces_1.TaskStatus).optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    workType: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.nativeEnum(interfaces_1.TaskStatus).optional(),
});
// ─────────────────────────────────────────────
// WORK LOG
// ─────────────────────────────────────────────
exports.createWorkLogSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project is required'),
    taskId: zod_1.z.string().min(1, 'Task is required'),
    hours: zod_1.z
        .number()
        .min(0, 'Cannot log negative hours')
        .max(10, 'Maximum 10 hours per entry'),
    notes: zod_1.z.string().max(500).optional(),
    date: zod_1.z
        .string()
        .refine((d) => !isNaN(Date.parse(d)), 'Invalid date')
        .optional(),
});
// ─────────────────────────────────────────────
// LEAVE
// ─────────────────────────────────────────────
exports.createLeaveSchema = zod_1.z.object({
    startDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
    endDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
    reason: zod_1.z.string().min(5, 'Please provide a reason').max(500),
    leaveType: zod_1.z.nativeEnum(interfaces_1.LeaveType),
    duration: zod_1.z.nativeEnum(interfaces_1.LeaveDuration),
    halfDayType: zod_1.z.nativeEnum(interfaces_1.HalfDayType).optional(),
}).superRefine((data, ctx) => {
    if (data.leaveType === interfaces_1.LeaveType.Casual) {
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 5);
        // Create standard YYYY-MM-DD comparisons
        const minStr = minDate.toISOString().split('T')[0];
        const startStr = data.startDate;
        if (startStr < minStr) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Casual leaves must be applied at least 5 days in advance',
                path: ['startDate'],
            });
        }
    }
});
exports.reviewLeaveSchema = zod_1.z.object({
    status: zod_1.z.enum([interfaces_1.LeaveStatus.Approved, interfaces_1.LeaveStatus.Rejected], {
        errorMap: () => ({ message: 'Status must be Approved or Rejected' }),
    }),
});
//# sourceMappingURL=schemas.js.map