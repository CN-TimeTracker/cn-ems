import { Response } from 'express';
/**
 * GET /api/v1/payslips/generate
 * [Protected]
 * Generates dynamic payslip data based on salary
 */
export declare const generateDynamicPayslip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/payslips/config/all
 * [Admin Only]
 */
export declare const getAllSalaryConfigs: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/payslips/config/me
 * [Protected]
 * Get all configs for the logged-in user (to show history)
 */
export declare const getUserSalaryConfigs: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/payslips/config
 * [Protected]
 */
export declare const getSalaryConfig: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/v1/payslips/config
 * [Admin Only]
 * Update LOP override and approval status
 */
export declare const updateSalaryConfig: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/v1/payslips/upload
 * [Admin Only]
 * Upload a payslip for an employee by code
 */
export declare const uploadPayslip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/payslips/download
 * [Protected]
 * Employee fetches their own payslip
 */
export declare const getPayslip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/payslips/history
 * [Protected]
 */
export declare const getPayslipHistory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=payslip.controller.d.ts.map