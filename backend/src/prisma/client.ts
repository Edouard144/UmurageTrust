// src/prisma/client.ts
import { PrismaClient } from '@prisma/client'

// Simple clean client — no adapter needed with Prisma 6
const prisma = new PrismaClient()

export default prisma