import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management routes
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project (Admin & Manager only)
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
 *                 description: Project name
 *               description:
 *                 type: string
 *                 description: Optional project description
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID for the project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not admin or manager
 */
router.post('/', authorizeRoles(Role.ADMIN, Role.MANAGER), createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects (any authenticated user)
 *     description: Retrieve projects with optional pagination, sorting, and filtering.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the last project from previous page for cursor-based pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of projects to return per page
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter projects by organization ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name]
 *           default: createdAt
 *         required: false
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         required: false
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of projects with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       organizationId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       isDeleted:
 *                         type: boolean
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                   description: ID for the next page cursor (null if no more records)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/:id', getProjectById);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project (Admin & Manager only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not admin or manager
 *       404:
 *         description: Project not found
 */
router.patch('/:id', authorizeRoles(Role.ADMIN, Role.MANAGER), updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Soft-delete a project (Admin & Manager only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project soft-deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not admin or manager
 *       404:
 *         description: Project not found
 */
router.delete('/:id', authorizeRoles(Role.ADMIN, Role.MANAGER), deleteProject);

export default router;
