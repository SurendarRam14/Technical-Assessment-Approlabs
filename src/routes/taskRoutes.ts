import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  assignTask,
} from '../controllers/taskController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management routes
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task (Manager only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               projectId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not manager
 */
router.post('/', authorizeRoles(Role.MANAGER), createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks (any authenticated user)
 *     description: Retrieve tasks with optional pagination and filtering.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the last task from previous page for cursor-based pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of tasks to return per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *         required: false
 *         description: Filter tasks by status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks assigned to a specific user ID
 *     responses:
 *       200:
 *         description: List of tasks with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       priority:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH]
 *                       status:
 *                         type: string
 *                         enum: [TODO, IN_PROGRESS, DONE]
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       assignedTo:
 *                         type: integer
 *                         nullable: true
 *                       projectId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                   description: ID for the next page cursor (null if no more records)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTaskById);

/**
 * @swagger
 * /tasks/{id}/assign:
 *   patch:
 *     tags: [Tasks]
 *     summary: Assign a task to a user (Manager only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: integer
 *                 description: User ID to assign the task
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not manager
 *       404:
 *         description: Task not found
 */
router.patch('/:id/assign', authorizeRoles(Role.MANAGER), assignTask);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status (assigned user only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, user not assigned to task
 *       404:
 *         description: Task not found
 */
router.patch('/:id/status', updateTaskStatus);

export default router;
