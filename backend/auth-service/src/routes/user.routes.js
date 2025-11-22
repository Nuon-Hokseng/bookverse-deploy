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
router.get('/profile', authMiddleware, getProfile);
router.patch(
  '/profile',
  authMiddleware,
  updateUserValidator,
  validate,
  updateProfile
);
router.patch(
  '/password',
  authMiddleware,
  updatePasswordValidator,
  validate,
  updatePassword
);

export default router;
