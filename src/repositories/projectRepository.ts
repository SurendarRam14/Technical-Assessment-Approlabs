import prisma from '../config/db';
import { Project } from '@prisma/client';

interface GetProjectsResult {
  projects: Project[];
  nextCursor: number | null;
}

// ---------------- Create Project ----------------
export const createProject = async (
  name: string,
  organizationId: number,
  description?: string
): Promise<Project> => {
  return prisma.project.create({
    data: {
      name,
      organizationId,
      ...(description !== undefined && { description }),
    },
  });
};

// ---------------- Find Project by Name ----------------
export const findProjectByName = async (
  name: string,
  organizationId: number
): Promise<Project | null> => {
  return prisma.project.findFirst({
    where: { name, organizationId, isDeleted: false },
  });
};

// ---------------- Find Project by ID ----------------
export const findProjectById = async (
  id: number,
  organizationId: number
): Promise<Project | null> => {
  return prisma.project.findFirst({
    where: { id, organizationId, isDeleted: false },
  });
};

// ---------------- Get Projects with Cursor-based Pagination ----------------
export const getProjects = async (
  organizationId: number,
  cursor?: number,
  limit = 10
): Promise<GetProjectsResult> => {
  const projects = await prisma.project.findMany({
    where: { organizationId, isDeleted: false },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
  });

  let nextCursor: number | null = null;
  if (projects.length > limit) {
    const nextItem = projects.pop();
    nextCursor = nextItem?.id ?? null;
  }

  return { projects, nextCursor };
};

// ---------------- Update Project ----------------
export const updateProject = async (
  id: number,
  organizationId: number,
  name: string,
  description?: string
): Promise<Project> => {
  const updated = await prisma.project.updateMany({
    where: { id, organizationId, isDeleted: false },
    data: { name, ...(description !== undefined && { description }) },
  });

  if (updated.count === 0) throw new Error('Project not found or already deleted');

  const project = await findProjectById(id, organizationId);
  if (!project) throw new Error('Project not found after update');
  return project;
};

// ---------------- Soft Delete Project ----------------
export const softDeleteProject = async (
  id: number,
  organizationId: number
): Promise<Project> => {
  const deleted = await prisma.project.updateMany({
    where: { id, organizationId, isDeleted: false },
    data: { isDeleted: true },
  });

  if (deleted.count === 0) throw new Error('Project not found or already deleted');

  const project = await findProjectById(id, organizationId);
  if (!project) throw new Error('Project not found after deletion');
  return project;
};
