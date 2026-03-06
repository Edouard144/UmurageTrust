// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../prisma/client'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    // Header format: "Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Not authorized, no token' })
      return
    }

    // Extract token after "Bearer "
    const token = authHeader.split(' ')[1]

    // Verify token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: string
    }

    // Find user in database and attach to request
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
      },
    })

    if (!user) {
      res.status(401).json({ message: 'User no longer exists' })
      return
    }

    // Attach user to request so controllers can use it
    ;(req as any).user = user

    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}