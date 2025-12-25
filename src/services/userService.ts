import prisma from '../config/prisma';
import { Role, User } from '@prisma/client';

export const getAllUsers = async (organizationId?: number): Promise<User[]> => {
  const where = organizationId ? { organizationId } : {};
  return await prisma.user.findMany({ where });
};

export const getUserById = async (id: number, organizationId?: number): Promise<User> => {
  const where = organizationId ? { id, organizationId } : { id };
  const user = await prisma.user.findUnique({ where });
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUserRole = async (id: number, role: Role, organizationId?: number): Promise<User> => {
  const user = await prisma.user.findFirst({
    where: organizationId ? { id, organizationId } : { id },
  });
  if (!user) throw new Error('User not found');

  return await prisma.user.update({
    where: { id },
    data: { role },
  });
};
