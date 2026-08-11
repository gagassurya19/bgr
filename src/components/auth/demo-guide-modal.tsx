"use client";

import { BookOpen, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";

const DEMO_PASSWORD = "Password123!";

export const DEMO_ACCOUNTS = [
  {
    email: "admin@example.local",
    name: "Admin Demo",
    role: "ADMIN",
    roleLabel: "Administrator",
    description: "Akses penuh: kelola user, settings, approval, dan semua modul.",
  },
  {
    email: "officer@example.local",
    name: "Referral Officer",
    role: "REFERRAL_OFFICER",
    roleLabel: "Referral Officer",
    description: "Buat referral, upload dokumen, submit, dan perbaiki revisi.",
  },
  {
    email: "approver@example.local",
    name: "Head Unit Approver",
    role: "HEAD_UNIT",
    roleLabel: "Head Unit",
    description: "Review dan approve/reject/revisi referral di antrian persetujuan.",
  },
  {
    email: "processor@example.local",
    name: "Subsidiary Processor",
    role: "SUBSIDIARY_PROCESSOR",
    roleLabel: "Anak Perusahaan",
    description: "Proses referral yang sudah disetujui hingga selesai.",
  },
  {
    email: "viewer@example.local",
    name: "Management Viewer",
    role: "VIEWER",
    roleLabel: "Viewer",
    description: "Lihat dashboard dan monitoring (read-only).",
  },
] as const;

export const REFERRAL_WORKFLOW = [
  {
    step: 1,
    title: "Input Referral",
    status: "DRAFT",
    actor: "Referral Officer / Admin",
    action: "Buat referral baru di menu Referral → Buat Referral, isi data nasabah & business group.",
  },
  {
    step: 2,
    title: "Upload Formulir Persetujuan",
    status: "DRAFT",
    actor: "Referral Officer",
    action: "Lampirkan formulir persetujuan internal sesuai kebijakan unit.",
  },
  {
    step: 3,
    title: "Upload Dokumen",
    status: "DRAFT → SUBMITTED",
    actor: "Referral Officer",
    action: "Upload dokumen wajib (KTP, KK, NPWP, dll.) lalu submit referral.",
  },
  {
    step: 4,
    title: "Validasi Otomatis",
    status: "VALIDATING",
    actor: "Sistem",
    action: "Sistem mengecek kelengkapan data & dokumen. Gagal → VALIDATION_FAILED (perbaiki & submit ulang).",
  },
  {
    step: 5,
    title: "Approval Head Unit",
    status: "PENDING_APPROVAL",
    actor: "Head Unit / Admin",
    action: "Review di menu Approval → setujui, tolak, atau minta revisi.",
  },
  {
    step: 6,
    title: "Submit ke Anak Perusahaan",
    status: "APPROVED → SUBMITTED_TO_SUBSIDIARY",
    actor: "Head Unit / Admin",
    action: "Referral disetujui dan diteruskan ke business group tujuan.",
  },
  {
    step: 7,
    title: "Proses Analisa Anak Perusahaan",
    status: "IN_PROCESS",
    actor: "Subsidiary Processor",
    action: "Tim anak perusahaan menganalisa referral di detail referral.",
  },
  {
    step: 8,
    title: "Update Status Real-Time",
    status: "IN_PROCESS → COMPLETED",
    actor: "Subsidiary Processor",
    action: "Update progres hingga selesai (COMPLETED) atau ditolak (REJECTED).",
  },
  {
    step: 9,
    title: "Dashboard Monitoring",
    status: "COMPLETED",
    actor: "Semua role (Viewer+)",
    action: "Pantau KPI di Overview, Monitoring, dan Notifikasi in-app.",
  },
] as const;

type DemoGuideModalProps = {
  open: boolean;
  onClose: () => void;
  onUseAccount: (email: string) => void;
};

export function DemoGuideModal({ open, onClose, onUseAccount }: DemoGuideModalProps) {
  if (!open) return null;

  async function copyPassword() {
    await navigator.clipboard.writeText(DEMO_PASSWORD);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Tutup panduan demo"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-guide-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#111d33]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-[#1e3a5f]/60 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
              <h2 id="demo-guide-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Panduan Demo BGR
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Akun demo & alur referral dari awal hingga selesai
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Akun Demo
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Semua akun menggunakan password:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-[#0f1a2e]">
                  {DEMO_PASSWORD}
                </code>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-[#0066AE] hover:underline dark:text-[#63ACF2]"
                >
                  <Copy className="h-3 w-3" />
                  Salin
                </button>
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="rounded-xl border border-slate-200/80 p-4 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{account.name}</p>
                        <Badge variant="info">{account.roleLabel}</Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {account.email}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{account.description}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onUseAccount(account.email);
                        onClose();
                      }}
                    >
                      Gunakan akun
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Alur Referral (Awal → Selesai)
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Ikuti urutan langkah berikut untuk simulasi end-to-end.
              </p>
            </div>

            <ol className="relative space-y-0">
              {REFERRAL_WORKFLOW.map((item, index) => {
                const isLast = index === REFERRAL_WORKFLOW.length - 1;
                return (
                  <li key={item.step} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-gradient-to-b from-[#63ACF2] to-[#AAD2F8]/40"
                        aria-hidden
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                        "bg-gradient-to-br from-[#0066AE] to-[#2FA6FC]",
                      )}
                    >
                      {String(item.step).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <Badge variant="default">{item.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[#0066AE] dark:text-[#63ACF2]">
                        {item.actor}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.action}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="mt-6 rounded-xl border border-[#0066AE]/20 bg-[#0066AE]/5 p-4 dark:border-[#63ACF2]/20 dark:bg-[#0066AE]/10">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Tips simulasi cepat</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li>Login sebagai <strong>officer</strong> → buat & submit referral</li>
              <li>Logout → login <strong>approver</strong> → approve di menu Approval</li>
              <li>Logout → login <strong>processor</strong> → proses hingga Completed</li>
              <li>Login <strong>viewer</strong> atau <strong>admin</strong> → cek Overview & Monitoring</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 dark:border-[#1e3a5f]/60 sm:px-6">
          <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
