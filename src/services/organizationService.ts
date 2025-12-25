import * as organizationRepo from '../repositories/organizationRepository';
import { Role } from '@prisma/client';
import crypto from 'crypto';

/**
 * Create organization
 */
export const createOrganization = async (name: string) => {
  return organizationRepo.createOrganization({ name });
};

/**
 * Invite user with secure token
 * @param email - Email of invited user
 * @param organizationId - Organization ID
 * @param role - Role to assign
 * @param invitedById - Admin ID creating invitation
 */
export const inviteUser = async (
  email: string,
  organizationId: number,
  role: Role,
  invitedById: number
) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  return organizationRepo.createInvitation({
    email,
    organizationId,
    role,
    token,
    expiresAt,
    invitedById,
  });
};

/**
 * Get invitation by token (used in registration)
 */
export const getInvitationByToken = async (token: string) => {
  return organizationRepo.getInvitationByToken(token);
};

/**
 * Mark invitation as used after successful registration
 */
export const markInvitationUsed = async (token: string) => {
  return organizationRepo.markInvitationUsed(token);
};
