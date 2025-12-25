import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// ---------------- Get all users (ADMIN only) ----------------
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get user by ID (ADMIN only) ----------------
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;

    const foundUser = await prisma.user.findFirst({
      where: { id: Number(id), organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    res.json(foundUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Update user role (ADMIN only) ----------------
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Prevent updating role of a user outside your organization
    const targetUser = await prisma.user.findFirst({
      where: { id: Number(id), organizationId: user.organizationId },
    });
    if (!targetUser) return res.status(404).json({ message: 'User not found in your organization' });

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({ message: 'User role updated', user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
