// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// Takes a Zod schema and validates req.body against it
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      // Format zod errors into clean readable messages
      const errors = (result.error as ZodError).issues?.map((e) => ({
        field: e.path.join('.') || 'unknown',
        message: e.message,
      })) ?? []

      res.status(400).json({
        message: 'Validation failed',
        errors,
      })
      return
    }

    // Replace req.body with validated + typed data
    req.body = result.data
    next()
  }
}