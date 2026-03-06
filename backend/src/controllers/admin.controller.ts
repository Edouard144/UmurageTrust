// src/controllers/admin.controller.ts
import { Request, Response } from 'express'
import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  deleteUser,
} from '../services/admin.service'

// ── Get pending properties ─────────────────────────────
export const listPendingProperties = async (req: Request, res: Response) => {
  try {
    const properties = await getPendingProperties()
    res.status(200).json({ properties })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Approve property ───────────────────────────────────
export const approve = async (req: Request, res: Response) => {
  try {
    const property = await approveProperty(req.params.id as string)
    res.status(200).json({ message: 'Property approved successfully', property })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Reject property ────────────────────────────────────
export const reject = async (req: Request, res: Response) => {
  try {
    const property = await rejectProperty(req.params.id as string)
    res.status(200).json({ message: 'Property rejected', property })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Get all users ──────────────────────────────────────
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers()
    res.status(200).json({ users })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Delete user ────────────────────────────────────────
export const removeUser = async (req: Request, res: Response) => {
  try {
    await deleteUser(req.params.id as string)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}