import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Role } from '@prisma/client';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

interface JwtPayload {
  userId: number;
  role: Role;
  organizationId: number;
}

const accessTokenExpiry =
  process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'];

const refreshTokenExpiry =
  process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'];

export const generateAccessToken = (
  userId: number,
  role: Role,
  organizationId: number
) => {
  const payload: JwtPayload = { userId, role, organizationId };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiry,
  });
};

export const generateRefreshToken = (
  userId: number,
  role: Role,
  organizationId: number
) => {
  const payload: JwtPayload = { userId, role, organizationId };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiry,
  });
};
