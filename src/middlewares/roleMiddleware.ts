import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Role } from '@prisma/client'; // if you use the Role enum from Prisma

// Role-based access control middleware
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ 
        message: `Forbidden: Role '${req.user.role}' is not allowed` 
      });
    }

    next();
  };
};
