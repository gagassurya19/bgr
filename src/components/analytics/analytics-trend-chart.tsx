"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnalyticsCard, SectionTitle } from "@/components/analytics/analytics-card";

type TrendPoint = { label: string; incoming: number; approved: number };

export function AnalyticsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <AnalyticsCard className="lg:col-span-5">
      <SectionTitle>Tren Referral</SectionTitle>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-[#1e3a5f]"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(30,58,95,0.5)",
                background: "#111d33",
                color: "#e2e8f0",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value) => (
                <span className="text-slate-600 dark:text-slate-300">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="incoming"
              name="Referral Masuk"
              stroke="#0066AE"
              strokeWidth={2.5}
              dot={{ fill: "#0066AE", r: 3, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="approved"
              name="Referral Disetujui"
              stroke="#2FA6FC"
              strokeWidth={2.5}
              dot={{ fill: "#2FA6FC", r: 3, strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
