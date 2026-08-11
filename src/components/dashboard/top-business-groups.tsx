import { formatNumber } from "@/lib/utils";

export function TopBusinessGroups({
  groups,
}: {
  groups: Array<{ name: string; count: number }>;
}) {
  const top = [...groups].sort((a, b) => b.count - a.count).slice(0, 5);
  const max = top[0]?.count ?? 1;

  return (
    <div className="bgr-card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        Top Anak Perusahaan
      </h3>
      {top.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada data.</p>
      ) : (
        <ul className="space-y-4">
          {top.map((bg, index) => (
            <li key={bg.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">
                  <span className="mr-2 text-slate-400">{index + 1}.</span>
                  {bg.name}
                </span>
                <span className="font-semibold text-[#0066AE]">{formatNumber(bg.count)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0066AE] to-[#63ACF2]"
                  style={{ width: `${Math.max(8, (bg.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
