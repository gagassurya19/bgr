import { AuditAction, EntityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type AuditInput = {
  actorId?: string | null;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string | null;
  referralId?: string | null;
  oldData?: Prisma.InputJsonValue;
  newData?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const auditService = {
  async log(input: AuditInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.auditEvent.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        referralId: input.referralId ?? null,
        oldData: input.oldData,
        newData: input.newData,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  },
};
