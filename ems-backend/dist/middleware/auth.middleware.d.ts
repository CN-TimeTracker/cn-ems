import { Response, NextFunction } from 'express';
import { IAuthRequest, UserRole } from '../interfaces';
export declare const protect: (req: IAuthRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: IAuthRequest, res: Response, next: NextFunction) => void;
export declare const roleGuard: (...roles: UserRole[]) => (req: IAuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map