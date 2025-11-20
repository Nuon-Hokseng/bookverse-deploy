import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { updateUserValidator, updatePasswordValidator } from '../middleware/validators/user.validator.js';
import { validate } from '../middleware/validators/validator.js';

import {
  getProfile,
  updateProfile,
  updatePassword,
} from '../controllers/user.controller.js';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
// View personal info
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   patch:
 *     summary: Update user's name or email
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Update username/email
router.patch(
  '/profile',
  authMiddleware,
  updateUserValidator,
  validate,
  updateProfile
);

/**
 * @swagger
 * /api/user/password:
 *   patch:
 *     summary: Update user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Update password
router.patch(
  '/password',
  authMiddleware,
  updatePasswordValidator,
  validate,
  updatePassword
);

export default router;
