import { Router } from 'express';
import { registerUser, loginUser, refreshToken, bootstrapAdmin } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/bootstrap:
 *   post:
 *     tags: [Auth]
 *     summary: Initialize system with first organization and admin user
 *     description: Can be called only once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orgName
 *               - email
 *               - password
 *               - name
 *             properties:
 *               orgName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: System initialized successfully
 *       403:
 *         description: System already initialized
 */
router.post('/bootstrap', bootstrapAdmin); // ✅ NEW ENDPOINT

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register an invited user
 *     description: Complete user registration using a valid invitation sent to email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address used in the invitation
 *                 example: "manager@acme.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Manager@123"
 *               name:
 *                 type: string
 *                 example: "Project Manager"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: No valid invitation found or invitation expired
 *       409:
 *         description: User already exists
 */
router.post('/register', registerUser);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh JWT token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', refreshToken);

export default router;
