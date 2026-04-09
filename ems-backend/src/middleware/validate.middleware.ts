import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// ─────────────────────────────────────────────
// VALIDATE — wraps any Zod schema as middleware
// Usage: validate(createUserSchema)
// ─────────────────────────────────────────────

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e: ZodError['errors'][number]) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(err);
    }
  };
