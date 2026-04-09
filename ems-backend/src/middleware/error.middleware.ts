import { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────
// CUSTOM APP ERROR CLASS
// ─────────────────────────────────────────────

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // captureStackTrace is V8-specific — guard for portability
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ─────────────────────────────────────────────
// 404 HANDLER — unknown routes
// ─────────────────────────────────────────────

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Catches everything forwarded via next(err)
// ─────────────────────────────────────────────

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log unexpected errors in dev
  if (statusCode === 500 && process.env.NODE_ENV === 'development') {
    console.error('🔴 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
