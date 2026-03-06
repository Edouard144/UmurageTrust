// src/services/admin.service.ts
import prisma from '../prisma/client'
import { Status } from '@prisma/client'
import { createNotification } from './notification.service'

// ── Approve a property ─────────────────────────────────
export const approveProperty = async (id: string) => {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new Error('Property not found')
  if (property.status !== Status.PENDING) {
    throw new Error('Property is not pending review')
  }

  const updated = await prisma.property.update({
    where: { id },
    data: { status: Status.APPROVED, isVerified: true },
  })

  // Notify the property owner
  await createNotification(
    property.ownerId,
    'PROPERTY_APPROVED',
    `Your property "${property.title}" has been approved and is now live!`
  )

  return updated
}

// ── Reject a property ──────────────────────────────────
export const rejectProperty = async (id: string) => {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new Error('Property not found')
  if (property.status !== Status.PENDING) {
    throw new Error('Property is not pending review')
  }

  const updated = await prisma.property.update({
    where: { id },
    data: { status: Status.REJECTED },
  })

  // Notify the property owner
  await createNotification(
    property.ownerId,
    'PROPERTY_REJECTED',
    `Your property "${property.title}" was not approved. Please review and resubmit.`
  )

  return updated
}

// ── Get all PENDING properties ─────────────────────────
export const getPendingProperties = async () => {
  return await prisma.property.findMany({
    where: {
      status: Status.PENDING,
      deletedAt: null,
    },
    include: {
      owner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      images: true,
    },
    orderBy: { createdAt: 'asc' }, // oldest first — review in order
  })
}

// ── Get all users (admin overview) ─────────────────────
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: { properties: true }, // how many properties each user has
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Delete a user (admin only) ─────────────────────────
export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')
  if (user.role === 'ADMIN') throw new Error('Cannot delete an admin account')

  return await prisma.user.delete({ where: { id } })
}
