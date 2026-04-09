import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, IJwtPayload, UserRole } from '../interfaces';

// ─────────────────────────────────────────────
// PROTECT — verifies JWT on every protected route
// ─────────────────────────────────────────────

export const protect = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET as string;

    const decoded = jwt.verify(token, secret) as IJwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─────────────────────────────────────────────
// ADMIN ONLY — must come after protect middleware
// ─────────────────────────────────────────────

export const adminOnly = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== UserRole.Admin) {
    res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    return;
  }
  next();
};

// ─────────────────────────────────────────────
// ROLE GUARD — restrict to specific roles
// Usage: roleGuard(UserRole.Admin, UserRole.Dev)
// ─────────────────────────────────────────────

export const roleGuard = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
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
