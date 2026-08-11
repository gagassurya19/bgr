import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type NotificationInput = {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  referralId?: string;
};

export const notificationService = {
  async create(input: NotificationInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.notification.create({ data: input });
  },

  async createMany(inputs: NotificationInput[], tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.notification.createMany({ data: inputs });
  },

  async notifyHeadUnits(
    referralId: string,
    title: string,
    message: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    const headUnits = await client.user.findMany({
      where: { role: { in: ["HEAD_UNIT", "ADMIN"] }, status: "ACTIVE" },
      select: { id: true },
    });

    if (headUnits.length === 0) return;

    await client.notification.createMany({
      data: headUnits.map((u) => ({
        recipientId: u.id,
        type: "APPROVAL_REQUIRED" as NotificationType,
        title,
        message,
        referralId,
      })),
    });
  },
};
