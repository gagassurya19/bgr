"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { failure, success, type ActionResult } from "@/lib/errors";

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Sesi tidak valid.");
  }

  const notification = await prisma.notification.findFirst({
    where: { id, recipientId: session.user.id },
  });

  if (!notification) {
    return failure("NOT_FOUND", "Notifikasi tidak ditemukan.");
  }

  if (!notification.isRead) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");

  return success(undefined);
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Sesi tidak valid.");
  }

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");

  return success(undefined);
}
