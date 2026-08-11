import { prisma } from "@/lib/db";
import { ReferralStatus } from "@prisma/client";

const IN_PROGRESS_STATUSES: ReferralStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "VALIDATING",
  "PENDING_APPROVAL",
  "REVISION_REQUIRED",
];

const APPROVED_STATUSES: ReferralStatus[] = [
  "APPROVED",
  "SUBMITTED_TO_SUBSIDIARY",
  "IN_PROCESS",
  "COMPLETED",
];

const FAILED_STATUSES: ReferralStatus[] = ["REJECTED", "VALIDATION_FAILED", "CANCELLED"];

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function buildMonthlyTrend(referrals: Array<{ createdAt: Date }>): Array<{ label: string; count: number }> {
  const now = new Date();
  const months: Array<{ label: string; count: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("id-ID", { month: "short" });
    const count = referrals.filter(
      (r) => r.createdAt.getFullYear() === d.getFullYear() && r.createdAt.getMonth() === d.getMonth(),
    ).length;
    months.push({ label, count });
  }

  return months;
}

export type DashboardMetrics = {
  total: number;
  pendingApproval: number;
  approved: number;
  inProcess: number;
  completed: number;
  rejected: number;
  validationFailed: number;
  /** REJECTED + VALIDATION_FAILED (+ CANCELLED) */
  failedOrRejected: number;
  /** Referral yang pernah disubmit (submittedAt terisi) */
  submittedCount: number;
  /** Lolos persetujuan: APPROVED s/d COMPLETED */
  approvedPipeline: number;
  byStatus: Array<{ status: ReferralStatus; count: number }>;
  byBusinessGroup: Array<{ name: string; count: number }>;
  recentReferrals: Array<{
    id: string;
    referralNumber: string;
    customerName: string | null;
    status: ReferralStatus;
    createdAt: Date;
    businessGroup: { name: string };
  }>;
  monthlyTrend: Array<{ label: string; count: number }>;
  statusDistribution: {
    approved: number;
    inProgress: number;
    failed: number;
  };
  momChange: {
    total: number | null;
    inProgress: number | null;
    approved: number | null;
    failed: number | null;
  };
};

export async function getDashboardMetrics(
  dateFrom?: Date,
  dateTo?: Date,
): Promise<DashboardMetrics> {
  const dateFilter =
    dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {};

  const [total, pendingApproval, approved, inProcess, completed, rejected, validationFailed, cancelled, submittedCount, approvedPipeline, byStatus, byBusinessGroup, recentReferrals, trendReferrals] =
    await Promise.all([
      prisma.referral.count({ where: dateFilter }),
      prisma.referral.count({ where: { ...dateFilter, status: "PENDING_APPROVAL" } }),
      prisma.referral.count({ where: { ...dateFilter, status: "APPROVED" } }),
      prisma.referral.count({
        where: { ...dateFilter, status: { in: ["IN_PROCESS", "SUBMITTED_TO_SUBSIDIARY"] } },
      }),
      prisma.referral.count({ where: { ...dateFilter, status: "COMPLETED" } }),
      prisma.referral.count({ where: { ...dateFilter, status: "REJECTED" } }),
      prisma.referral.count({ where: { ...dateFilter, status: "VALIDATION_FAILED" } }),
      prisma.referral.count({ where: { ...dateFilter, status: "CANCELLED" } }),
      prisma.referral.count({
        where: { ...dateFilter, submittedAt: { not: null } },
      }),
      prisma.referral.count({
        where: {
          ...dateFilter,
          status: { in: ["APPROVED", "SUBMITTED_TO_SUBSIDIARY", "IN_PROCESS", "COMPLETED"] },
        },
      }),
      prisma.referral.groupBy({
        by: ["status"],
        where: dateFilter,
        _count: { _all: true },
      }),
      prisma.referral.groupBy({
        by: ["businessGroupId"],
        where: dateFilter,
        _count: { _all: true },
      }),
      prisma.referral.findMany({
        where: dateFilter,
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { businessGroup: { select: { name: true } } },
      }),
      prisma.referral.findMany({
        where: {
          createdAt: {
            gte: monthStart(new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)),
          },
        },
        select: { createdAt: true, status: true },
      }),
    ]);

  const businessGroups = await prisma.businessGroup.findMany({
    where: { id: { in: byBusinessGroup.map((b) => b.businessGroupId) } },
    select: { id: true, name: true },
  });

  const bgMap = new Map(businessGroups.map((bg) => [bg.id, bg.name]));

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Partial<
    Record<ReferralStatus, number>
  >;

  const sumStatuses = (statuses: ReferralStatus[]) =>
    statuses.reduce((acc, s) => acc + (statusCounts[s] ?? 0), 0);

  const statusDistribution = {
    approved: sumStatuses(APPROVED_STATUSES),
    inProgress: sumStatuses(IN_PROGRESS_STATUSES),
    failed: sumStatuses(FAILED_STATUSES),
  };

  const now = new Date();
  const thisMonthStart = monthStart(now);
  const lastMonthStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const countInRange = (from: Date, to: Date, filter?: (status: ReferralStatus) => boolean) =>
    trendReferrals.filter((r) => {
      if (r.createdAt < from || r.createdAt > to) return false;
      return filter ? filter(r.status) : true;
    }).length;

  const totalThisMonth = countInRange(thisMonthStart, now);
  const totalLastMonth = countInRange(lastMonthStart, lastMonthEnd);
  const inProgressThisMonth = countInRange(thisMonthStart, now, (s) => IN_PROGRESS_STATUSES.includes(s));
  const inProgressLastMonth = countInRange(lastMonthStart, lastMonthEnd, (s) => IN_PROGRESS_STATUSES.includes(s));
  const approvedThisMonth = countInRange(thisMonthStart, now, (s) => APPROVED_STATUSES.includes(s));
  const approvedLastMonth = countInRange(lastMonthStart, lastMonthEnd, (s) => APPROVED_STATUSES.includes(s));
  const failedThisMonth = countInRange(thisMonthStart, now, (s) => FAILED_STATUSES.includes(s));
  const failedLastMonth = countInRange(lastMonthStart, lastMonthEnd, (s) => FAILED_STATUSES.includes(s));

  return {
    total,
    pendingApproval,
    approved,
    inProcess,
    completed,
    rejected,
    validationFailed,
    failedOrRejected: rejected + validationFailed + cancelled,
    submittedCount,
    approvedPipeline,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byBusinessGroup: byBusinessGroup.map((b) => ({
      name: bgMap.get(b.businessGroupId) ?? "Unknown",
      count: b._count._all,
    })),
    recentReferrals,
    monthlyTrend: buildMonthlyTrend(trendReferrals),
    statusDistribution,
    momChange: {
      total: pctChange(totalThisMonth, totalLastMonth),
      inProgress: pctChange(inProgressThisMonth, inProgressLastMonth),
      approved: pctChange(approvedThisMonth, approvedLastMonth),
      failed: pctChange(failedThisMonth, failedLastMonth),
    },
  };
}
