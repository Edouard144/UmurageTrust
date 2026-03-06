// src/services/user.service.ts
import prisma from '../prisma/client'
import bcrypt from 'bcryptjs'

// ── Get user profile by ID ─────────────────────────────
export const getUserProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          favorites: true,
          writtenReviews: true,
        },
      },
    },
  })

  if (!user) throw new Error('User not found')
  return user
}

// ── Update profile info ────────────────────────────────
export const updateProfile = async (
  id: string,
  data: { fullName?: string; phone?: string }
) => {
  if (data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (existing && existing.id !== id) {
      throw new Error('Phone number already in use')
    }
  }

  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  })
}

// ── Change password ────────────────────────────────────
export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, password: true },
  })
  if (!user) throw new Error('User not found')

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) throw new Error('Current password is incorrect')

  const hashed = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id },
    data: { password: hashed },
  })

  return { message: 'Password changed successfully' }
}

// ── Get agent public profile ───────────────────────────
export const getAgentProfile = async (id: string) => {
  const agent = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      properties: {
        where: { status: 'APPROVED', deletedAt: null },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
      agentReviews: {
        include: { reviewer: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { properties: true, agentReviews: true },
      },
    },
  })

  if (!agent) throw new Error('Agent not found')
  if (agent.role !== 'AGENT') throw new Error('User is not an agent')

  const avgRating = agent.agentReviews.length
    ? agent.agentReviews.reduce((sum, r) => sum + r.rating, 0) / agent.agentReviews.length
    : 0

  return {
    ...agent,
    averageRating: Math.round(avgRating * 10) / 10,
  }
}
