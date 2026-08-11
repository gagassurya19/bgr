"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { failure, success, type ActionResult } from "@/lib/errors";
import { UserRole } from "@prisma/client";
import { canManageUsers } from "@/lib/rbac";
import { auditService } from "@/services/audit.service";

const requirementSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[A-Z0-9_]+$/, "Kode hanya boleh huruf besar, angka, dan underscore."),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  businessGroupId: z.string().uuid().nullable(),
  isRequired: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

function validationRuleCode(requirementCode: string) {
  return `DOC-REQ-${requirementCode}`;
}

async function syncValidationRule(
  code: string,
  name: string,
  isRequired: boolean,
  isActive: boolean,
) {
  const ruleCode = validationRuleCode(code);
  if (!isRequired || !isActive) {
    await prisma.validationRule.updateMany({
      where: { code: ruleCode },
      data: { isActive: false },
    });
    return;
  }

  await prisma.validationRule.upsert({
    where: { code: ruleCode },
    update: {
      name: `${name} wajib diunggah`,
      severity: "ERROR",
      isActive: true,
    },
    create: {
      code: ruleCode,
      name: `${name} wajib diunggah`,
      severity: "ERROR",
      isActive: true,
      sortOrder: 100,
    },
  });
}

function assertAdmin(role: UserRole): ActionResult<never> | null {
  if (!canManageUsers(role)) {
    return failure("UNAUTHORIZED", "Hanya admin yang dapat mengelola persyaratan dokumen.");
  }
  return null;
}

export async function createDocumentRequirementAction(
  input: z.infer<typeof requirementSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");

  const denied = assertAdmin(session.user.role);
  if (denied) return denied;

  const parsed = requirementSchema.safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data persyaratan dokumen tidak valid.");
  }

  const data = parsed.data;

  const existing = await prisma.documentRequirement.findFirst({
    where: {
      code: data.code,
      businessGroupId: data.businessGroupId,
    },
  });
  if (existing) {
    return failure("DUPLICATE_CODE", "Kode dokumen sudah digunakan untuk business group ini.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const requirement = await tx.documentRequirement.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        businessGroupId: data.businessGroupId,
        isRequired: data.isRequired,
        isActive: true,
        sortOrder: data.sortOrder,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "BUSINESS_GROUP",
        entityId: requirement.id,
        newData: { type: "document_requirement", ...data },
      },
      tx,
    );

    return requirement;
  });

  await syncValidationRule(created.code, created.name, created.isRequired, created.isActive);

  revalidatePath("/settings/document-requirements");
  revalidatePath("/referrals");
  return success({ id: created.id });
}

export async function updateDocumentRequirementAction(
  id: string,
  input: Partial<z.infer<typeof requirementSchema>> & { isActive?: boolean },
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");

  const denied = assertAdmin(session.user.role);
  if (denied) return denied;

  const existing = await prisma.documentRequirement.findUnique({ where: { id } });
  if (!existing) return failure("NOT_FOUND", "Persyaratan dokumen tidak ditemukan.");

  const parsed = requirementSchema.partial().extend({ isActive: z.boolean().optional() }).safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data persyaratan dokumen tidak valid.");
  }

  const updated = await prisma.documentRequirement.update({
    where: { id },
    data: parsed.data,
  });

  await syncValidationRule(updated.code, updated.name, updated.isRequired, updated.isActive);

  await auditService.log({
    actorId: session.user.id,
    action: "UPDATE",
    entityType: "BUSINESS_GROUP",
    entityId: id,
    newData: { type: "document_requirement", ...parsed.data },
  });

  revalidatePath("/settings/document-requirements");
  revalidatePath("/referrals");
  return success(undefined);
}

export async function toggleDocumentRequirementAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  return updateDocumentRequirementAction(id, { isActive });
}
