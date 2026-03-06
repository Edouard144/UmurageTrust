// src/services/property.service.ts
import prisma from '../prisma/client'
import { PropertyType, Status, Role } from '@prisma/client'
import { uploadImage } from '../utils/cloudinary'

// ── Types ──────────────────────────────────────────────
interface CreatePropertyInput {
  title: string
  description: string
  priceRwf: number
  priceUsd?: number
  sizeSqm: number
  propertyType: PropertyType
  district: string
  sector: string
  latitude?: number
  longitude?: number
  ownerId: string
}

interface GetPropertiesFilter {
  district?: string
  sector?: string
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  minSize?: number
  maxSize?: number
  isVerified?: boolean
  sort?: string
  page?: number
  limit?: number
}

// ── Helper: generate slug from title ──────────────────
const generateSlug = (title: string): string => {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, '') +   // remove leading/trailing dashes
    '-' +
    Date.now()                     // add timestamp to ensure uniqueness
  )
}

// ── Create Property ────────────────────────────────────
export const createProperty = async (input: CreatePropertyInput) => {
  const slug = generateSlug(input.title)

  return await prisma.property.create({
    data: {
      ...input,
      slug,
      status: Status.PENDING, // all new properties start as PENDING
    },
    include: {
      owner: { select: { id: true, fullName: true, email: true, phone: true } },
      images: true,
    },
  })
}

// ── Get Approved Properties (with filters & pagination) ─────────
export const getProperties = async (filters: GetPropertiesFilter) => {
  const {
    district,
    sector,
    propertyType,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    isVerified,
    sort,
    page = 1,
    limit = 10,
  } = filters

  const skip = (page - 1) * limit

  const where: any = {
    status: Status.APPROVED,
    deletedAt: null,
  }

  if (district) where.district = { contains: district, mode: 'insensitive' }
  if (sector) where.sector = { contains: sector, mode: 'insensitive' }
  if (propertyType) where.propertyType = propertyType
  if (isVerified !== undefined) where.isVerified = isVerified

  if (minPrice || maxPrice) {
    where.priceRwf = {
      ...(minPrice && { gte: minPrice }),
      ...(maxPrice && { lte: maxPrice }),
    }
  }

  if (minSize || maxSize) {
    where.sizeSqm = {
      ...(minSize && { gte: minSize }),
      ...(maxSize && { lte: maxSize }),
    }
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { priceRwf: 'asc' }
  if (sort === 'price_desc') orderBy = { priceRwf: 'desc' }
  if (sort === 'size_asc') orderBy = { sizeSqm: 'asc' }
  if (sort === 'size_desc') orderBy = { sizeSqm: 'desc' }
  if (sort === 'oldest') orderBy = { createdAt: 'asc' }
  if (sort === 'most_viewed') orderBy = { viewCount: 'desc' }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        images: true,
        _count: { select: { favorites: true, reviews: true } },
      },
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  }
}

// ── Get Single Property by Slug ────────────────────────
export const getPropertyBySlug = async (slug: string) => {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, fullName: true, email: true, phone: true } },
      images: true,
      reviews: {
        include: { reviewer: { select: { id: true, fullName: true } } },
      },
    },
  })

  if (!property) throw new Error('Property not found')

  await prisma.property.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  })

  return property
}

// ── Update Property ────────────────────────────────────
export const updateProperty = async (
  id: string,
  ownerId: string,
  data: Partial<CreatePropertyInput>
) => {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new Error('Property not found')
  if (property.ownerId !== ownerId) throw new Error('Not authorized')

  return await prisma.property.update({
    where: { id },
    data,
    include: { images: true },
  })
}

// ── Delete Property (soft delete) ─────────────────────
export const deleteProperty = async (id: string, ownerId: string, role: Role) => {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new Error('Property not found')

  if (property.ownerId !== ownerId && role !== Role.ADMIN) {
    throw new Error('Not authorized')
  }

  return await prisma.property.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

// ── Add Property Images ───────────────────────────────
export const addPropertyImages = async (
  propertyId: string,
  ownerId: string,
  files: Express.Multer.File[]
) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) throw new Error('Property not found')
  if (property.ownerId !== ownerId) throw new Error('Not authorized')

  const imageUrls = await Promise.all(
    files.map(async (file) => {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      const url = await uploadImage(base64)

      return prisma.propertyImage.create({
        data: { propertyId, imageUrl: url },
      })
    })
  )

  return imageUrls
}

// ── Get property analytics (for agents) ───────────────
export const getPropertyAnalytics = async (id: string, ownerId: string) => {
  // Find the property
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      _count: {
        select: {
          favorites: true,   // how many users saved it
          messages: true,    // how many inquiries received
          reviews: true,     // how many reviews
        },
      },
    },
  })

  if (!property) throw new Error('Property not found')

  // Only owner or admin can see analytics
  if (property.ownerId !== ownerId) throw new Error('Not authorized')

  // Get reviews to calculate average rating
  const reviews = await prisma.review.findMany({
    where: { propertyId: id },
    select: { rating: true },
  })

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  // Get recent messages (inquiries) for this property
  const recentInquiries = await prisma.message.findMany({
    where: { propertyId: id },
    orderBy: { createdAt: 'desc' },
    take: 5, // last 5 inquiries
    include: {
      sender: {
        select: { id: true, fullName: true, email: true },
      },
    },
  })

  // Get favorites count over time (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentFavorites = await prisma.favorite.count({
    where: {
      propertyId: id,
      createdAt: { gte: sevenDaysAgo },
    },
  })

  return {
    property: {
      id: property.id,
      title: property.title,
      status: property.status,
      slug: property.slug,
      priceRwf: property.priceRwf,
      images: property.images,
    },
    analytics: {
      totalViews: property.viewCount,
      totalFavorites: property._count.favorites,
      totalInquiries: property._count.messages,
      totalReviews: property._count.reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      recentFavoritesLast7Days: recentFavorites,
    },
    recentInquiries,
  }
}
