import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as projectService from '../services/projectService';
import { Role } from '@prisma/client';

// ---------------- Create Project (ADMIN / MANAGER) ----------------
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MANAGER)
      return res.status(403).json({ message: 'Forbidden' });

    const { name, description, organizationId } = req.body;

    // Validate mandatory fields
    if (!name || !organizationId) {
      return res.status(400).json({ message: 'Project name and organizationId are required' });
    }

    const project = await projectService.createProject(name, organizationId, description);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get All Projects ----------------
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await projectService.getProjects(req.user.organizationId!, cursor, limit);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get Project by ID ----------------
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await projectService.getProjectById(Number(req.params.id));
    res.json(project);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------- Update Project (ADMIN / MANAGER) ----------------
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MANAGER)
      return res.status(403).json({ message: 'Forbidden' });

    const { name, description } = req.body;
    const project = await projectService.updateProject(
      Number(req.params.id),
      req.user.organizationId!,
      name,
      description
    );
    res.json({ message: 'Project updated successfully', project });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Soft Delete Project (ADMIN / MANAGER) ----------------
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { role } = req.user;
    if (role !== Role.ADMIN && role !== Role.MANAGER)
      return res.status(403).json({ message: 'Forbidden' });

    const project = await projectService.softDeleteProject(Number(req.params.id));
    console.log('Soft deleted project:', project);
    res.json({ message: 'Project soft-deleted', project });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
