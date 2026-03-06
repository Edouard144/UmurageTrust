// src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import { registerUser, loginUser } from '../services/auth.service'

// ── Register ───────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body

    // Basic check — make sure all fields are provided
    if (!fullName || !email || !phone || !password) {
      res.status(400).json({ message: 'All fields are required' })
      return
    }

    const result = await registerUser({ fullName, email, phone, password })

    res.status(201).json({
      message: 'Account created successfully',
      user: result.user,
      token: result.token,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Login ──────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const result = await loginUser({ email, password })

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    })
  } catch (error: any) {
    res.status(401).json({ message: error.message })
  }
}

// ── Get Current User (me) ──────────────────────────────
export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user is set by auth middleware (we build that next)
    res.status(200).json({
      user: (req as any).user,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}