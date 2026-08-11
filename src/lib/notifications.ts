import { prisma } from "@/lib/db";

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      referral: { select: { id: true, referralNumber: true } },
    },
  });
}
