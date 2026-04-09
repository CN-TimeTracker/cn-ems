"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.AppError = void 0;
// ─────────────────────────────────────────────
// CUSTOM APP ERROR CLASS
// ─────────────────────────────────────────────
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        // captureStackTrace is V8-specific — guard for portability
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
// ─────────────────────────────────────────────
// 404 HANDLER — unknown routes
// ─────────────────────────────────────────────
const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
exports.notFound = notFound;
// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Catches everything forwarded via next(err)
// ─────────────────────────────────────────────
const errorHandler = (err, _req, res, _next) => {
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
            .map((e) => e.message)
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map