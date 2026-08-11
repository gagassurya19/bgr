import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { DashboardMetrics } from "@/lib/dashboard";

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-slate-400">— vs bulan lalu</span>;
  }

  const positive = value >= 0;
  const color = positive ? "text-emerald-600" : "text-red-500";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {positive ? "+" : ""}
      {value}% vs bulan lalu
    </span>
  );
}

export function DashboardKpiCards({ metrics }: { metrics: DashboardMetrics }) {
  const conversionRate =
    metrics.submittedCount > 0
      ? Math.round((metrics.approvedPipeline / metrics.submittedCount) * 100)
      : 0;

  const cards = [
    {
      label: "Total Referral",
      value: metrics.total,
      change: metrics.momChange.total,
      icon: Users,
      iconBg: "bg-[#AAD2F8]/40",
      iconColor: "text-[#0066AE]",
    },
    {
      label: "Dalam Proses",
      value: metrics.statusDistribution.inProgress,
      change: metrics.momChange.inProgress,
      icon: Clock,
      iconBg: "bg-[#63ACF2]/30",
      iconColor: "text-[#0066AE]",
    },
    {
      label: "Disetujui",
      value: metrics.statusDistribution.approved,
      change: metrics.momChange.approved,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      extra: `Conversion ${conversionRate}%`,
    },
    {
      label: "Ditolak / Gagal",
      value: metrics.statusDistribution.failed,
      change: metrics.momChange.failed,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      extra:
        metrics.failedOrRejected > 0
          ? `${metrics.rejected} ditolak · ${metrics.validationFailed} validasi gagal`
          : undefined,
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">Ringkasan Referral</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bgr-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {formatNumber(card.value)}
                  </p>
                  <div className="mt-2">
                    <ChangeBadge value={card.change} />
                  </div>
                  {card.extra && (
                    <p className="mt-1 text-xs text-slate-500">{card.extra}</p>
                  )}
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
