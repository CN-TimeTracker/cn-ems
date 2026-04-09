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
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150).optional(),
    clientName: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    startDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    deadline: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    status: zod_1.z.nativeEnum(interfaces_1.ProjectStatus).optional(),
});
// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────
exports.createTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project is required'),
    title: zod_1.z.string().min(2, 'Task title is required').max(200),
    description: zod_1.z.string().max(2000).optional(),
    assignedTo: zod_1.z.string().min(1, 'Assignee is required'),
    roleTag: zod_1.z.nativeEnum(interfaces_1.UserRole),
    deadline: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid deadline'),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).optional(),
    description: zod_1.z.string().max(2000).optional(),
    assignedTo: zod_1.z.string().optional(),
    roleTag: zod_1.z.nativeEnum(interfaces_1.UserRole).optional(),
    status: zod_1.z.nativeEnum(interfaces_1.TaskStatus).optional(),
    deadline: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
});
// ─────────────────────────────────────────────
// WORK LOG
// ─────────────────────────────────────────────
exports.createWorkLogSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project is required'),
    taskId: zod_1.z.string().min(1, 'Task is required'),
    hours: zod_1.z
        .number()
        .min(0.5, 'Minimum 0.5 hours')
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
});
exports.reviewLeaveSchema = zod_1.z.object({
    status: zod_1.z.enum([interfaces_1.LeaveStatus.Approved, interfaces_1.LeaveStatus.Rejected], {
        errorMap: () => ({ message: 'Status must be Approved or Rejected' }),
    }),
});
//# sourceMappingURL=schemas.js.map