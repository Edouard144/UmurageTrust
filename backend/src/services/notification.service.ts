// src/services/notification.service.ts
import prisma from '../prisma/client'

// ── Create a notification (used internally by other services) ──
export const createNotification = async (
  userId: string,
  type: string,
  message: string
) => {
  return await prisma.notification.create({
    data: { userId, type, message },
  })
}

// ── Get all notifications for a user ──────────────────
export const getUserNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // newest first
  })

  // Count unread notifications
  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  })

  return { notifications, unreadCount }
}

// ── Mark a single notification as read ────────────────
export const markAsRead = async (id: string, userId: string) => {
  // Make sure notification belongs to this user
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) throw new Error('Notification not found')
  if (notification.userId !== userId) throw new Error('Not authorized')

  return await prisma.notification.update({
    where: { id },
    data: { read: true },
  })
}

// ── Mark ALL notifications as read ────────────────────
export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

// ── Delete a notification ──────────────────────────────
export const deleteNotification = async (id: string, userId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) throw new Error('Notification not found')
  if (notification.userId !== userId) throw new Error('Not authorized')

  return await prisma.notification.delete({ where: { id } })
}