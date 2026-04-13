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

          // Use the first error message as the primary message for toasts
          const primaryMessage = errors.length > 0 ? errors[0].message : 'Validation failed';

          res.status(400).json({
            success: false,
            message: primaryMessage,
            errors,
          });
          return;
        }
        next(err);
      }
    };
