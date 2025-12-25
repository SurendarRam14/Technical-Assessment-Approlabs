import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

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
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: number | null = null;
    if (users.length > limit) {
      const nextItem = users.pop();
      nextCursor = nextItem?.id ?? null;
    }

    res.json({ users, nextCursor });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

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

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    const { role } = req.body;

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
