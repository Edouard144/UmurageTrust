// src/controllers/notification.controller.ts
import { Request, Response } from 'express'
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notification.service'

// ── Get all notifications ──────────────────────────────
export const getAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const result = await getUserNotifications(userId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Mark single notification as read ──────────────────
export const readOne = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const notification = await markAsRead(req.params.id as string, userId)
    res.status(200).json({ message: 'Notification marked as read', notification })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Mark all notifications as read ────────────────────
export const readAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await markAllAsRead(userId)
    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Delete a notification ──────────────────────────────
export const remove = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await deleteNotification(req.params.id as string, userId)
    res.status(200).json({ message: 'Notification deleted' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}