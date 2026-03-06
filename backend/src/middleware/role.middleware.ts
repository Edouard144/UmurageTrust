// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express'

// Takes a list of allowed roles and returns a middleware function
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    // If user's role is not in the allowed list, block access
    if (!roles.includes(user.role)) {
      res.status(403).json({
        message: 'You do not have permission to perform this action',
      })
      return
    }

    next()
  }
}