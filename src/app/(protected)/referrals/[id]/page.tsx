import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  canApproveReferral,
  canEditReferral,
  canProcessReferral,
  canSubmitReferral,
} from "@/lib/rbac";
import { ReferralDetailView } from "@/components/referral/referral-detail-view";

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      businessGroup: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      documents: {
        include: { requirement: { select: { code: true, name: true } } },
        orderBy: { uploadedAt: "desc" },
      },
      validationRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: {
          results: { include: { rule: { select: { code: true } } } },
        },
      },
      approvals: {
        orderBy: { decidedAt: "desc" },
        include: { approver: { select: { name: true } } },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
    },
  });

  if (!referral) notFound();

  const requirements = await prisma.documentRequirement.findMany({
    where: {
      isActive: true,
      isRequired: true,
      OR: [{ businessGroupId: referral.businessGroupId }, { businessGroupId: null }],
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <ReferralDetailView
      referral={referral}
      requirements={requirements}
      canEdit={canEditReferral(session.user.role, session.user.id, referral.createdById, referral.status)}
      canSubmit={canSubmitReferral(session.user.role, session.user.id, referral.createdById, referral.status)}
      canApprove={canApproveReferral(session.user.role)}
      canProcess={canProcessReferral(session.user.role)}
    />
  );
}
