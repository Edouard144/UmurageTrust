// src/validators/review.validator.ts
import { z } from 'zod'

export const createReviewSchema = z.object({
  agentId: z
    .string()
    .uuid('Invalid agent ID'),

  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  comment: z
    .string()
    .max(500, 'Comment too long')
    .optional(),

  propertyId: z
    .string()
    .uuid('Invalid property ID')
    .optional(),
})