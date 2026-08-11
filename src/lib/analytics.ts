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

const REJECTED_STATUSES: ReferralStatus[] = ["REJECTED", "VALIDATION_FAILED", "CANCELLED"];

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function defaultDateRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

function parseDateRange(fromStr?: string, toStr?: string): { from: Date; to: Date } {
  const defaults = defaultDateRange();
  const from = fromStr ? new Date(fromStr) : defaults.from;
  const to = toStr ? new Date(`${toStr}T23:59:59.999`) : defaults.to;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return defaults;
  }
  return { from, to };
}

function previousPeriod(from: Date, to: Date): { from: Date; to: Date } {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: prevFrom, to: prevTo };
}

function formatPeriodLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function buildWeeklyTrend(
  referrals: Array<{ createdAt: Date; status: ReferralStatus }>,
  from: Date,
  to: Date,
): Array<{ label: string; incoming: number; approved: number }> {
  const bucketCount = 5;
  const rangeMs = to.getTime() - from.getTime();
  const bucketMs = rangeMs / bucketCount;

  const buckets: Array<{ label: string; incoming: number; approved: number }> = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(from.getTime() + bucketMs * i);
    const bucketEnd =
      i === bucketCount - 1 ? to : new Date(from.getTime() + bucketMs * (i + 1) - 1);

    const label = bucketStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

    const inBucket = referrals.filter((r) => r.createdAt >= bucketStart && r.createdAt <= bucketEnd);

    buckets.push({
      label,
      incoming: inBucket.length,
      approved: inBucket.filter((r) => APPROVED_STATUSES.includes(r.status)).length,
    });
  }

  return buckets;
}

export type AnalyticsMetrics = {
  dateFrom: Date;
  dateTo: Date;
  total: number;
  approved: number;
  inProgress: number;
  rejected: number;
  conversionRate: number;
  previousPeriodLabel: string;
  periodChange: {
    total: number | null;
    approved: number | null;
    inProgress: number | null;
    rejected: number | null;
    conversionRate: number | null;
  };
  weeklyTrend: Array<{ label: string; incoming: number; approved: number }>;
  statusApproval: {
    approved: number;
    rejected: number;
    inProgress: number;
    total: number;
  };
  businessGroupPerformance: Array<{
    name: string;
    approvedCount: number;
    totalCount: number;
    conversionRate: number;
  }>;
};

export async function getAnalyticsMetrics(
  dateFromStr?: string,
  dateToStr?: string,
): Promise<AnalyticsMetrics> {
  const { from, to } = parseDateRange(dateFromStr, dateToStr);
  const prev = previousPeriod(from, to);

  const dateFilter = { createdAt: { gte: from, lte: to } };
  const prevDateFilter = { createdAt: { gte: prev.from, lte: prev.to } };

  const [referrals, prevReferrals, byBusinessGroup] = await Promise.all([
    prisma.referral.findMany({
      where: dateFilter,
      select: { createdAt: true, status: true, businessGroupId: true },
    }),
    prisma.referral.findMany({
      where: prevDateFilter,
      select: { createdAt: true, status: true },
    }),
    prisma.referral.groupBy({
      by: ["businessGroupId", "status"],
      where: dateFilter,
      _count: { _all: true },
    }),
  ]);

  const businessGroups = await prisma.businessGroup.findMany({
    where: { id: { in: [...new Set(byBusinessGroup.map((b) => b.businessGroupId))] } },
    select: { id: true, name: true },
  });
  const bgMap = new Map(businessGroups.map((bg) => [bg.id, bg.name]));

  const countByStatus = (items: Array<{ status: ReferralStatus }>, statuses: ReferralStatus[]) =>
    items.filter((r) => statuses.includes(r.status)).length;

  const total = referrals.length;
  const approved = countByStatus(referrals, APPROVED_STATUSES);
  const inProgress = countByStatus(referrals, IN_PROGRESS_STATUSES);
  const rejected = countByStatus(referrals, REJECTED_STATUSES);
  const conversionRate = pct(approved, total);

  const prevTotal = prevReferrals.length;
  const prevApproved = countByStatus(prevReferrals, APPROVED_STATUSES);
  const prevInProgress = countByStatus(prevReferrals, IN_PROGRESS_STATUSES);
  const prevRejected = countByStatus(prevReferrals, REJECTED_STATUSES);
  const prevConversionRate = pct(prevApproved, prevTotal);

  const bgStats = new Map<string, { total: number; approved: number }>();
  for (const row of byBusinessGroup) {
    const current = bgStats.get(row.businessGroupId) ?? { total: 0, approved: 0 };
    current.total += row._count._all;
    if (APPROVED_STATUSES.includes(row.status)) {
      current.approved += row._count._all;
    }
    bgStats.set(row.businessGroupId, current);
  }

  const businessGroupPerformance = [...bgStats.entries()]
    .map(([id, stats]) => ({
      name: bgMap.get(id) ?? "Unknown",
      approvedCount: stats.approved,
      totalCount: stats.total,
      conversionRate: pct(stats.approved, stats.total),
    }))
    .sort((a, b) => b.approvedCount - a.approvedCount)
    .slice(0, 5);

  return {
    dateFrom: from,
    dateTo: to,
    total,
    approved,
    inProgress,
    rejected,
    conversionRate,
    previousPeriodLabel: formatPeriodLabel(prev.from),
    periodChange: {
      total: pctChange(total, prevTotal),
      approved: pctChange(approved, prevApproved),
      inProgress: pctChange(inProgress, prevInProgress),
      rejected: pctChange(rejected, prevRejected),
      conversionRate:
        prevConversionRate === 0 && conversionRate > 0
          ? 100
          : prevConversionRate === 0
            ? null
            : Math.round(conversionRate - prevConversionRate),
    },
    weeklyTrend: buildWeeklyTrend(referrals, from, to),
    statusApproval: {
      approved,
      rejected,
      inProgress,
      total,
    },
    businessGroupPerformance,
  };
}
