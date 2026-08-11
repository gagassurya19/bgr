"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Distribution = {
  approved: number;
  inProgress: number;
  failed: number;
};

const COLORS = {
  approved: "#22c55e",
  inProgress: "#0066AE",
  failed: "#ef4444",
};

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function StatusDonutChart({ distribution }: { distribution: Distribution }) {
  const total = distribution.approved + distribution.inProgress + distribution.failed;

  const chartData = [
    { name: "Disetujui", value: distribution.approved, color: COLORS.approved },
    { name: "Dalam Proses", value: distribution.inProgress, color: COLORS.inProgress },
    { name: "Ditolak", value: distribution.failed, color: COLORS.failed },
  ].filter((d) => d.value > 0);

  const legend = [
    { label: "Disetujui", value: distribution.approved, color: COLORS.approved },
    { label: "Dalam Proses", value: distribution.inProgress, color: COLORS.inProgress },
    { label: "Ditolak", value: distribution.failed, color: COLORS.failed },
  ];

  return (
    <div className="bgr-card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">Status Referral</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-44 w-44 shrink-0">
          {total === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Belum ada data
            </div>
          ) : (
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
                  formatter={(value, name) => [`${value ?? 0} (${pct(Number(value), total)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <ul className="w-full space-y-3 sm:max-w-[180px]">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-semibold text-slate-900">{pct(item.value, total)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
