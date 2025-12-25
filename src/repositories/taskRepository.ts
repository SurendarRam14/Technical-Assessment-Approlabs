import prisma from '../config/prisma';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';

export interface GetTasksResult {
  tasks: Task[];
  nextCursor: number | null;
}

export const createTask = async (data: {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  projectId: number;
  dueDate?: Date | null;
  assignedTo?: number | null;
}): Promise<Task> => {
  return prisma.task.create({
    data: {
      ...data,
      priority: data.priority ?? TaskPriority.LOW,
      status: data.status ?? TaskStatus.TODO,
      isDeleted: false,
    },
  });
};

export const findTaskById = async (id: number): Promise<Task | null> => {
  return prisma.task.findFirst({
    where: { id, isDeleted: false },
  });
};

export const assignTask = async (taskId: number, userId: number): Promise<Task> => {
  const task = await prisma.task.findFirst({ where: { id: taskId, isDeleted: false } });
  if (!task) throw new Error('Task not found');

  return prisma.task.update({
    where: { id: taskId },
    data: { assignedTo: userId },
  });
};

export const updateTaskStatus = async (taskId: number, status: TaskStatus): Promise<Task> => {
  const task = await prisma.task.findFirst({ where: { id: taskId, isDeleted: false } });
  if (!task) throw new Error('Task not found');

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
};

export const getTasks = async (
  cursor?: number,
  limit = 10,
  filters?: { status?: TaskStatus; assignedTo?: number }
): Promise<GetTasksResult> => {
  const where: any = { isDeleted: false };

  if (filters?.status) where.status = filters.status;
  if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

  const tasks = await prisma.task.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
  });

  let nextCursor: number | null = null;
  if (tasks.length > limit) {
    const nextItem = tasks.pop();
    nextCursor = nextItem?.id ?? null;
  }

  return { tasks, nextCursor };
};

export const softDeleteTask = async (taskId: number): Promise<Task> => {
  const task = await prisma.task.findFirst({ where: { id: taskId, isDeleted: false } });
  if (!task) throw new Error('Task not found');

  return prisma.task.update({
    where: { id: taskId },
    data: { isDeleted: true },
  });
};
