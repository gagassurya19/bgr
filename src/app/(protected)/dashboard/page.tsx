import { Suspense } from "react";
import { getAnalyticsMetrics } from "@/lib/analytics";
import { toDateInputValue } from "@/lib/analytics-utils";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const metrics = await getAnalyticsMetrics(params.from, params.to);

  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Memuat overview...</div>}>
      <AnalyticsDashboard
        metrics={metrics}
        defaultFrom={toDateInputValue(metrics.dateFrom)}
        defaultTo={toDateInputValue(metrics.dateTo)}
        basePath="/dashboard"
      />
    </Suspense>
  );
}
