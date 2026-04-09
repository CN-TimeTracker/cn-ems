"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// PROTECT — verifies JWT on every protected route
// ─────────────────────────────────────────────
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.protect = protect;
// ─────────────────────────────────────────────
// ADMIN ONLY — must come after protect middleware
// ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user?.role !== interfaces_1.UserRole.Admin) {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
// ─────────────────────────────────────────────
// ROLE GUARD — restrict to specific roles
// Usage: roleGuard(UserRole.Admin, UserRole.Dev)
// ─────────────────────────────────────────────
const roleGuard = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Allowed roles: ${roles.join(', ')}`,
            });
            return;
        }
        next();
    };
};
exports.roleGuard = roleGuard;
//# sourceMappingURL=auth.middleware.js.map