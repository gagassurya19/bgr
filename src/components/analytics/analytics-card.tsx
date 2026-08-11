export function AnalyticsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {children}
    </h3>
  );
}
