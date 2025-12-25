import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../config/auth';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

// ------------------- Bootstrap System -------------------
export const bootstrapAdmin = async (req: Request, res: Response) => {
  try {
    const { orgName, email, password, name } = req.body;
    if (!orgName || !email || !password || !name)
      return res.status(400).json({ message: 'All fields are required' });

    const orgCount = await prisma.organization.count();
    if (orgCount > 0)
      return res.status(403).json({ message: 'System already initialized' });

    const organization = await prisma.organization.create({ data: { name: orgName } });
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
        organizationId: organization.id,
      },
    });

    const accessToken = generateAccessToken(admin.id, admin.role);
    const refreshToken = generateRefreshToken(admin.id, admin.role);

    return res.status(201).json({
      message: 'System initialized successfully',
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Bootstrap failed' });
  }
};

// ------------------- Register User -------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // 1. Check for an existing pending invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      include: { organization: true, invitedBy: true },
    });

    if (!invitation) {
      return res.status(400).json({ message: 'No valid invitation found for this email' });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 3. Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: invitation.role,
        organizationId: invitation.organizationId,
      },
    });

    // 4. Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        invitedBy: invitation.invitedBy
          ? {
              id: invitation.invitedBy.id,
              name: invitation.invitedBy.name,
              email: invitation.invitedBy.email,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ------------------- Login User -------------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({ accessToken, refreshToken });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Refresh Token -------------------
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token is required' });

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: number; role: Role };
    } catch {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);
    res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
