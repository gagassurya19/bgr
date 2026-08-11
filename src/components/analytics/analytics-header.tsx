"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter } from "lucide-react";
import { formatAnalyticsDateRange } from "@/lib/analytics-utils";
import type { AnalyticsMetrics } from "@/lib/analytics";

export function AnalyticsHeader({
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
  const router = useRouter();
  const searchParams = useSearchParams();

  function applyDates(from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const from = String(form.get("from") ?? defaultFrom);
    const to = String(form.get("to") ?? defaultTo);
    applyDates(from, to);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-wide text-slate-900 dark:text-white sm:text-xl">
          BGR DASHBOARD ANALYTICS
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formatAnalyticsDateRange(metrics.dateFrom, metrics.dateTo)}
        </p>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#0066AE]/30 hover:text-[#0066AE] dark:border-[#1e3a5f] dark:bg-[#111d33] dark:text-slate-200 dark:hover:border-[#63ACF2]/40 dark:hover:text-[#63ACF2]"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-[#1e3a5f] dark:bg-[#111d33]">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="date"
            name="from"
            defaultValue={defaultFrom}
            className="w-[7.5rem] bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200 sm:w-auto sm:text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="date"
            name="to"
            defaultValue={defaultTo}
            className="w-[7.5rem] bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200 sm:w-auto sm:text-sm"
          />
        </div>
      </form>
    </div>
  );
}
