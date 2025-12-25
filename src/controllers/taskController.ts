import { AuthRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import prisma from '../config/prisma';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { organizationId } = req.user;

    const { title, description, priority, projectId, dueDate } = req.body;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ message: 'Title and projectId are required' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        isDeleted: false,
        organizationId,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found in your organization' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || TaskPriority.LOW,
        status: TaskStatus.TODO,
        projectId: project.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const assignTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { organizationId } = req.user;

    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        isDeleted: false,
        project: { organizationId },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignedUser = await prisma.user.findFirst({
      where: {
        id: Number(assignedTo),
        organizationId,
      },
    });

    if (!assignedUser) {
      return res
        .status(404)
        .json({ message: 'User not found in your organization' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { assignedTo: assignedUser.id },
    });

    res.json({ message: 'Task assigned', task: updatedTask });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, organizationId } = req.user;

    const { id } = req.params;
    const { status } = req.body as { status: TaskStatus };

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        project: {
          select: { organizationId: true },
        },
      },
    });

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Cross-organization access denied' });
    }

    if (task.assignedTo !== userId) {
      return res
        .status(403)
        .json({ message: 'Not allowed to update this task' });
    }

    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      TODO: [TaskStatus.IN_PROGRESS],
      IN_PROGRESS: [TaskStatus.DONE],
      DONE: [],
    };

    if (!validTransitions[task.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${task.status} to ${status}`,
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status },
    });

    return res.json({
      message: 'Task status updated',
      task: updatedTask,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { organizationId } = req.user;

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { status, assignedTo } = req.query;

    const where: any = {
      isDeleted: false,
      project: { organizationId },
    };

    if (status) where.status = status as TaskStatus;
    if (assignedTo) where.assignedTo = Number(assignedTo);

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

    res.json({ tasks, nextCursor });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { organizationId } = req.user;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        isDeleted: false,
        project: {
          organizationId,
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

