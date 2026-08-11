"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { UserRole } from "@prisma/client";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UnreadBadge } from "@/components/notifications/unread-badge";
import { logoutAction } from "@/actions/auth.actions";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: string): string {
  return role.replaceAll("_", " ");
}

function SidebarContent({
  role,
  unreadNotificationCount,
  onNavigate,
}: {
  role: UserRole;
  unreadNotificationCount: number;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-6 py-6">
        <div className="text-2xl font-bold tracking-tight text-white">BGR</div>
        <div className="mt-0.5 text-sm text-white/80">Business Group Referral</div>
      </div>
      <SidebarNav
        role={role}
        unreadNotificationCount={unreadNotificationCount}
        onNavigate={onNavigate}
      />
      <div className="mt-auto border-t border-white/15 px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-[#0066AE]">
            BCA
          </div>
          <span className="text-xs text-white/70">BCA Internal System</span>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-white/45">
          Dikembangkan oleh SOW Tulungagung
        </p>
      </div>
    </>
  );
}

export function AppShell({
  role,
  userName,
  userRole,
  unreadNotificationCount,
  children,
}: {
  role: UserRole;
  userName: string;
  userRole: string;
  unreadNotificationCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] dark:bg-[#0a1220]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0066AE] lg:flex">
        <SidebarContent role={role} unreadNotificationCount={unreadNotificationCount} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-[#0066AE] shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-5 text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              role={role}
              unreadNotificationCount={unreadNotificationCount}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/95 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white">Sistem Referral Internal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Business Group Referral Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/notifications"
              className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0066AE] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-[#63ACF2]"
            >
              <Bell className="h-5 w-5" />
              <UnreadBadge
                count={unreadNotificationCount}
                className="absolute -right-0.5 -top-0.5"
              />
            </Link>

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-[#1e3a5f] dark:bg-[#111d33] sm:px-3"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0066AE] text-sm font-semibold text-white">
                  {getInitials(userName)}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{userName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{formatRole(userRole)}</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Tutup menu pengguna"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-[#1e3a5f] dark:bg-[#111d33]">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      >
                        Keluar
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-24 sm:p-6 sm:pb-24">{children}</main>
      </div>
    </div>
  );
}
