// src/routes/admin.routes.ts
import { Router } from 'express'
import {
  listPendingProperties,
  approve,
  reject,
  listUsers,
  removeUser,
} from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'
import { restrictTo } from '../middleware/role.middleware'

const router = Router()

// All admin routes require login + ADMIN role
router.use(protect)
router.use(restrictTo('ADMIN'))

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations for property moderation and user management
 */

/**
 * @swagger
 * /api/admin/properties/pending:
 *   get:
 *     summary: Get all pending properties
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending properties
 */
router.get('/properties/pending', listPendingProperties)

/**
 * @swagger
 * /api/admin/properties/{id}/approve:
 *   patch:
 *     summary: Approve a property
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property approved successfully
 */
router.patch('/properties/:id/approve', approve)

/**
 * @swagger
 * /api/admin/properties/{id}/reject:
 *   patch:
 *     summary: Reject a property
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property rejected successfully
 */
router.patch('/properties/:id/reject', reject)

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', listUsers)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', removeUser)

export default router
