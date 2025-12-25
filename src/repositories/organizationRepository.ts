import prisma from '../config/db';
import { Role } from '@prisma/client';

interface CreateOrganizationInput {
  name: string;
}

interface CreateInvitationInput {
  email: string;
  organizationId: number;
  role: Role;
  token: string;
  expiresAt: Date;
  invitedById: number;
}

// ----------------- Organization -----------------
export const createOrganization = async (data: CreateOrganizationInput) => {
  return prisma.organization.create({ data });
};

// ----------------- Invitation -----------------
export const createInvitation = async (data: CreateInvitationInput) => {
  return prisma.invitation.create({
    data: {
      email: data.email,
      role: data.role,
      token: data.token,
      organizationId: data.organizationId,
      invitedById: data.invitedById,
      expiresAt: data.expiresAt,
      used: false,
    },
  });
};

export const getInvitationByToken = async (token: string) => {
  return prisma.invitation.findFirst({
    where: {
      token,
      used: false,
      expiresAt: { gte: new Date() },
    },
    include: { organization: true, invitedBy: true },
  });
};

export const markInvitationUsed = async (token: string) => {
  return prisma.invitation.update({
    where: { token },
    data: { used: true },
  });
};
