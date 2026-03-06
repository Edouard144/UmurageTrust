// src/services/message.service.ts
import prisma from '../prisma/client'
import { createNotification } from './notification.service'

// ── Send a message ─────────────────────────────────────
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  propertyId?: string
) => {
  if (senderId === receiverId) throw new Error('You cannot send a message to yourself')

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) throw new Error('Receiver not found')

  if (propertyId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) throw new Error('Property not found')
  }

  const message = await prisma.message.create({
    data: { senderId, receiverId, content, propertyId },
    include: {
      sender: { select: { id: true, fullName: true, email: true } },
      receiver: { select: { id: true, fullName: true, email: true } },
      property: { select: { id: true, title: true, slug: true } },
    },
  })

  // Notify the receiver
  await createNotification(
    receiverId,
    'NEW_MESSAGE',
    `You have a new message from ${message.sender.fullName}`
  )

  return message
}

// ── Get inbox (all received messages) ─────────────────
export const getInbox = async (userId: string) => {
  const messages = await prisma.message.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, fullName: true, email: true } },
      property: { select: { id: true, title: true, slug: true } },
    },
  })

  // Mark all received messages as read
  await prisma.message.updateMany({
    where: { receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  })

  return messages
}

// ── Get conversation between two users ─────────────────
export const getConversation = async (userId: string, otherUserId: string) => {
  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } })
  if (!otherUser) throw new Error('User not found')

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, fullName: true } },
    },
  })

  return { otherUser, messages }
}
