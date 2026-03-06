// src/validators/user.validator.ts
import { z } from 'zod'

// ── Update Profile ─────────────────────────────────────
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long')
    .optional(),

  phone: z
    .string()
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long')
    .optional(),
})

// ── Change Password ────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),

  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(100, 'Password too long'),
})