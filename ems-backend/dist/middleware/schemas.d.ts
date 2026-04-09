import { z } from 'zod';
import { UserRole, ProjectStatus, TaskStatus, LeaveStatus, LeaveType, LeaveDuration, HalfDayType } from '../interfaces';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
    employeeCode: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfJoining: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    fatherName: z.ZodOptional<z.ZodString>;
    currentAddress: z.ZodOptional<z.ZodString>;
    permanentAddress: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    salary: z.ZodOptional<z.ZodNumber>;
    bankName: z.ZodOptional<z.ZodString>;
    accountNo: z.ZodOptional<z.ZodString>;
    branchName: z.ZodOptional<z.ZodString>;
    ifscCode: z.ZodOptional<z.ZodString>;
    aadharNo: z.ZodOptional<z.ZodString>;
    panNo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    employeeCode?: string | undefined;
    username?: string | undefined;
    phoneNumber?: string | undefined;
    dateOfJoining?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    fatherName?: string | undefined;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
    description?: string | undefined;
    salary?: number | undefined;
    bankName?: string | undefined;
    accountNo?: string | undefined;
    branchName?: string | undefined;
    ifscCode?: string | undefined;
    aadharNo?: string | undefined;
    panNo?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    employeeCode?: string | undefined;
    username?: string | undefined;
    phoneNumber?: string | undefined;
    dateOfJoining?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    fatherName?: string | undefined;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
    description?: string | undefined;
    salary?: number | undefined;
    bankName?: string | undefined;
    accountNo?: string | undefined;
    branchName?: string | undefined;
    ifscCode?: string | undefined;
    aadharNo?: string | undefined;
    panNo?: string | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    password: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    employeeCode: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfJoining: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    fatherName: z.ZodOptional<z.ZodString>;
    currentAddress: z.ZodOptional<z.ZodString>;
    permanentAddress: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    salary: z.ZodOptional<z.ZodNumber>;
    bankName: z.ZodOptional<z.ZodString>;
    accountNo: z.ZodOptional<z.ZodString>;
    branchName: z.ZodOptional<z.ZodString>;
    ifscCode: z.ZodOptional<z.ZodString>;
    aadharNo: z.ZodOptional<z.ZodString>;
    panNo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    password?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
    employeeCode?: string | undefined;
    username?: string | undefined;
    phoneNumber?: string | undefined;
    dateOfJoining?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    fatherName?: string | undefined;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
    description?: string | undefined;
    salary?: number | undefined;
    bankName?: string | undefined;
    accountNo?: string | undefined;
    branchName?: string | undefined;
    ifscCode?: string | undefined;
    aadharNo?: string | undefined;
    panNo?: string | undefined;
}, {
    name?: string | undefined;
    password?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
    employeeCode?: string | undefined;
    username?: string | undefined;
    phoneNumber?: string | undefined;
    dateOfJoining?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    fatherName?: string | undefined;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
    description?: string | undefined;
    salary?: number | undefined;
    bankName?: string | undefined;
    accountNo?: string | undefined;
    branchName?: string | undefined;
    ifscCode?: string | undefined;
    aadharNo?: string | undefined;
    panNo?: string | undefined;
}>;
export declare const createProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    clientName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startDate: z.ZodEffects<z.ZodString, string, string>;
    deadline: z.ZodEffects<z.ZodString, string, string>;
    allocatedHours: z.ZodNumber;
    assignedTo: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    clientName: string;
    startDate: string;
    deadline: string;
    allocatedHours: number;
    description?: string | undefined;
    assignedTo?: string[] | undefined;
}, {
    name: string;
    clientName: string;
    startDate: string;
    deadline: string;
    allocatedHours: number;
    description?: string | undefined;
    assignedTo?: string[] | undefined;
}>, {
    name: string;
    clientName: string;
    startDate: string;
    deadline: string;
    allocatedHours: number;
    description?: string | undefined;
    assignedTo?: string[] | undefined;
}, {
    name: string;
    clientName: string;
    startDate: string;
    deadline: string;
    allocatedHours: number;
    description?: string | undefined;
    assignedTo?: string[] | undefined;
}>;
export declare const updateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    clientName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProjectStatus>>;
    allocatedHours: z.ZodOptional<z.ZodNumber>;
    assignedTo: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    clientName?: string | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    status?: ProjectStatus | undefined;
    allocatedHours?: number | undefined;
    assignedTo?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    clientName?: string | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    status?: ProjectStatus | undefined;
    allocatedHours?: number | undefined;
    assignedTo?: string[] | undefined;
}>, {
    name?: string | undefined;
    description?: string | undefined;
    clientName?: string | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    status?: ProjectStatus | undefined;
    allocatedHours?: number | undefined;
    assignedTo?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    clientName?: string | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    status?: ProjectStatus | undefined;
    allocatedHours?: number | undefined;
    assignedTo?: string[] | undefined;
}>;
export declare const createTaskSchema: z.ZodObject<{
    projectId: z.ZodString;
    workType: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    workType: string;
    description?: string | undefined;
    status?: TaskStatus | undefined;
}, {
    projectId: string;
    workType: string;
    description?: string | undefined;
    status?: TaskStatus | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    workType: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    status?: TaskStatus | undefined;
    workType?: string | undefined;
}, {
    description?: string | undefined;
    status?: TaskStatus | undefined;
    workType?: string | undefined;
}>;
export declare const createWorkLogSchema: z.ZodObject<{
    projectId: z.ZodString;
    taskId: z.ZodString;
    hours: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    hours: number;
    projectId: string;
    taskId: string;
    date?: string | undefined;
    notes?: string | undefined;
}, {
    hours: number;
    projectId: string;
    taskId: string;
    date?: string | undefined;
    notes?: string | undefined;
}>;
export declare const createLeaveSchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodEffects<z.ZodString, string, string>;
    endDate: z.ZodEffects<z.ZodString, string, string>;
    reason: z.ZodString;
    leaveType: z.ZodNativeEnum<typeof LeaveType>;
    duration: z.ZodNativeEnum<typeof LeaveDuration>;
    halfDayType: z.ZodOptional<z.ZodNativeEnum<typeof HalfDayType>>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType | undefined;
}, {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType | undefined;
}>, {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType | undefined;
}, {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: LeaveType;
    duration: LeaveDuration;
    halfDayType?: HalfDayType | undefined;
}>;
export declare const reviewLeaveSchema: z.ZodObject<{
    status: z.ZodEnum<[LeaveStatus.Approved, LeaveStatus.Rejected]>;
}, "strip", z.ZodTypeAny, {
    status: LeaveStatus.Approved | LeaveStatus.Rejected;
}, {
    status: LeaveStatus.Approved | LeaveStatus.Rejected;
}>;
//# sourceMappingURL=schemas.d.ts.map