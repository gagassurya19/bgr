import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const tableLinkClassName =
  "inline-flex items-center gap-1 font-medium text-[#0066AE] transition hover:text-[#005a96] hover:underline dark:text-[#63ACF2] dark:hover:text-[#2FA6FC]";

export function TableContainer({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full min-w-full border-collapse", className)} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-slate-200/80 bg-slate-50/90 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/90",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-slate-100 dark:divide-[#1e3a5f]/50", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[#0066AE]/[0.04] dark:hover:bg-[#63ACF2]/[0.07]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200",
        className,
      )}
      {...props}
    />
  );
}

export function TableEmpty({
  colSpan,
  message = "Tidak ada data.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <TableRow className="pointer-events-none hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-14 text-center">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0f1a2e]">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </span>
          <span className="text-sm">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TablePagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition",
            p === page
              ? "bg-[#0066AE] text-white shadow-sm dark:bg-[#0066AE] dark:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#0f1a2e] dark:text-slate-300 dark:hover:bg-[#1e3a5f]",
          )}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}
