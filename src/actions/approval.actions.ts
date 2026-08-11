"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canApproveReferral } from "@/lib/rbac";
import { referralStateService } from "@/services/referral-state.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import { ApprovalDecision, ReferralStatus } from "@prisma/client";

const approvalSchema = z.object({
  referralId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED", "REVISION_REQUIRED"]),
  note: z.string().optional(),
});

const decisionToStatus: Record<ApprovalDecision, ReferralStatus> = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
};

export async function approveReferralAction(
  input: z.infer<typeof approvalSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !canApproveReferral(session.user.role)) {
    return failure("UNAUTHORIZED", "Anda tidak memiliki izin untuk melakukan persetujuan.");
  }

  const parsed = approvalSchema.safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data persetujuan tidak valid.");
  }

  const referral = await prisma.referral.findUnique({
    where: { id: parsed.data.referralId },
    include: { createdBy: true },
  });

  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  if (referral.status !== "PENDING_APPROVAL") {
    return failure("INVALID_STATUS", "Referral tidak dalam status menunggu persetujuan.");
  }

  const toStatus = decisionToStatus[parsed.data.decision];

  try {
    referralStateService.assertTransition("PENDING_APPROVAL", toStatus, session.user.role);
    referralStateService.assertApprovalAction(session.user.role);
  } catch (e) {
    return failure("INVALID_STATUS_TRANSITION", (e as Error).message);
  }

  const auditAction =
    parsed.data.decision === "APPROVED"
      ? "APPROVE"
      : parsed.data.decision === "REJECTED"
        ? "REJECT"
        : "REQUEST_REVISION";

  await prisma.$transaction(async (tx) => {
    await tx.approval.create({
      data: {
        referralId: referral.id,
        approverId: session.user.id,
        decision: parsed.data.decision,
        note: parsed.data.note,
      },
    });

    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: toStatus,
        approvedAt: parsed.data.decision === "APPROVED" ? new Date() : referral.approvedAt,
      },
    });

    await tx.referralStatusHistory.create({
      data: {
        referralId: referral.id,
        fromStatus: "PENDING_APPROVAL",
        toStatus,
        changedById: session.user.id,
        note: parsed.data.note,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: auditAction,
        entityType: "APPROVAL",
        entityId: referral.id,
        referralId: referral.id,
        oldData: { status: "PENDING_APPROVAL" },
        newData: { status: toStatus, decision: parsed.data.decision },
      },
      tx,
    );

    const notificationType =
      parsed.data.decision === "APPROVED"
        ? "REFERRAL_APPROVED"
        : parsed.data.decision === "REJECTED"
          ? "REFERRAL_REJECTED"
          : "REVISION_REQUIRED";

    const title =
      parsed.data.decision === "APPROVED"
        ? "Referral Disetujui"
        : parsed.data.decision === "REJECTED"
          ? "Referral Ditolak"
          : "Revisi Diperlukan";

    await notificationService.create(
      {
        recipientId: referral.createdById,
        type: notificationType,
        title,
        message: `Referral ${referral.referralNumber}: ${title}`,
        referralId: referral.id,
      },
      tx,
    );
  });

  revalidatePath("/approvals");
  revalidatePath(`/referrals/${referral.id}`);
  revalidatePath("/dashboard");
  return success(undefined);
}

export async function submitToSubsidiaryAction(referralId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral || referral.status !== "APPROVED") {
    return failure("INVALID_STATUS", "Referral harus berstatus APPROVED.");
  }

  try {
    referralStateService.assertTransition("APPROVED", "SUBMITTED_TO_SUBSIDIARY", session.user.role);
  } catch (e) {
    return failure("INVALID_STATUS_TRANSITION", (e as Error).message);
  }

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id: referralId },
      data: { status: "SUBMITTED_TO_SUBSIDIARY" },
    });

    await tx.referralStatusHistory.create({
      data: {
        referralId,
        fromStatus: "APPROVED",
        toStatus: "SUBMITTED_TO_SUBSIDIARY",
        changedById: session.user.id,
        note: "Disubmit ke anak perusahaan",
      },
    });

    await tx.referralAssignment.create({
      data: {
        referralId,
        businessGroupId: referral.businessGroupId,
        assignedById: session.user.id,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "ASSIGN",
        entityType: "REFERRAL",
        entityId: referralId,
        referralId,
        newData: { status: "SUBMITTED_TO_SUBSIDIARY" },
      },
      tx,
    );

    const processors = await tx.user.findMany({
      where: {
        role: "SUBSIDIARY_PROCESSOR",
        status: "ACTIVE",
        businessGroupId: referral.businessGroupId,
      },
      select: { id: true },
    });

    if (processors.length > 0) {
      await notificationService.createMany(
        processors.map((p) => ({
          recipientId: p.id,
          type: "REFERRAL_ASSIGNED" as const,
          title: "Referral Baru",
          message: `Referral ${referral.referralNumber} ditugaskan untuk diproses.`,
          referralId,
        })),
        tx,
      );
    }
  });

  revalidatePath(`/referrals/${referralId}`);
  revalidatePath("/monitoring");
  return success(undefined);
}

export async function updateProcessingStatusAction(
  referralId: string,
  toStatus: "IN_PROCESS" | "COMPLETED" | "REJECTED" | "CANCELLED",
  note?: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  referralStateService.assertProcessingAction(session.user.role);

  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  try {
    referralStateService.assertTransition(referral.status, toStatus, session.user.role);
  } catch (e) {
    return failure("INVALID_STATUS_TRANSITION", (e as Error).message);
  }

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id: referralId },
      data: {
        status: toStatus,
        completedAt: toStatus === "COMPLETED" ? new Date() : referral.completedAt,
      },
    });

    await tx.referralStatusHistory.create({
      data: {
        referralId,
        fromStatus: referral.status,
        toStatus,
        changedById: session.user.id,
        note,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "STATUS_CHANGE",
        entityType: "REFERRAL",
        entityId: referralId,
        referralId,
        oldData: { status: referral.status },
        newData: { status: toStatus },
      },
      tx,
    );

    await notificationService.create(
      {
        recipientId: referral.createdById,
        type: "STATUS_CHANGED",
        title: "Status Referral Diperbarui",
        message: `Referral ${referral.referralNumber} berstatus ${toStatus}.`,
        referralId,
      },
      tx,
    );
  });

  revalidatePath(`/referrals/${referralId}`);
  revalidatePath("/monitoring");
  revalidatePath("/dashboard");
  return success(undefined);
}
