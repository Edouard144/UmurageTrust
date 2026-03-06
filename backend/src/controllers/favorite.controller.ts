// src/controllers/favorite.controller.ts
import { Request, Response } from 'express'
import { addFavorite, removeFavorite, getFavorites } from '../services/favorite.service'

// ── Save property ──────────────────────────────────────
export const save = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { propertyId } = req.params

    const favorite = await addFavorite(userId, propertyId as string)
    res.status(201).json({ message: 'Property saved successfully', favorite })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Remove saved property ──────────────────────────────
export const unsave = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { propertyId } = req.params

    await removeFavorite(userId, propertyId as string)
    res.status(200).json({ message: 'Property removed from favorites' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// ── Get all favorites ──────────────────────────────────
export const list = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const favorites = await getFavorites(userId)
    res.status(200).json({ favorites })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}