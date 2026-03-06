// src/routes/review.routes.ts
import { Router } from 'express'
import { create, getByProperty, getByAgent, remove } from '../controllers/review.controller'
import { protect } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createReviewSchema } from '../validators/review.validator'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Property and agent reviews
 */

/**
 * @swagger
 * /api/reviews/property/{propertyId}:
 *   get:
 *     summary: Get reviews for a property
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of property reviews
 *       404:
 *         description: Property not found
 */
router.get('/property/:propertyId', getByProperty)

/**
 * @swagger
 * /api/reviews/agent/{agentId}:
 *   get:
 *     summary: Get reviews for an agent
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: List of agent reviews
 *       404:
 *         description: Agent not found
 */
router.get('/agent/:agentId', getByAgent)

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post('/', protect, validate(createReviewSchema), create)

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', protect, remove)

export default router
