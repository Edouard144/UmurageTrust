// src/controllers/user.controller.ts
import { Request, Response } from 'express'
import {
  getUserProfile,
  updateProfile,
  changePassword,
  getAgentProfile,
} from '../services/user.service'
import { uploadImage } from '../utils/cloudinary'



// ── Get my profile ─────────────────────────────────────
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = await getUserProfile(userId)
    res.status(200).json({ user })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Update my profile ──────────────────────────────────
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { fullName, phone } = req.body

    const user = await updateProfile(userId, { fullName, phone })
    res.status(200).json({ message: 'Profile updated successfully', user })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Change password ────────────────────────────────────
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Both current and new password are required' })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' })
      return
    }

    const result = await changePassword(userId, currentPassword, newPassword)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Get agent public profile ───────────────────────────
export const getAgent = async (req: Request, res: Response) => {
  try {
    const agent = await getAgentProfile(req.params.id as string)
    res.status(200).json({ agent })
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}

// ── Upload avatar ──────────────────────────────────────
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const file = req.file as Express.Multer.File

    console.log('File received:', file) // ← add this to debug

    if (!file) {
      res.status(400).json({ message: 'No image provided' })
      return
    }

    // Convert buffer to base64 and upload to Cloudinary
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    const imageUrl = await uploadImage(base64)

    console.log('Cloudinary URL:', imageUrl) // ← add this to debug

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      imageUrl,
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    res.status(400).json({ message: error.message })
  }
}