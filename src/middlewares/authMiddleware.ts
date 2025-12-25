import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Role } from '@prisma/client';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: Role;
    organizationId: number;
  };
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload & {
      userId: number;
      role: Role;
      organizationId: number;
    };

    if (!decoded.userId || !decoded.role || !decoded.organizationId) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
