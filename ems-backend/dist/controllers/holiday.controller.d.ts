import { Request, Response } from 'express';
/**
 * GET /api/v1/holidays
 * Get all public holidays
 */
export declare const getAllHolidays: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/v1/holidays
 * Add a new public holiday [Admin Only]
 */
export declare const addHoliday: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * DELETE /api/v1/holidays/:id
 * Remove a public holiday [Admin Only]
 */
export declare const deleteHoliday: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=holiday.controller.d.ts.map