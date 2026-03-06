// src/controllers/verification.controller.ts
import { Request, Response } from "express";
import {
  submitVerificationRequest,
  getVerificationStatus,
  getPendingVerifications,
  updateVerificationStatus,
} from "../services/verification.service";
import { VerificationStatus } from "@prisma/client";

// ── Agent: submit verification request ────────────────
export const submit = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ message: "documentUrl is required" });
    }

    const request = await submitVerificationRequest(agentId, documentUrl);
    return res.status(201).json({
      message: "Verification request submitted successfully",
      request,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Agent: check verification status ──────────────────
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const status = await getVerificationStatus(agentId);

    if (!status) {
      return res.status(404).json({ message: "No verification status found" });
    }

    return res.status(200).json(status);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Admin: get all pending verifications ───────────────
export const listPending = async (req: Request, res: Response) => {
  try {
    const requests = await getPendingVerifications();
    return res.status(200).json({ requests });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Admin: approve verification ────────────────────────
export const approve = async (req: Request, res: Response) => {
  try {
    const updated = await updateVerificationStatus(
      req.params.id as string,
      VerificationStatus.APPROVED
    );
    return res.status(200).json({ message: "Agent verified successfully", updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Admin: reject verification ─────────────────────────
export const reject = async (req: Request, res: Response) => {
  try {
    const updated = await updateVerificationStatus(
      req.params.id as string,
      VerificationStatus.REJECTED
    );
    return res.status(200).json({ message: "Verification request rejected", updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
