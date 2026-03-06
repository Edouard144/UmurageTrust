// src/services/verification.service.ts
import prisma from "../prisma/client";
import { VerificationStatus } from "@prisma/client";

// ── Agent submits verification request ────────────────
export const submitVerificationRequest = async (
  agentId: string,
  documentUrl: string
) => {
  // Only agents can submit verification requests
  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent) throw new Error("User not found");
  if (agent.role !== "AGENT") throw new Error("Only agents can request verification");

  // Check if agent already has a pending request
  const existing = await prisma.verificationRequest.findFirst({
    where: {
      reviewedBy: agentId,
      status: VerificationStatus.PENDING,
    },
  });
  if (existing) throw new Error("You already have a pending verification request");

  // Create new verification request
  return await prisma.verificationRequest.create({
    data: {
      documentUrl,
      reviewedBy: agentId,
      status: VerificationStatus.PENDING,
    },
  });
};

// ── Agent checks their verification status ─────────────
export const getVerificationStatus = async (agentId: string) => {
  const request = await prisma.verificationRequest.findFirst({
    where: { reviewedBy: agentId },
    orderBy: { createdAt: "desc" }, // get most recent request
  });

  if (!request) {
    return { status: "NOT_SUBMITTED", message: "No verification request found" };
  }

  return request;
};

// ── Admin gets all pending verification requests ───────
export const getPendingVerifications = async () => {
  return await prisma.verificationRequest.findMany({
    where: { status: VerificationStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      reviewer: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
    },
  });
};

// ── Admin approves or rejects verification ─────────────
export const updateVerificationStatus = async (
  id: string,
  status: VerificationStatus,
  reviewerId?: string
) => {
  const request = await prisma.verificationRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Verification request not found");
  if (request.status !== VerificationStatus.PENDING) {
    throw new Error("Request has already been reviewed");
  }

  // Update the verification request
  const updated = await prisma.verificationRequest.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
  });

  // If approved — mark the agent as verified in users table
  if (status === VerificationStatus.APPROVED && request.reviewedBy) {
    await prisma.user.update({
      where: { id: request.reviewedBy },
      data: { isVerified: true },
    });
  }

  return updated;
};
