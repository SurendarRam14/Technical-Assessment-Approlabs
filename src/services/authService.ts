import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../config/auth';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;

interface TokenPayload {
  userId: number;
  role: Role;
}

// ---------------- Register User ----------------
export const registerUser = async (
  email: string,
  password: string,
  role: Role,
  organizationId: number,
): Promise<User> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      organizationId,
    },
  });

  return user;
};

// ---------------- Login User ----------------
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  return { accessToken, refreshToken };
};

// ---------------- Refresh Access Token ----------------
export const refreshAccessToken = async (token: string): Promise<string> => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload & TokenPayload;
    if (!decoded.userId || !decoded.role) throw new Error('Invalid token payload');

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);
    return newAccessToken;
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};

// ---------------- Bootstrap Admin ----------------
export const bootstrapAdmin = async (
  orgName: string,
  email: string,
  password: string,
  name: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Check if system is already initialized
  const orgCount = await prisma.organization.count();
  if (orgCount > 0) throw new Error('System already initialized');

  // Create organization
  const organization = await prisma.organization.create({ data: { name: orgName } });

  // Hash admin password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: Role.ADMIN,
      organizationId: organization.id,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(admin.id, admin.role);
  const refreshToken = generateRefreshToken(admin.id, admin.role);

  return { accessToken, refreshToken };
};
