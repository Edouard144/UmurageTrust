// src/routes/user.routes.ts
import { Router } from 'express'
import {
  getMyProfile,
  updateMyProfile,
  updatePassword,
  getAgent,
  uploadAvatar,
} from '../controllers/user.controller'
import { protect } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { validate } from '../middleware/validate.middleware'
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and agent management
 */

/**
 * @swagger
 * /api/users/agents/{id}:
 *   get:
 *     summary: Get agent public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent profile returned successfully
 *       404:
 *         description: Agent not found
 */
router.get('/agents/:id', getAgent)

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', protect, getMyProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.put('/profile', protect, validate(updateProfileSchema), updateMyProfile)

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Current password incorrect
 */
router.put('/password', protect, validate(changePasswordSchema), updatePassword)

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload or update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Not authenticated
 */
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar)

export default router
