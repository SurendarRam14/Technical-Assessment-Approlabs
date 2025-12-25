import prisma from '../config/db';
import { Role, User } from '@prisma/client';

// ---------------- Get all users (ADMIN only) ----------------
export const getAllUsers = async (organizationId?: number): Promise<User[]> => {
  const where = organizationId ? { organizationId } : {};
  return await prisma.user.findMany({ where });
};

// ---------------- Get user by ID ----------------
export const getUserById = async (id: number, organizationId?: number): Promise<User> => {
  const where = organizationId ? { id, organizationId } : { id };
  const user = await prisma.user.findUnique({ where });
  if (!user) throw new Error('User not found');
  return user;
};

// ---------------- Update user role ----------------
export const updateUserRole = async (id: number, role: Role, organizationId?: number): Promise<User> => {
  // Ensure the user exists and belongs to the organization (if provided)
  const user = await prisma.user.findFirst({
    where: organizationId ? { id, organizationId } : { id },
  });
  if (!user) throw new Error('User not found');

  return await prisma.user.update({
    where: { id },
    data: { role },
  });
};
