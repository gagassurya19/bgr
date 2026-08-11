"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { NotificationType } from "@prisma/client";
import { CheckCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notification.actions";
import { getNotificationTypeMeta } from "@/components/notifications/notification-type-meta";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  referral: { id: string; referralNumber: string } | null;
};

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await markNotificationReadAction(id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  async function handleMarkAllRead() {
    setError(null);
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0f1a2e]">
          <CheckCheck className="h-7 w-7 text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          Tidak ada notifikasi
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pemberitahuan operasional akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={unreadCount > 0 ? "danger" : "success"}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {notifications.length} notifikasi
          </span>
        </div>
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-[#1e3a5f]/60">
        <ul className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/50">
          {notifications.map((n) => {
            const meta = getNotificationTypeMeta(n.type);
            const Icon = meta.icon;

            return (
              <li
                key={n.id}
                className={cn(
                  "relative transition-colors",
                  !n.isRead
                    ? "bg-[#0066AE]/[0.04] dark:bg-[#63ACF2]/[0.06]"
                    : "bg-white dark:bg-[#111d33]/50",
                )}
              >
                {!n.isRead && (
                  <span className="absolute inset-y-0 left-0 w-1 bg-[#0066AE] dark:bg-[#63ACF2]" />
                )}
                <div className="flex gap-4 px-4 py-4 sm:px-5">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      meta.accent,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "text-sm",
                            n.isRead
                              ? "font-medium text-slate-700 dark:text-slate-300"
                              : "font-semibold text-slate-900 dark:text-white",
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {meta.label}
                        </p>
                      </div>
                      <Badge variant={n.isRead ? "default" : "info"}>
                        {n.isRead ? "Sudah dibaca" : "Belum dibaca"}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {n.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(n.createdAt)}
                      </span>
                      {n.isRead && n.readAt && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Dibaca {formatDate(n.readAt)}
                        </span>
                      )}
                      {n.referral && (
                        <Link
                          href={`/referrals/${n.referral.id}`}
                          className="text-xs font-medium text-[#0066AE] hover:underline dark:text-[#63ACF2]"
                          onClick={() => {
                            if (!n.isRead) void handleMarkRead(n.id);
                          }}
                        >
                          Lihat {n.referral.referralNumber} →
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs font-medium text-slate-500 transition hover:text-[#0066AE] dark:text-slate-400 dark:hover:text-[#63ACF2]"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
