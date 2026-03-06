// src/validators/message.validator.ts
import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiverId: z
    .string()
    .uuid('Invalid receiver ID'),

  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),

  propertyId: z
    .string()
    .uuid('Invalid property ID')
    .optional(),
})