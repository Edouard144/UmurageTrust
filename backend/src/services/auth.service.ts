// src/services/auth.service.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma/client'

// ── Types ──────────────────────────────────────────────
interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

// ── Helper: generate JWT token ─────────────────────────
const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },                          // payload stored inside token
    process.env.JWT_SECRET!,                   // secret key from .env
    { expiresIn: '7d' }                        // token expires in 7 days
  )
}

// ── Register ───────────────────────────────────────────
export const registerUser = async (input: RegisterInput) => {
  const { fullName, email, phone, password } = input

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error('Email already in use')
  }

  // Check if phone already exists
  const existingPhone = await prisma.user.findUnique({ where: { phone } })
  if (existingPhone) {
    throw new Error('Phone number already in use')
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: 'BUYER', // default role for new users
    },
    select: {
      // never return the password field
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  })

  // Generate token for the new user
  const token = generateToken(user.id, user.role)

  return { user, token }
}

// ── Login ──────────────────────────────────────────────
export const loginUser = async (input: LoginInput) => {
  const { email, password } = input

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  // Generate token
  const token = generateToken(user.id, user.role)

  // Return user without password
  const { password: _, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}