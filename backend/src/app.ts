// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import userRoutes from './routes/user.routes'

import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import adminRoutes from "./routes/admin.routes";
import favoriteRoutes from "./routes/favorite.routes";
import messageRoutes from "./routes/message.routes";
import reviewRoutes from "./routes/review.routes";
import verificationRoutes from "./routes/verification.routes";
import notificationRoutes from "./routes/notification.routes";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "UmurageTrust API is running" });
});

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", userRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'UmurageTrust API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/docs',
    health: '/health',
  })
})

export default app;
