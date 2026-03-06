// src/services/favorite.service.ts
import prisma from '../prisma/client'

// ── Save a property ────────────────────────────────────
export const addFavorite = async (userId: string, propertyId: string) => {
  // Check if property exists
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) throw new Error('Property not found')

  // Check if already favorited — prevent duplicates
  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  })
  if (existing) throw new Error('Property already saved')

  return await prisma.favorite.create({
    data: { userId, propertyId },
    include: {
      property: {
        include: { images: true },
      },
    },
  })
}

// ── Remove a saved property ────────────────────────────
export const removeFavorite = async (userId: string, propertyId: string) => {
  // Check if favorite exists before trying to delete
  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  })
  if (!existing) throw new Error('Property not in favorites')

  return await prisma.favorite.delete({
    where: { userId_propertyId: { userId, propertyId } },
  })
}

// ── Get all saved properties for a user ────────────────
export const getFavorites = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // most recently saved first
    include: {
      property: {
        include: {
          images: true,
          owner: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      },
    },
  })

  return favorites
}