import prisma from '../config/prisma';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';

interface GetTasksResult {
  tasks: Task[];
  nextCursor: number | null;
}

export const createTask = async (
  title: string,
  description: string | null,
  priority: TaskPriority,
  projectId: number,
  organizationId: number,
  dueDate?: Date
): Promise<Task> => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId, isDeleted: false },
  });
  if (!project) throw new Error('Project not found in your organization');

  return prisma.task.create({
    data: {
      title,
      description,
      priority,
      status: TaskStatus.TODO,
      projectId,
      dueDate: dueDate ?? null,
      isDeleted: false,
    },
  });
};

export const assignTask = async (
  taskId: number,
  userId: number,
  organizationId: number
): Promise<Task> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { organizationId }, isDeleted: false },
  });
  if (!task) throw new Error('Task not found');

  const assignedUser = await prisma.user.findFirst({
    where: { id: userId, organizationId },
  });
  if (!assignedUser) throw new Error('User not found in your organization');

  return prisma.task.update({
    where: { id: taskId },
    data: { assignedTo: userId },
  });
};

export const updateTaskStatus = async (
  taskId: number,
  userId: number,
  status: TaskStatus,
  organizationId: number
): Promise<Task> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { organizationId }, isDeleted: false },
  });
  if (!task) throw new Error('Task not found');
  if (task.assignedTo !== userId) throw new Error('Not authorized to update this task');

  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    TODO: [TaskStatus.IN_PROGRESS],
    IN_PROGRESS: [TaskStatus.DONE],
    DONE: [],
  };

  if (!validTransitions[task.status].includes(status)) {
    throw new Error(`Invalid status transition from ${task.status} to ${status}`);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
};

export const getTasks = async (
  organizationId: number,
  cursor?: number,
  limit = 10,
  status?: TaskStatus,
  assignedToId?: number
): Promise<GetTasksResult> => {
  const where: any = { project: { organizationId }, isDeleted: false };
  if (status) where.status = status;
  if (assignedToId) where.assignedTo = assignedToId;

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

export const getTaskById = async (taskId: number, organizationId: number): Promise<Task> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { organizationId }, isDeleted: false },
  });
  if (!task) throw new Error('Task not found');
  return task;
};
