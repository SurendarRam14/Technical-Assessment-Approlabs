import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * Generate JWT access token (short-lived, 15 minutes)
 */
export const generateAccessToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

/**
 * Generate JWT refresh token (long-lived, 7 days)
 */
export const generateRefreshToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
