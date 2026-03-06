// src/utils/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UmurageTrust API',
      version: '1.0.0',
      description: 'Real estate platform API for Rwanda — buy, sell, and rent properties',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login/register response',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['fullName', 'email', 'phone', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Jean Pierre Habimana' },
            email: { type: 'string', example: 'agent@umuragetrust.rw' },
            phone: { type: 'string', example: '+250780000002' },
            password: { type: 'string', example: 'Password123!' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'agent@umuragetrust.rw' },
            password: { type: 'string', example: 'Password123!' },
          },
        },
        // ── Property ──────────────────────────────────
        PropertyInput: {
          type: 'object',
          required: ['title', 'description', 'priceRwf', 'sizeSqm', 'propertyType', 'district', 'sector'],
          properties: {
            title: { type: 'string', example: 'Modern 3 Bedroom House in Kimihurura' },
            description: { type: 'string', example: 'Beautiful house near embassies' },
            priceRwf: { type: 'number', example: 85000000 },
            priceUsd: { type: 'number', example: 60000 },
            sizeSqm: { type: 'number', example: 220 },
            propertyType: { type: 'string', enum: ['LAND', 'HOUSE', 'APARTMENT', 'COMMERCIAL'] },
            district: { type: 'string', example: 'Gasabo' },
            sector: { type: 'string', example: 'Kimihurura' },
            latitude: { type: 'number', example: -1.9441 },
            longitude: { type: 'number', example: 30.0619 },
          },
        },
        // ── Message ───────────────────────────────────
        MessageInput: {
          type: 'object',
          required: ['receiverId', 'content'],
          properties: {
            receiverId: { type: 'string', example: 'uuid-here' },
            content: { type: 'string', example: 'Is this property still available?' },
            propertyId: { type: 'string', example: 'uuid-here' },
          },
        },
        // ── Review ────────────────────────────────────
        ReviewInput: {
          type: 'object',
          required: ['agentId', 'rating'],
          properties: {
            agentId: { type: 'string', example: 'uuid-here' },
            rating: { type: 'number', example: 5, minimum: 1, maximum: 5 },
            comment: { type: 'string', example: 'Very professional agent!' },
            propertyId: { type: 'string', example: 'uuid-here' },
          },
        },
      },
    },
  },
  // Where to find route comments
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)