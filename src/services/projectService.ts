import prisma from '../config/prisma';
import { Project, Prisma } from '@prisma/client';

interface GetProjectsResult {
  projects: Project[];
  nextCursor: number | null;
}

export const createProject = async (
  name: string,
  organizationId: number,
  description?: string
): Promise<Project> => {
  console.log('Creating project:', { name, organizationId, description });
  const existing = await prisma.project.findFirst({
    where: { name, organizationId, isDeleted: false },
  });
  console.log(existing);
  if (existing) throw new Error('Project name already exists in your organization');

  return prisma.project.create({
    data: { name, description, organizationId } as Prisma.ProjectUncheckedCreateInput,
  });
};

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

export const getProjectById = async (id: number, deleted: boolean = false): Promise<Project> => {
  const project = await prisma.project.findFirst({
    where: { id, isDeleted: deleted },
  });

  if (!project) throw new Error('Project not found');
  return project;
};

export const updateProject = async (
  id: number,
  organizationId: number,
  name: string,
  description?: string
): Promise<Project> => {
  const result = await prisma.project.updateMany({
    where: { id, organizationId, isDeleted: false },
    data: { name, ...(description && { description }) } as Prisma.ProjectUncheckedUpdateInput,
  });
  if (result.count === 0) throw new Error('Project not found or already deleted');

  return getProjectById(id);
};

export const softDeleteProject = async (id: number): Promise<Project> => {
  const result = await prisma.project.updateMany({
    where: { id, isDeleted: false },
    data: { isDeleted: true },
  });
  console.log('Soft delete result:', result);
  if (result.count === 0) throw new Error('Project not found or already deleted');

  return getProjectById(id,true);
};
