"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canEditReferral } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { documentService } from "@/services/document.service";

export async function uploadDocumentAction(
  referralId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral) {
    return failure("NOT_FOUND", "Referral tidak ditemukan.");
  }

  if (!canEditReferral(session.user.role, session.user.id, referral.createdById, referral.status)) {
    return failure("REFERRAL_NOT_EDITABLE", "Referral sudah tidak dapat diedit pada status ini.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return failure("VALIDATION_ERROR", "File wajib diunggah.");
  }

  const requirementId = formData.get("requirementId");
  if (typeof requirementId !== "string" || !requirementId) {
    return failure("VALIDATION_ERROR", "Jenis dokumen wajib dipilih.");
  }

  const requirement = await prisma.documentRequirement.findFirst({
    where: {
      id: requirementId,
      isActive: true,
      isRequired: true,
      OR: [{ businessGroupId: referral.businessGroupId }, { businessGroupId: null }],
    },
  });

  if (!requirement) {
    return failure("VALIDATION_ERROR", "Jenis dokumen tidak valid untuk referral ini.");
  }

  const reqId = requirementId;

  try {
    const doc = await documentService.upload(referralId, file, reqId, session.user.id);
    revalidatePath(`/referrals/${referralId}`);
    return success({ id: doc.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengunggah dokumen.";
    return failure("UPLOAD_FAILED", message);
  }
}
