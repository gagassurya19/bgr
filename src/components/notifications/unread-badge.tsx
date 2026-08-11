import { cn } from "@/lib/utils";

export function UnreadBadge({
  count,
  className,
  size = "sm",
}: {
  count: number;
  className?: string;
  size?: "sm" | "md";
}) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-red-500 font-bold text-white shadow-sm",
        size === "sm" ? "min-h-4 min-w-4 px-1 text-[10px]" : "min-h-5 min-w-5 px-1.5 text-xs",
        className,
      )}
      aria-label={`${count} notifikasi belum dibaca`}
    >
      {label}
    </span>
  );
}
