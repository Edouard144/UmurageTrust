// src/validators/auth.validator.ts
import { z } from 'zod'

// ── Register ───────────────────────────────────────────
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long'),

  email: z
    .string()
    .email('Invalid email address'),

  phone: z
    .string()
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
})

// ── Login ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
})