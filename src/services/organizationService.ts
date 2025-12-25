import * as organizationRepo from '../repositories/organizationRepository';
import { Role } from '@prisma/client';
import crypto from 'crypto';


export const createOrganization = async (name: string) => {
  return organizationRepo.createOrganization({ name });
};

export const inviteUser = async (
  email: string,
  organizationId: number,
  role: Role,
  invitedById: number
) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + Number(process.env.INVITATION_TOKEN_EXPIRES_IN) * 60 * 60 * 1000); // 24h

  return organizationRepo.createInvitation({
    email,
    organizationId,
    role,
    token,
    expiresAt,
    invitedById,
  });
};


export const getInvitationByToken = async (token: string) => {
  return organizationRepo.getInvitationByToken(token);
};

export const markInvitationUsed = async (token: string) => {
  return organizationRepo.markInvitationUsed(token);
};
