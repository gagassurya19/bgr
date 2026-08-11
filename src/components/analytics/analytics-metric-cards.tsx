import { Users, CheckCircle2, Hourglass, XCircle, Target } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { AnalyticsMetrics } from "@/lib/analytics";
import { AnalyticsCard } from "@/components/analytics/analytics-card";

function TrendBadge({
  value,
  periodLabel,
  invert = false,
}: {
  value: number | null;
  periodLabel: string;
  invert?: boolean;
}) {
  if (value === null) {
    return <span className="text-xs text-slate-400">— vs {periodLabel}</span>;
  }

  const positive = invert ? value <= 0 : value >= 0;
  const color = positive ? "text-emerald-500" : "text-red-400";
  const arrow = value >= 0 ? "▴" : "▾";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(value)}% vs {periodLabel}
    </span>
  );
}

export function AnalyticsMetricCards({ metrics }: { metrics: AnalyticsMetrics }) {
  const cards = [
    {
      label: "Total Referral",
      value: formatNumber(metrics.total),
      change: metrics.periodChange.total,
      icon: Users,
      invert: false,
    },
    {
      label: "Referral Disetujui",
      value: formatNumber(metrics.approved),
      change: metrics.periodChange.approved,
      icon: CheckCircle2,
      invert: false,
    },
    {
      label: "Dalam Proses",
      value: formatNumber(metrics.inProgress),
      change: metrics.periodChange.inProgress,
      icon: Hourglass,
      invert: true,
    },
    {
      label: "Ditolak",
      value: formatNumber(metrics.rejected),
      change: metrics.periodChange.rejected,
      icon: XCircle,
      invert: true,
    },
    {
      label: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      change: metrics.periodChange.conversionRate,
      icon: Target,
      invert: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <AnalyticsCard key={card.label} className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                <div className="mt-2">
                  <TrendBadge
                    value={card.change}
                    periodLabel={metrics.previousPeriodLabel}
                    invert={card.invert}
                  />
                </div>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0066AE]/20 bg-[#0066AE]/10 dark:border-[#63ACF2]/30 dark:bg-[#0066AE]/20">
                <Icon className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
              </div>
            </div>
          </AnalyticsCard>
        );
      })}
    </div>
  );
}
