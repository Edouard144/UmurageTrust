// src/routes/verification.routes.ts
import { Router } from 'express'
import { submit, checkStatus, listPending, approve, reject } from '../controllers/verification.controller'
import { protect } from '../middleware/auth.middleware'
import { restrictTo } from '../middleware/role.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Agent verification requests and admin moderation
 */

/**
 * @swagger
 * /api/verification/request:
 *   post:
 *     summary: Submit a verification request (Agent only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Verification request submitted successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be AGENT)
 */
router.post('/request', protect, restrictTo('AGENT'), submit)

/**
 * @swagger
 * /api/verification/status:
 *   get:
 *     summary: Check verification status (Agent only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current verification status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be AGENT)
 */
router.get('/status', protect, restrictTo('AGENT'), checkStatus)

/**
 * @swagger
 * /api/verification/admin/pending:
 *   get:
 *     summary: List all pending verification requests (Admin only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending verification requests
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be ADMIN)
 */
router.get('/admin/pending', protect, restrictTo('ADMIN'), listPending)

/**
 * @swagger
 * /api/verification/admin/{id}/approve:
 *   patch:
 *     summary: Approve a verification request (Admin only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification request ID
 *     responses:
 *       200:
 *         description: Verification request approved
 *       404:
 *         description: Request not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be ADMIN)
 */
router.patch('/admin/:id/approve', protect, restrictTo('ADMIN'), approve)

/**
 * @swagger
 * /api/verification/admin/{id}/reject:
 *   patch:
 *     summary: Reject a verification request (Admin only)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification request ID
 *     responses:
 *       200:
 *         description: Verification request rejected
 *       404:
 *         description: Request not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be ADMIN)
 */
router.patch('/admin/:id/reject', protect, restrictTo('ADMIN'), reject)

export default router
