import { ReferralStatus } from "@prisma/client";
import { Badge } from "@/components/ui";

const statusConfig: Record<
  ReferralStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  SUBMITTED: { label: "Disubmit", variant: "info" },
  VALIDATING: { label: "Validasi", variant: "info" },
  VALIDATION_FAILED: { label: "Validasi Gagal", variant: "danger" },
  PENDING_APPROVAL: { label: "Menunggu Persetujuan", variant: "warning" },
  REVISION_REQUIRED: { label: "Revisi Diperlukan", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "danger" },
  SUBMITTED_TO_SUBSIDIARY: { label: "Ke Anak Perusahaan", variant: "info" },
  IN_PROCESS: { label: "Diproses", variant: "info" },
  REVISION_BY_SUBSIDIARY: { label: "Revisi Anak Perusahaan", variant: "warning" },
  COMPLETED: { label: "Selesai", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "default" },
};

export function StatusBadge({ status }: { status: ReferralStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
