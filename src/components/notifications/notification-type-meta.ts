import { NotificationType } from "@prisma/client";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Send,
  UserPlus,
} from "lucide-react";

export function getNotificationTypeMeta(type: NotificationType) {
  const map: Record<
    NotificationType,
    { label: string; icon: React.ComponentType<{ className?: string }>; accent: string }
  > = {
    REFERRAL_SUBMITTED: {
      label: "Referral Disubmit",
      icon: Send,
      accent: "bg-[#0066AE]/10 text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]",
    },
    APPROVAL_REQUIRED: {
      label: "Perlu Persetujuan",
      icon: ClipboardCheck,
      accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    REFERRAL_APPROVED: {
      label: "Referral Disetujui",
      icon: CheckCircle2,
      accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    REFERRAL_REJECTED: {
      label: "Referral Ditolak",
      icon: AlertCircle,
      accent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    REVISION_REQUIRED: {
      label: "Revisi Diperlukan",
      icon: RefreshCw,
      accent: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    REFERRAL_ASSIGNED: {
      label: "Referral Ditugaskan",
      icon: UserPlus,
      accent: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
    STATUS_CHANGED: {
      label: "Status Berubah",
      icon: RefreshCw,
      accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    SYSTEM: {
      label: "Sistem",
      icon: Bell,
      accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  };

  return map[type];
}
