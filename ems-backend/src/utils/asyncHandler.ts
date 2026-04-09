import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to catch errors and forward to global error handler
export const asyncHandler =
  <T extends Request = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
