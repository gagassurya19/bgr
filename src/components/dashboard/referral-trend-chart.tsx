"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendPoint = { label: string; count: number };

export function ReferralTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="bgr-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Trend Referral</h3>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          6 Bulan
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value) => [value ?? 0, "Referral"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0066AE"
              strokeWidth={2.5}
              dot={{ fill: "#0066AE", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#2FA6FC" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
