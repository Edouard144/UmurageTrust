// src/services/review.service.ts
import prisma from '../prisma/client'

// ── Create a review ────────────────────────────────────
export const createReview = async (
  reviewerId: string,
  agentId: string,
  rating: number,
  comment?: string,
  propertyId?: string
) => {
  // Cannot review yourself
  if (reviewerId === agentId) {
    throw new Error('You cannot review yourself')
  }

  // Rating must be between 1 and 5
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Check if agent exists
  const agent = await prisma.user.findUnique({ where: { id: agentId } })
  if (!agent) throw new Error('Agent not found')
  if (agent.role !== 'AGENT') throw new Error('You can only review agents')

  // Check if already reviewed this agent — one review per agent per user
  const existing = await prisma.review.findUnique({
    where: { reviewerId_agentId: { reviewerId, agentId } },
  })
  if (existing) throw new Error('You have already reviewed this agent')

  return await prisma.review.create({
    data: { reviewerId, agentId, rating, comment, propertyId },
    include: {
      reviewer: {
        select: { id: true, fullName: true },
      },
      agent: {
        select: { id: true, fullName: true },
      },
    },
  })
}

// ── Get reviews for a property ─────────────────────────
export const getPropertyReviews = async (propertyId: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) throw new Error('Property not found')

  const reviews = await prisma.review.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: { id: true, fullName: true },
      },
    },
  })

  // Calculate average rating
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return {
    reviews,
    totalReviews: reviews.length,
    averageRating: Math.round(avgRating * 10) / 10, // round to 1 decimal
  }
}

// ── Get reviews for an agent ───────────────────────────
export const getAgentReviews = async (agentId: string) => {
  const agent = await prisma.user.findUnique({ where: { id: agentId } })
  if (!agent) throw new Error('Agent not found')

  const reviews = await prisma.review.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: { id: true, fullName: true },
      },
    },
  })

  // Calculate average rating
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return {
    reviews,
    totalReviews: reviews.length,
    averageRating: Math.round(avgRating * 10) / 10,
  }
}

// ── Delete a review ────────────────────────────────────
export const deleteReview = async (id: string, userId: string, role: string) => {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) throw new Error('Review not found')

  // Only the reviewer or admin can delete
  if (review.reviewerId !== userId && role !== 'ADMIN') {
    throw new Error('Not authorized to delete this review')
  }

  return await prisma.review.delete({ where: { id } })
}