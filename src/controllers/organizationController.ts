import { Request, Response } from 'express';
import * as organizationService from '../services/organizationService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Organization name is required' });

    const organization = await organizationService.createOrganization(name);
    res.status(201).json({ organization });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });

    const { email, organizationId, role } = req.body;
    if (!email || !organizationId || !role)
      return res.status(400).json({ message: 'Email, organizationId, and role are required' });

    const invitation = await organizationService.inviteUser(email, organizationId, role, req.user.userId);
    res.status(201).json({ invitation });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
