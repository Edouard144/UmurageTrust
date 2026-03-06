// src/routes/favorite.routes.ts
import { Router } from 'express'
import { save, unsave, list } from '../controllers/favorite.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// All favorite routes require login
router.use(protect)

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Manage user favorite properties
 */

/**
 * @swagger
 * /api/favorites/{propertyId}:
 *   post:
 *     summary: Save a property to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID to save
 *     responses:
 *       201:
 *         description: Property saved to favorites
 *       400:
 *         description: Invalid property ID
 */
router.post('/:propertyId', save)

/**
 * @swagger
 * /api/favorites/{propertyId}:
 *   delete:
 *     summary: Remove a property from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID to remove
 *     responses:
 *       200:
 *         description: Property removed from favorites
 *       404:
 *         description: Property not found in favorites
 */
router.delete('/:propertyId', unsave)

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get all saved properties
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved properties
 */
router.get('/', list)

export default router
