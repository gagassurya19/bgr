"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canCreateReferral, canEditReferral, canSubmitReferral } from "@/lib/rbac";
import { generateReferralNumber } from "@/services/referral-number.service";
import { referralStateService } from "@/services/referral-state.service";
import { validationService } from "@/services/validation.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import { ReferralStatus } from "@prisma/client";

const createReferralSchema = z.object({
  businessGroupId: z.string().uuid(),
  customerName: z.string().optional(),
  customerIdentifier: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
});

const updateReferralSchema = createReferralSchema.partial();

export async function createReferralAction(
  input: z.infer<typeof createReferralSchema>,
): Promise<ActionResult<{ id: string; referralNumber: string }>> {
  const session = await auth();
  if (!session?.user || !canCreateReferral(session.user.role)) {
    return failure("UNAUTHORIZED", "Anda tidak memiliki izin untuk membuat referral.");
  }

  const parsed = createReferralSchema.safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data referral tidak valid.");
  }

  const referralNumber = await generateReferralNumber();

  const referral = await prisma.$transaction(async (tx) => {
    const created = await tx.referral.create({
      data: {
        referralNumber,
        createdById: session.user.id,
        businessGroupId: parsed.data.businessGroupId,
        customerName: parsed.data.customerName,
        customerIdentifier: parsed.data.customerIdentifier,
        customerEmail: parsed.data.customerEmail || null,
        customerPhone: parsed.data.customerPhone,
        subject: parsed.data.subject,
        description: parsed.data.description,
        status: "DRAFT",
      },
    });

    await tx.referralStatusHistory.create({
      data: {
        referralId: created.id,
        fromStatus: null,
        toStatus: "DRAFT",
        changedById: session.user.id,
        note: "Referral dibuat",
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "REFERRAL",
        entityId: created.id,
        referralId: created.id,
        newData: { referralNumber, status: "DRAFT" },
      },
      tx,
    );

    return created;
  });

  revalidatePath("/referrals");
  return success({ id: referral.id, referralNumber: referral.referralNumber });
}

export async function updateReferralAction(
  id: string,
  input: z.infer<typeof updateReferralSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  const referral = await prisma.referral.findUnique({ where: { id } });
  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  if (!canEditReferral(session.user.role, session.user.id, referral.createdById, referral.status)) {
    return failure("REFERRAL_NOT_EDITABLE", "Referral sudah tidak dapat diedit pada status ini.");
  }

  const parsed = updateReferralSchema.safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data referral tidak valid.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id },
      data: {
        ...parsed.data,
        customerEmail: parsed.data.customerEmail || null,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "UPDATE",
        entityType: "REFERRAL",
        entityId: id,
        referralId: id,
        newData: parsed.data,
      },
      tx,
    );
  });

  revalidatePath(`/referrals/${id}`);
  revalidatePath("/referrals");
  return success(undefined);
}

export async function submitReferralAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  const referral = await prisma.referral.findUnique({ where: { id } });
  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  if (!canSubmitReferral(session.user.role, session.user.id, referral.createdById, referral.status)) {
    return failure("REFERRAL_NOT_SUBMITTABLE", "Referral tidak dapat disubmit pada status ini.");
  }

  try {
    referralStateService.assertTransition(referral.status, "SUBMITTED", session.user.role);
  } catch (e) {
    return failure("INVALID_STATUS_TRANSITION", (e as Error).message);
  }

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });

    await tx.referralStatusHistory.create({
      data: {
        referralId: id,
        fromStatus: referral.status,
        toStatus: "SUBMITTED",
        changedById: session.user.id,
        note: "Referral disubmit",
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "SUBMIT",
        entityType: "REFERRAL",
        entityId: id,
        referralId: id,
        oldData: { status: referral.status },
        newData: { status: "SUBMITTED" },
      },
      tx,
    );
  });

  const validation = await validationService.runValidation(id, session.user.id);

  await prisma.$transaction(async (tx) => {
    const nextStatus: ReferralStatus = validation.hasError
      ? "VALIDATION_FAILED"
      : "PENDING_APPROVAL";

    await tx.referral.update({ where: { id }, data: { status: nextStatus } });

    await tx.referralStatusHistory.create({
      data: {
        referralId: id,
        fromStatus: "SUBMITTED",
        toStatus: nextStatus,
        changedById: session.user.id,
        note: validation.hasError ? "Validasi gagal" : "Validasi berhasil",
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "VALIDATE",
        entityType: "REFERRAL",
        entityId: id,
        referralId: id,
        newData: { status: nextStatus, hasError: validation.hasError },
      },
      tx,
    );

    if (nextStatus === "PENDING_APPROVAL") {
      await notificationService.notifyHeadUnits(
        id,
        "Persetujuan Diperlukan",
        `Referral ${referral.referralNumber} menunggu persetujuan Head Unit.`,
        tx,
      );
    }
  });

  revalidatePath(`/referrals/${id}`);
  revalidatePath("/referrals");
  revalidatePath("/approvals");
  revalidatePath("/dashboard");

  if (validation.hasError) {
    return failure("VALIDATION_FAILED", "Validasi gagal. Periksa hasil validasi dan perbaiki data/dokumen.");
  }

  return success(undefined);
}

export async function transitionReferralAction(
  id: string,
  toStatus: ReferralStatus,
  note?: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  const referral = await prisma.referral.findUnique({ where: { id } });
  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  try {
    referralStateService.assertTransition(referral.status, toStatus, session.user.role);
  } catch (e) {
    return failure("INVALID_STATUS_TRANSITION", (e as Error).message);
  }

  const updateData: Record<string, unknown> = { status: toStatus };
  if (toStatus === "APPROVED") updateData.approvedAt = new Date();
  if (toStatus === "COMPLETED") updateData.completedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({ where: { id }, data: updateData });

    await tx.referralStatusHistory.create({
      data: {
        referralId: id,
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
        entityId: id,
        referralId: id,
        oldData: { status: referral.status },
        newData: { status: toStatus },
      },
      tx,
    );

    if (toStatus === "SUBMITTED_TO_SUBSIDIARY") {
      await tx.referralAssignment.create({
        data: {
          referralId: id,
          businessGroupId: referral.businessGroupId,
          assignedById: session.user.id,
        },
      });
    }
  });

  revalidatePath(`/referrals/${id}`);
  revalidatePath("/referrals");
  revalidatePath("/monitoring");
  revalidatePath("/dashboard");
  return success(undefined);
}
