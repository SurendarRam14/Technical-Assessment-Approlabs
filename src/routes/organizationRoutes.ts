import { Router } from 'express';
import { createOrganization, inviteUser } from '../controllers/organizationController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Organization management routes
 */

/**
 * @swagger
 * /organization:
 *   post:
 *     tags: [Organization]
 *     summary: Create a new organization (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the organization
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not admin
 */
router.post('/', authorizeRoles(Role.ADMIN), createOrganization);

/**
 * @swagger
 * /organization/invite-user:
 *   post:
 *     tags: [Organization]
 *     summary: Invite a user to an organization (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *               - organizationId
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user to invite
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *                 description: Role assigned to the user
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not admin
 */
router.post('/invite-user', authorizeRoles(Role.ADMIN), inviteUser);

export default router;
