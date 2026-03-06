// src/controllers/property.controller.ts
import { getPropertyAnalytics } from '../services/property.service'
import { Request, Response } from "express";
import {
  addPropertyImages,
  createProperty,
  getProperties,
  getPropertyBySlug,
  updateProperty,
  deleteProperty,
} from "../services/property.service";
import { PropertyType } from "@prisma/client";

// ── Upload Property Images ─────────────────────────────
export const uploadImages = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const images = await addPropertyImages(req.params.id as string, user.id, files);
    return res.status(201).json({ message: "Images uploaded successfully", images });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Create Property ────────────────────────────────────
export const create = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const property = await createProperty({ ...req.body, ownerId: user.id });
    return res.status(201).json({ message: "Property created successfully", property });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get All Properties (advanced search) ──────────────
export const getAll = async (req: Request, res: Response) => {
  try {
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
      page,
      limit,
    } = req.query;

    const result = await getProperties({
      district: district as string,
      sector: sector as string,
      propertyType: propertyType as PropertyType,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minSize: minSize ? Number(minSize) : undefined,
      maxSize: maxSize ? Number(maxSize) : undefined,
      isVerified: isVerified === "true" ? true : isVerified === "false" ? false : undefined,
      sort: sort as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Single Property ────────────────────────────────
export const getOne = async (req: Request, res: Response) => {
  try {
    const property = await getPropertyBySlug(req.params.slug as string);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    return res.status(200).json({ property });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Update Property ────────────────────────────────────
export const update = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const property = await updateProperty(req.params.id as string, user.id, req.body);
    return res.status(200).json({ message: "Property updated successfully", property });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Delete Property ────────────────────────────────────
export const remove = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await deleteProperty(req.params.id as string, user.id, user.role);
    return res.status(200).json({ message: "Property deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get Property Analytics ─────────────────────────────
export const analytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const result = await getPropertyAnalytics(req.params.id as string, userId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}
