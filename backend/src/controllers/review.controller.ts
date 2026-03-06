// src/controllers/review.controller.ts
import { Request, Response } from "express";
import {
  createReview,
  getPropertyReviews,
  getAgentReviews,
  deleteReview,
} from "../services/review.service";

// ── Create review ──────────────────────────────────────
export const create = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const { agentId, rating, comment, propertyId } = req.body;

    if (!agentId || !rating) {
      return res.status(400).json({ message: "agentId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await createReview(reviewerId, agentId, rating, comment, propertyId);
    return res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get property reviews ───────────────────────────────
export const getByProperty = async (req: Request, res: Response) => {
  try {
    const result = await getPropertyReviews(req.params.propertyId as string);
    // ✅ result is already an object with reviews array inside
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get agent reviews ──────────────────────────────────
export const getByAgent = async (req: Request, res: Response) => {
  try {
    const result = await getAgentReviews(req.params.agentId as string);
    // ✅ result is already an object with reviews array inside
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Delete review ──────────────────────────────────────
export const remove = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await deleteReview(req.params.id as string, user.id, user.role);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};