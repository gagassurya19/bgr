import { formatNumber } from "@/lib/utils";
import { AnalyticsCard, SectionTitle } from "@/components/analytics/analytics-card";

type BgPerformance = {
  name: string;
  approvedCount: number;
  totalCount: number;
  conversionRate: number;
};

export function AnalyticsBusinessGroupChart({ data }: { data: BgPerformance[] }) {
  const max = data[0]?.approvedCount ?? 1;

  return (
    <AnalyticsCard className="lg:col-span-4">
      <SectionTitle>Performa Business Group</SectionTitle>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data.</p>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[1fr_auto_auto] gap-4 text-xs font-medium uppercase tracking-wide text-slate-400 sm:grid">
            <span>Business Group</span>
            <span className="text-right">Referral Disetujui</span>
            <span className="w-28 text-right">Conversion Rate</span>
          </div>
          {data.map((bg) => (
            <div key={bg.name} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-100">{bg.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                    {formatNumber(bg.approvedCount)}
                  </span>
                  <span className="w-12 text-right font-medium text-slate-600 dark:text-slate-300">
                    {bg.conversionRate}%
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#0a1628]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0066AE] to-[#2FA6FC]"
                  style={{ width: `${Math.max(6, (bg.approvedCount / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AnalyticsCard>
  );
}
