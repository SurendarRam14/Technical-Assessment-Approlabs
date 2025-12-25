import { AuthRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import prisma from '../config/db';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

// ---------------- Create Task (MANAGER only) ----------------
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const { title, description, priority, projectId, dueDate } = req.body;
    if (!title || !projectId)
      return res.status(400).json({ message: 'Title and projectId are required' });

    // Ensure project belongs to the same organization
    const project = await prisma.project.findFirst({
      where: { id: Number(projectId), isDeleted: false },
    });
    if (!project) return res.status(404).json({ message: 'Project not found in your organization' });

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

    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Assign Task (MANAGER only) ----------------
export const assignTask = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.organizationId)
      return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const { userId } = req.body;

    // Get task
    const task = await prisma.task.findFirst({
      where: { id: Number(id), project: { organizationId: user.organizationId }, isDeleted: false },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure assigned user exists in same org
    const assignedUser = await prisma.user.findFirst({
      where: { id: Number(userId), organizationId: user.organizationId },
    });
    if (!assignedUser) return res.status(404).json({ message: 'User not found in your organization' });

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { assignedTo: assignedUser.id },
    });

    res.json({ message: 'Task assigned', task: updatedTask });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Update Task Status (assigned user only) ----------------
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.organizationId)
      return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const { status } = req.body as { status: TaskStatus };
    if (!status) return res.status(400).json({ message: 'Status is required' });

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });
    if (!task || task.isDeleted) return res.status(404).json({ message: 'Task not found' });

    // Only assigned user can update
    if (task.assignedTo !== user.userId) // ✅ use user.userId
      return res.status(403).json({ message: 'Not allowed to update this task' });

    // Valid status transitions
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      TODO: [TaskStatus.IN_PROGRESS, TaskStatus.TODO],
      IN_PROGRESS: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      DONE: [TaskStatus.DONE],
    };

    if (!validTransitions[task.status].includes(status)) {
      return res.status(400).json({ message: `Invalid status transition from ${task.status} to ${status}` });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status },
    });

    res.json({ message: 'Task status updated', task: updatedTask });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get Tasks with Pagination & Filtering ----------------
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.organizationId)
      return res.status(401).json({ message: 'Unauthorized' });

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { status, assignedTo } = req.query;

    const where: any = {
      isDeleted: false,
      project: { organizationId: user.organizationId },
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

// ---------------- Get Task by ID ----------------
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.organizationId)
      return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: Number(id), isDeleted: false, project: { organizationId: user.organizationId } },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
