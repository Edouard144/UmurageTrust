// prisma/seed.ts
import { PrismaClient, Role, PropertyType, Status, VerificationStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

// Simple client — no adapter needed
const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // STEP 1: Clean existing data (delete in correct order due to foreign keys)
  await prisma.verificationRequest.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.propertyImage.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
  console.log('Cleaned existing data')

  // STEP 2: Hash password once and reuse for all test users
  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // STEP 3: Create Admin user
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@umuragetrust.rw',
      phone: '+250780000001',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  })
  console.log('Admin created:', admin.email)

  // STEP 4: Create Agent user
  const agent = await prisma.user.create({
    data: {
      fullName: 'Jean Pierre Habimana',
      email: 'agent@umuragetrust.rw',
      phone: '+250780000002',
      password: hashedPassword,
      role: Role.AGENT,
      isVerified: true,
    },
  })
  console.log('Agent created:', agent.email)

  // STEP 5: Create Buyer user
  const buyer = await prisma.user.create({
    data: {
      fullName: 'Marie Claire Uwase',
      email: 'buyer@umuragetrust.rw',
      phone: '+250780000003',
      password: hashedPassword,
      role: Role.BUYER,
      isVerified: true,
    },
  })
  console.log('Buyer created:', buyer.email)

  // STEP 6: Create Property 1 - House in Kigali (APPROVED)
  const property1 = await prisma.property.create({
    data: {
      title: 'Modern 3 Bedroom House in Kimihurura',
      description: 'A beautiful modern house in Kimihurura, Kigali. Close to embassies and international schools. Features a large garden, parking, and 24/7 security.',
      priceRwf: 85000000,
      priceUsd: 60000,
      sizeSqm: 220,
      propertyType: PropertyType.HOUSE,
      district: 'Gasabo',
      sector: 'Kimihurura',
      latitude: -1.9441,
      longitude: 30.0619,
      isVerified: true,
      status: Status.APPROVED,
      slug: 'modern-3-bedroom-house-kimihurura',
      ownerId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://placehold.co/800x600?text=House+Front' },
          { imageUrl: 'https://placehold.co/800x600?text=Living+Room' },
        ],
      },
    },
  })
  console.log('Property 1 created:', property1.title)

  // STEP 7: Create Property 2 - Land in Musanze (PENDING)
  const property2 = await prisma.property.create({
    data: {
      title: 'Prime Land Plot Near Volcanoes National Park',
      description: 'A 500 sqm land plot in Musanze district, ideal for eco-tourism or residential development. Stunning views of the Virunga mountains.',
      priceRwf: 12000000,
      priceUsd: 8500,
      sizeSqm: 500,
      propertyType: PropertyType.LAND,
      district: 'Musanze',
      sector: 'Muhoza',
      latitude: -1.4990,
      longitude: 29.6349,
      isVerified: false,
      status: Status.PENDING,
      slug: 'prime-land-plot-musanze-volcanoes',
      ownerId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://placehold.co/800x600?text=Land+Plot' },
        ],
      },
    },
  })
  console.log('Property 2 created:', property2.title)

  // STEP 8: Buyer saves Property 1 as a favorite
  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: property1.id,
    },
  })
  console.log('Favorite created')

  // STEP 9: Buyer sends a message to Agent about Property 1
  await prisma.message.create({
    data: {
      content: 'Hello, I am interested in the house in Kimihurura. Is it still available?',
      senderId: buyer.id,
      receiverId: agent.id,
      propertyId: property1.id,
    },
  })
  console.log('Message created')

  // STEP 10: Buyer leaves a 5-star review for the Agent
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Very professional agent, responded quickly and showed us great properties!',
      reviewerId: buyer.id,
      agentId: agent.id,
      propertyId: property1.id,
    },
  })
  console.log('Review created')

  // STEP 11: Create a verification request for Property 2
  await prisma.verificationRequest.create({
    data: {
      documentUrl: 'https://placehold.co/400x300?text=Land+Title+Doc',
      status: VerificationStatus.PENDING,
      propertyId: property2.id,
      reviewedBy: admin.id,
    },
  })
  console.log('Verification request created')

  // DONE - print test credentials
  console.log('\n=== SEED COMPLETE - TEST ACCOUNTS ===')
  console.table([
    { role: 'ADMIN', email: 'admin@umuragetrust.rw', password: 'Password123!' },
    { role: 'AGENT', email: 'agent@umuragetrust.rw', password: 'Password123!' },
    { role: 'BUYER', email: 'buyer@umuragetrust.rw', password: 'Password123!' },
  ])
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })