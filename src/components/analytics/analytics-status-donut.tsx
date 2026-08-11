"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";
import { AnalyticsCard, SectionTitle } from "@/components/analytics/analytics-card";

type StatusApproval = {
  approved: number;
  rejected: number;
  inProgress: number;
  total: number;
};

const COLORS = {
  approved: "#22c55e",
  rejected: "#ef4444",
  inProgress: "#eab308",
};

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function AnalyticsStatusDonut({ data }: { data: StatusApproval }) {
  const chartData = [
    { name: "Disetujui", value: data.approved, color: COLORS.approved },
    { name: "Ditolak", value: data.rejected, color: COLORS.rejected },
    { name: "Dalam Proses", value: data.inProgress, color: COLORS.inProgress },
  ].filter((d) => d.value > 0);

  const legend = [
    { label: "Disetujui", value: data.approved, color: COLORS.approved },
    { label: "Ditolak", value: data.rejected, color: COLORS.rejected },
    { label: "Dalam Proses", value: data.inProgress, color: COLORS.inProgress },
  ];

  return (
    <AnalyticsCard className="lg:col-span-3">
      <SectionTitle>Status Approval</SectionTitle>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-44 w-44 shrink-0">
          {data.total === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Belum ada data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(30,58,95,0.5)",
                      background: "#111d33",
                      color: "#e2e8f0",
                    }}
                    formatter={(value, name) => [
                      `${value ?? 0} (${pct(Number(value), data.total)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(data.total)}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total Referral
                </span>
              </div>
            </>
          )}
        </div>
        <ul className="w-full flex-1 space-y-3">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNumber(item.value)}{" "}
                <span className="text-slate-400">({pct(item.value, data.total)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnalyticsCard>
  );
}
