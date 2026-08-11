"use client";

import type { AnalyticsMetrics } from "@/lib/analytics";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { AnalyticsTrendChart } from "@/components/analytics/analytics-trend-chart";
import { AnalyticsStatusDonut } from "@/components/analytics/analytics-status-donut";
import { AnalyticsBusinessGroupChart } from "@/components/analytics/analytics-business-group-chart";
import { AnalyticsMetricCards } from "@/components/analytics/analytics-metric-cards";

export function AnalyticsDashboard({
  metrics,
  defaultFrom,
  defaultTo,
  basePath = "/dashboard",
}: {
  metrics: AnalyticsMetrics;
  defaultFrom: string;
  defaultTo: string;
  basePath?: string;
}) {
  return (
    <div className="space-y-6">
      <AnalyticsHeader
        metrics={metrics}
        defaultFrom={defaultFrom}
        defaultTo={defaultTo}
        basePath={basePath}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <AnalyticsTrendChart data={metrics.weeklyTrend} />
        <AnalyticsStatusDonut data={metrics.statusApproval} />
        <AnalyticsBusinessGroupChart data={metrics.businessGroupPerformance} />
      </div>

      <AnalyticsMetricCards metrics={metrics} />
    </div>
  );
}
