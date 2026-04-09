import { Request, Response, NextFunction } from 'express';
/**
 * @desc    Create new event
 * @route   POST /api/v1/events
 * @access  Private/Admin
 */
export declare const createEvent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get all events
 * @route   GET /api/v1/events
 * @access  Private
 */
export declare const getAllEvents: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get single event
 * @route   GET /api/v1/events/:id
 * @access  Private
 */
export declare const getEvent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Update event
 * @route   PATCH /api/v1/events/:id
 * @access  Private/Admin
 */
export declare const updateEvent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private/Admin
 */
export declare const deleteEvent: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=event.controller.d.ts.map