"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canManageBusinessGroups } from "@/lib/rbac";
import { auditService } from "@/services/audit.service";

const businessGroupSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[A-Z0-9_]+$/, "Kode hanya boleh huruf besar, angka, dan underscore."),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
});

export async function createBusinessGroupAction(
  input: z.infer<typeof businessGroupSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  if (!canManageBusinessGroups(session.user.role)) {
    return failure("UNAUTHORIZED", "Hanya admin dan referral officer yang dapat menambah business group.");
  }

  const parsed = businessGroupSchema.safeParse({
    ...input,
    code: input.code.trim().toUpperCase(),
  });

  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Data business group tidak valid.");
  }

  const data = parsed.data;

  const existing = await prisma.businessGroup.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    return failure("DUPLICATE_CODE", "Kode business group sudah digunakan.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const group = await tx.businessGroup.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: true,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "BUSINESS_GROUP",
        entityId: group.id,
        newData: data,
      },
      tx,
    );

    return group;
  });

  revalidatePath("/business-groups");
  revalidatePath("/settings");
  revalidatePath("/referrals/new");

  return success({ id: created.id });
}
