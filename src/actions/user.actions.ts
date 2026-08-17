"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canManageUsers } from "@/lib/rbac";
import { auditService } from "@/services/audit.service";
import { UserRole, UserStatus } from "@prisma/client";

// Roles non-admin yang boleh dikelola oleh ADMIN (tidak termasuk ADMIN/SUPER_ADMIN).
const MANAGEABLE_ROLES: UserRole[] = [
  "REFERRAL_OFFICER",
  "HEAD_UNIT",
  "SUBSIDIARY_PROCESSOR",
  "VIEWER",
];

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().email("Email tidak valid"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh huruf, angka, titik, garis bawah, dan strip."),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  role: z.enum(MANAGEABLE_ROLES as [UserRole, ...UserRole[]]),
  businessUnitId: z.string().optional().nullable(),
  businessGroupId: z.string().optional().nullable(),
});

const updateUserSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(120).optional(),
    email: z.string().email("Email tidak valid").optional(),
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .max(50)
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .optional(),
    password: z.string().min(6, "Password minimal 6 karakter").max(100).optional().or(z.literal("")),
    role: z.enum(MANAGEABLE_ROLES as [UserRole, ...UserRole[]]).optional(),
    businessUnitId: z.string().optional().nullable(),
    businessGroupId: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada data yang diubah",
  });

function assertAdmin(role: UserRole): ActionResult<never> | null {
  if (!canManageUsers(role)) {
    return failure("UNAUTHORIZED", "Hanya admin yang dapat mengelola pengguna.");
  }
  return null;
}

export async function createUserAction(
  input: z.infer<typeof createUserSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");

  const denied = assertAdmin(session.user.role);
  if (denied) return denied;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Data pengguna tidak valid.";
    return failure("VALIDATION_ERROR", issue);
  }

  const data = parsed.data;

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email.toLowerCase() } }),
    prisma.user.findUnique({ where: { username: data.username } }),
  ]);

  if (existingEmail) {
    return failure("DUPLICATE_EMAIL", "Email sudah digunakan pengguna lain.");
  }
  if (existingUsername) {
    return failure("DUPLICATE_USERNAME", "Username sudah digunakan pengguna lain.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        username: data.username,
        passwordHash,
        role: data.role,
        status: "ACTIVE",
        businessUnitId: data.businessUnitId || null,
        businessGroupId: data.businessGroupId || null,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "USER_MANAGEMENT",
        entityType: "USER",
        entityId: user.id,
        newData: {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      tx,
    );

    return user;
  });

  revalidatePath("/users");
  revalidatePath("/settings");
  return success({ id: created.id });
}

export async function updateUserAction(
  id: string,
  input: z.infer<typeof updateUserSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");

  const denied = assertAdmin(session.user.role);
  if (denied) return denied;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return failure("NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  // Admin tidak dapat mengubah user ADMIN/SUPER_ADMIN lewat fitur ini.
  if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
    return failure("UNAUTHORIZED", "Pengguna admin tidak dapat diubah melalui fitur ini.");
  }

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Data pengguna tidak valid.";
    return failure("VALIDATION_ERROR", issue);
  }

  const data = parsed.data;

  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), id: { not: id } },
    });
    if (existing) {
      return failure("DUPLICATE_EMAIL", "Email sudah digunakan pengguna lain.");
    }
  }
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, id: { not: id } },
    });
    if (existing) {
      return failure("DUPLICATE_USERNAME", "Username sudah digunakan pengguna lain.");
    }
  }

  const passwordHash =
    data.password && data.password.trim().length >= 6
      ? await bcrypt.hash(data.password, 12)
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email ? data.email.toLowerCase() : undefined,
        username: data.username,
        passwordHash,
        role: data.role,
        businessUnitId:
          data.businessUnitId !== undefined ? (data.businessUnitId || null) : undefined,
        businessGroupId:
          data.businessGroupId !== undefined ? (data.businessGroupId || null) : undefined,
      },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "USER_MANAGEMENT",
        entityType: "USER",
        entityId: id,
        oldData: { name: target.name, email: target.email, role: target.role },
        newData: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email.toLowerCase() }),
          ...(data.role && { role: data.role }),
          ...(passwordHash && { passwordChanged: true }),
        },
      },
      tx,
    );
  });

  revalidatePath("/users");
  revalidatePath("/settings");
  return success(undefined);
}

/**
 * Menonaktifkan pengguna (status -> INACTIVE). Tidak menghapus baris secara
 * permanen agar riwayat aktivitas dan referral tetap terjaga.
 */
export async function deactivateUserAction(
  id: string,
  deactivate: boolean,
): Promise<ActionResult<{ status: UserStatus }>> {
  const session = await auth();
  if (!session?.user) return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");

  const denied = assertAdmin(session.user.role);
  if (denied) return denied;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return failure("NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
    return failure("UNAUTHORIZED", "Pengguna admin tidak dapat dinonaktifkan melalui fitur ini.");
  }

  if (target.id === session.user.id) {
    return failure("UNAUTHORIZED", "Anda tidak dapat menonaktifkan akun Anda sendiri.");
  }

  const newStatus: UserStatus = deactivate ? "INACTIVE" : "ACTIVE";

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { status: newStatus },
    });

    await auditService.log(
      {
        actorId: session.user.id,
        action: "USER_MANAGEMENT",
        entityType: "USER",
        entityId: id,
        oldData: { status: target.status },
        newData: { status: newStatus },
      },
      tx,
    );
  });

  revalidatePath("/users");
  revalidatePath("/settings");
  return success({ status: newStatus });
}
