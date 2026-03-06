// src/controllers/message.controller.ts
import { Request, Response } from 'express'
import { sendMessage, getInbox, getConversation } from '../services/message.service'

// ── Send message ───────────────────────────────────────
export const send = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id
    const { receiverId, content, propertyId } = req.body

    if (!receiverId || !content) {
      res.status(400).json({ message: 'receiverId and content are required' })
      return
    }

    const message = await sendMessage(senderId, receiverId, content, propertyId)
    res.status(201).json({ message: 'Message sent successfully', data: message })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Get inbox ──────────────────────────────────────────
export const inbox = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const messages = await getInbox(userId)
    res.status(200).json({ messages })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Get conversation ───────────────────────────────────
export const conversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { userId: otherUserId } = req.params

    const result = await getConversation(userId, otherUserId as string)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}