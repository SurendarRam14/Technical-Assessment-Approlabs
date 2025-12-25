import prisma from '../config/prisma';
import { User, Role } from '@prisma/client';

export const createUser = async (data: {
  email: string;
  password: string;
  role?: Role;
  name: string;
  organizationId: number;
}): Promise<User> => {
  return await prisma.user.create({
    data: {
      ...data,
      role: data.role ?? Role.USER,
    },
  });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: number, organizationId?: number): Promise<User | null> => {
  const where = organizationId ? { id, organizationId } : { id };
  return await prisma.user.findFirst({ where });
};

export const getAllUsers = async (organizationId?: number): Promise<User[]> => {
  const where = organizationId ? { organizationId } : {};
  return await prisma.user.findMany({ where });
};

export const updateUserRole = async (id: number, role: Role, organizationId?: number): Promise<User> => {
  const user = await findUserById(id, organizationId);
  if (!user) throw new Error('User not found');

  return await prisma.user.update({
    where: { id },
    data: { role },
  });
};
