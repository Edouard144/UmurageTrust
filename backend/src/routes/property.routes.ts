// src/routes/property.routes.ts
import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  uploadImages,
  analytics
} from "../controllers/property.controller";
import { protect } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";
import { validate } from '../middleware/validate.middleware'
import { createPropertySchema, updatePropertySchema } from '../validators/property.validator'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property listings, management, and analytics
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all approved properties with filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [LAND, HOUSE, APARTMENT, COMMERCIAL]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, most_viewed, oldest]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of properties with pagination
 */
router.get("/", getAll)

/**
 * @swagger
 * /api/properties/{slug}:
 *   get:
 *     summary: Get single property by slug
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get("/:slug", getOne)

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyInput'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not authorized (must be AGENT or ADMIN)
 */
router.post("/", protect, restrictTo("AGENT", "ADMIN"), validate(createPropertySchema), create)

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePropertyInput'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 *       403:
 *         description: Not authorized
 */
router.put("/:id", protect, restrictTo("AGENT", "ADMIN"), validate(updatePropertySchema), update)

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (soft delete)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 *       403:
 *         description: Not authorized
 */
router.delete("/:id", protect, restrictTo("AGENT", "ADMIN", "BUYER"), remove)

/**
 * @swagger
 * /api/properties/{id}/images:
 *   post:
 *     summary: Upload property images (max 5)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid request or too many images
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be AGENT or ADMIN)
 */
router.post("/:id/images", protect, restrictTo("AGENT", "ADMIN"), upload.array("images", 5), uploadImages)

/**
 * @swagger
 * /api/properties/{id}/analytics:
 *   get:
 *     summary: Get property analytics (views, favorites, etc.)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property analytics data
 *       404:
 *         description: Property not found
 *       403:
 *         description: Not authorized
 */
router.get("/:id/analytics", protect, restrictTo("AGENT", "ADMIN"), analytics)

export default router
