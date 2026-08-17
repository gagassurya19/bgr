"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateReferralAction,
  submitReferralAction,
} from "@/actions/referral.actions";
import {
  approveReferralAction,
  submitToSubsidiaryAction,
  updateProcessingStatusAction,
} from "@/actions/approval.actions";
import { uploadDocumentAction, deleteDocumentAction } from "@/actions/document.actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea, Alert, Badge } from "@/components/ui";
import { StatusBadge } from "@/components/referral/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PdfThumbnail } from "@/components/referral/pdf-thumbnail";
import {
  formatUploadError,
  MAX_UPLOAD_LABEL,
  validateUploadFileSize,
} from "@/lib/upload.constants";
import { ReferralStatus, Prisma } from "@prisma/client";
import { AlertTriangle, FileEdit } from "lucide-react";

type ReferralDetail = {
  id: string;
  referralNumber: string;
  status: ReferralStatus;
  customerName: string | null;
  customerIdentifier: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  annualTaxRevenue: Prisma.Decimal | number | null;
  subject: string | null;
  description: string | null;
  createdAt: Date;
  businessGroup: { id: string; name: string };
  createdBy: { name: string };
  documents: Array<{
    id: string;
    originalFilename: string;
    mimeType: string;
    uploadedAt: Date;
    requirement: { code: string; name: string } | null;
  }>;
  validationRuns: Array<{
    id: string;
    status: string;
    completedAt: Date | null;
    results: Array<{ passed: boolean; message: string; severity: string; rule: { code: string } }>;
  }>;
  approvals: Array<{
    decision: string;
    note: string | null;
    decidedAt: Date;
    approver: { name: string };
  }>;
  statusHistory: Array<{
    fromStatus: ReferralStatus | null;
    toStatus: ReferralStatus;
    note: string | null;
    createdAt: Date;
    changedBy: { name: string };
  }>;
};

type Requirement = { id: string; code: string; name: string };

function DocumentPreview({ doc, canView, compact = false }: { doc: ReferralDetail["documents"][number]; canView: boolean; compact?: boolean }) {
  if (!canView) {
    return (
      <div className={compact ? "flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-center dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]" : "rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]"}>
        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{doc.originalFilename}</p>
      </div>
    );
  }

  if (doc.mimeType.startsWith("image/")) {
    return (
      <img
        src={`/api/documents/${doc.id}`}
        alt={doc.originalFilename}
        className={compact ? "h-full w-full rounded-md object-cover" : "h-full w-full object-contain"}
      />
    );
  }

  if (doc.mimeType === "application/pdf" || doc.mimeType.startsWith("text/")) {
    return (
      <div className={compact ? "h-full w-full" : "h-full w-full overflow-hidden"}>
        {doc.mimeType === "application/pdf" ? (
          compact ? (
            <PdfThumbnail documentId={doc.id} filename={doc.originalFilename} />
          ) : (
            <iframe
              src={`/api/documents/${doc.id}`}
              title={doc.originalFilename}
              className="h-full w-full"
            />
          )
        ) : compact ? (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-[#0f1a2e] dark:text-slate-300">
            <p className="text-[10px] font-semibold uppercase tracking-wide">TXT</p>
          </div>
        ) : (
          <iframe
            src={`/api/documents/${doc.id}`}
            title={doc.originalFilename}
            className="h-full w-full"
          />
        )}
      </div>
    );
  }

  return (
    <div className={compact ? "flex h-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-100 px-2 text-center dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]" : "flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]"}>
      <div>
        <p className={compact ? "text-[10px] text-slate-600 dark:text-slate-300" : "text-sm text-slate-600 dark:text-slate-300"}>File</p>
        {!compact && (
          <a
            href={`/api/documents/${doc.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-[#0066AE] hover:underline dark:text-[#63ACF2]"
          >
            Buka di tab baru
          </a>
        )}
      </div>
    </div>
  );
}

export function ReferralDetailView({
  referral,
  requirements,
  canEdit,
  canSubmit,
  canApprove,
  canProcess,
  canViewDocuments,
}: {
  referral: ReferralDetail;
  requirements: Requirement[];
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canProcess: boolean;
  canViewDocuments: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [subsidiaryRevisionModalOpen, setSubsidiaryRevisionModalOpen] = useState(false);
  const [subsidiaryRevisionNote, setSubsidiaryRevisionNote] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedDocument = referral.documents.find((doc) => doc.id === selectedDocumentId) ?? null;

  async function handleDeleteDocument(documentId: string) {
    const doc = referral.documents.find((d) => d.id === documentId);
    if (!doc) return;
    const confirmed = window.confirm(
      `Hapus dokumen "${doc.originalFilename}"? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;

    setDeletingId(documentId);
    setError(null);
    setMessage(null);
    try {
      const result = await deleteDocumentAction(referral.id, documentId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }
      setMessage("Dokumen berhasil dihapus.");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const rawAnnualTax = form.get("annualTaxRevenue") as string;
    const annualTaxRevenue = rawAnnualTax ? parseFloat(rawAnnualTax) : undefined;
    const result = await updateReferralAction(referral.id, {
      customerName: (form.get("customerName") as string) || undefined,
      customerIdentifier: (form.get("customerIdentifier") as string) || undefined,
      customerEmail: (form.get("customerEmail") as string) || undefined,
      customerPhone: (form.get("customerPhone") as string) || undefined,
      annualTaxRevenue,
      subject: (form.get("subject") as string) || undefined,
      description: (form.get("description") as string) || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Referral berhasil diperbarui.");
    router.refresh();
  }

  async function handleSubmitReferral() {
    setLoading(true);
    setError(null);
    const result = await submitReferralAction(referral.id);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Referral berhasil disubmit.");
    router.refresh();
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setUploadError(null);
    setError(null);
    setMessage(null);

    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File)) {
      setUploadError("File wajib dipilih.");
      setLoading(false);
      return;
    }

    const sizeError = validateUploadFileSize(file.size);
    if (sizeError) {
      setUploadError(sizeError);
      setLoading(false);
      return;
    }

    try {
      const result = await uploadDocumentAction(referral.id, formData);
      if (!result.success) {
        setUploadError(result.message);
        return;
      }
      setMessage("Dokumen berhasil diunggah.");
      form.reset();
      router.refresh();
    } catch (err) {
      setUploadError(formatUploadError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadError(null);
      return;
    }
    setUploadError(validateUploadFileSize(file.size));
  }

  async function handleSetujuiOrTolak(decision: "APPROVED" | "REJECTED") {
    const note = prompt("Catatan (opsional):") ?? undefined;
    setLoading(true);
    setError(null);
    const result = await approveReferralAction({ referralId: referral.id, decision, note });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Keputusan persetujuan tersimpan.");
    router.refresh();
  }

  async function handleSubmitRevision() {
    if (!revisionNote.trim()) {
      setError("Catatan revisi wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await approveReferralAction({
      referralId: referral.id,
      decision: "REVISION_REQUIRED",
      note: revisionNote.trim(),
    });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setRevisionNote("");
    setMessage("Referral dikembalikan untuk perbaikan dokumen.");
    router.refresh();
  }

  async function handleSubmitToSubsidiary() {
    setLoading(true);
    const result = await submitToSubsidiaryAction(referral.id);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Referral disubmit ke anak perusahaan.");
    router.refresh();
  }

  async function handleProcessing(toStatus: "IN_PROCESS" | "COMPLETED" | "REJECTED" | "REVISION_BY_SUBSIDIARY" | "CANCELLED", note?: string) {
    setLoading(true);
    const result = await updateProcessingStatusAction(referral.id, toStatus, note);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Status pemrosesan diperbarui.");
    router.refresh();
  }

  async function handleSubsidiaryRevision() {
    if (!subsidiaryRevisionNote.trim()) {
      setError("Deskripsi revisi wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await updateProcessingStatusAction(
      referral.id,
      "REVISION_BY_SUBSIDIARY",
      subsidiaryRevisionNote.trim(),
    );
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setSubsidiaryRevisionModalOpen(false);
    setSubsidiaryRevisionNote("");
    setMessage("Referral dikembalikan untuk revisi oleh Anak Perusahaan.");
    router.refresh();
  }

  const latestValidation = referral.validationRuns[0];

  const latestRevision = (["REVISION_REQUIRED", "REVISION_BY_SUBSIDIARY"] as ReferralStatus[])
    .map((st) => referral.statusHistory.find((h) => h.toStatus === st))
    .filter(Boolean)
    .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime())[0];

  const uploadedCodes = new Set(
    referral.documents
      .map((d) => d.requirement?.code)
      .filter((code): code is string => !!code),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{referral.referralNumber}</h2>
          <p className="text-sm text-slate-500">
            {referral.businessGroup.name} · Dibuat {formatDate(referral.createdAt)} oleh {referral.createdBy.name}
          </p>
        </div>
        <StatusBadge status={referral.status} />
      </div>

      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {latestRevision && latestRevision.note && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {latestRevision.toStatus === "REVISION_BY_SUBSIDIARY"
                ? "📌 Catatan Deskripsi Revisi dari Anak Perusahaan"
                : "📌 Catatan Deskripsi Revisi dari Head Unit"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800 dark:text-amber-200">
              {latestRevision.note}
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Diminta oleh {latestRevision.changedBy.name} · {formatDate(latestRevision.createdAt)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <Button onClick={handleSubmitReferral} disabled={loading}>
            Submit Referral
          </Button>
        )}
        {canApprove && referral.status === "PENDING_APPROVAL" && (
          <>
            <Button onClick={() => handleSetujuiOrTolak("APPROVED")} disabled={loading}>
              Setujui
            </Button>
            <Button variant="destructive" onClick={() => handleSetujuiOrTolak("REJECTED")} disabled={loading}>
              Tolak
            </Button>
          </>
        )}
        {referral.status === "APPROVED" && (
          <Button onClick={handleSubmitToSubsidiary} disabled={loading}>
            Submit ke Anak Perusahaan
          </Button>
        )}
        {canProcess && referral.status === "SUBMITTED_TO_SUBSIDIARY" && (
          <>
            <Button onClick={() => handleProcessing("IN_PROCESS")} disabled={loading}>
              Mulai Proses
            </Button>
            <Button onClick={() => handleProcessing("COMPLETED")} disabled={loading}>
              Setujui / Selesai
            </Button>
            <Button variant="destructive" onClick={() => handleProcessing("REJECTED")} disabled={loading}>
              Tolak
            </Button>
            <Button variant="secondary" onClick={() => setSubsidiaryRevisionModalOpen(true)} disabled={loading}>
              Minta Revisi
            </Button>
          </>
        )}
        {canProcess && referral.status === "IN_PROCESS" && (
          <>
            <Button onClick={() => handleProcessing("COMPLETED")} disabled={loading}>
              Setujui / Selesai
            </Button>
            <Button variant="destructive" onClick={() => handleProcessing("REJECTED")} disabled={loading}>
              Tolak
            </Button>
            <Button variant="secondary" onClick={() => setSubsidiaryRevisionModalOpen(true)} disabled={loading}>
              Minta Revisi
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Referral</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="customerName">Nama Nasabah</Label>
                  <Input id="customerName" name="customerName" defaultValue={referral.customerName ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customerIdentifier">Identitas</Label>
                  <Input id="customerIdentifier" name="customerIdentifier" defaultValue={referral.customerIdentifier ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input id="customerEmail" name="customerEmail" defaultValue={referral.customerEmail ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customerPhone">Telepon</Label>
                  <Input id="customerPhone" name="customerPhone" defaultValue={referral.customerPhone ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="annualTaxRevenue">Omset per Tahun (yg dilaporkan ke pajak)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="annualTaxRevenue"
                      name="annualTaxRevenue"
                      type="number"
                      step="1000000"
                      min="0"
                      defaultValue={
                        referral.annualTaxRevenue != null ? Number(referral.annualTaxRevenue) : ""
                      }
                    />
                    {referral.annualTaxRevenue != null && (
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {formatCurrency(Number(referral.annualTaxRevenue))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subject">Subjek</Label>
                  <Input id="subject" name="subject" defaultValue={referral.subject ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" name="description" defaultValue={referral.description ?? ""} />
                </div>
                <Button type="submit" disabled={loading}>
                  Simpan Perubahan
                </Button>
              </form>
            ) : (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">Nama Nasabah</dt><dd>{referral.customerName ?? "-"}</dd></div>
                <div><dt className="text-slate-500">Identitas</dt><dd>{referral.customerIdentifier ?? "-"}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd>{referral.customerEmail ?? "-"}</dd></div>
                <div><dt className="text-slate-500">Telepon</dt><dd>{referral.customerPhone ?? "-"}</dd></div>
                <div><dt className="text-slate-500">Omset per Tahun (yg dilaporkan ke pajak)</dt><dd>{referral.annualTaxRevenue != null ? formatCurrency(Number(referral.annualTaxRevenue)) : "-"}</dd></div>
                <div><dt className="text-slate-500">Subjek</dt><dd>{referral.subject ?? "-"}</dd></div>
                <div><dt className="text-slate-500">Deskripsi</dt><dd>{referral.description ?? "-"}</dd></div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Dokumen wajib</p>
              {requirements.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada persyaratan dokumen untuk business group ini. Admin dapat menambahkannya di{" "}
                  <a href="/settings/document-requirements" className="text-[#0066AE] hover:underline">
                    Pengaturan → Persyaratan Dokumen
                  </a>
                  .
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {requirements.map((req) => {
                    const uploaded = uploadedCodes.has(req.code);
                    return (
                      <li key={req.id} className={uploaded ? "text-green-700" : "text-red-600"}>
                        {uploaded ? "✓" : "✗"} {req.name} ({req.code})
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {canEdit && requirements.length > 0 && (
              <form onSubmit={handleUpload} className="space-y-3 rounded border border-dashed border-slate-300 p-4">
                <div className="space-y-1">
                  <Label htmlFor="requirementId">Jenis Dokumen *</Label>
                  <Select id="requirementId" name="requirementId" required defaultValue="">
                    <option value="" disabled>
                      Pilih jenis dokumen wajib
                    </option>
                    {requirements.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </Select>
                </div>
                <Input
                  name="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  onChange={handleFileChange}
                />
                <p className="text-xs text-slate-500">
                  Format: PDF, JPG, PNG · Maks. {MAX_UPLOAD_LABEL}
                </p>
                {uploadError && <Alert variant="error">{uploadError}</Alert>}
                <Button type="submit" size="sm" disabled={loading || !!uploadError}>
                  {loading ? "Mengunggah..." : "Unggah Dokumen"}
                </Button>
              </form>
            )}
            {referral.documents.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada dokumen diunggah.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {referral.documents.map((d) => (
                    <div
                      key={d.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDocumentId(d.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDocumentId(d.id);
                        }
                      }}
                      className="group relative w-40 flex-shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-[#0066AE]/60 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#0066AE]/30 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e] dark:hover:border-[#63ACF2]/60"
                    >
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(d.id);
                          }}
                          disabled={deletingId === d.id}
                          title="Hapus dokumen"
                          className="absolute right-2 top-2 z-10 rounded-md border border-slate-200 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-red-600 shadow-sm transition hover:bg-red-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/90 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          {deletingId === d.id ? "..." : "Hapus"}
                        </button>
                      )}
                      <div className="mb-2 h-24 overflow-hidden rounded-md border border-slate-200 bg-white dark:border-[#1e3a5f]/60 dark:bg-[#111d33]">
                        <DocumentPreview doc={d} canView={canViewDocuments} compact />
                      </div>
                      <div className="space-y-1">
                        <p className="truncate text-xs font-medium text-slate-900 dark:text-white">{d.originalFilename}</p>
                        {d.requirement && (
                          <Badge variant="info" className="max-w-full truncate text-[10px]">
                            {d.requirement.name}
                          </Badge>
                        )}
                        <p className="text-[10px] text-slate-400">{formatDate(d.uploadedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setSelectedDocumentId(null)}
        >
          <div
            className="relative flex h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] max-w-none flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#1e3a5f]/60">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedDocument.originalFilename}
                </p>
                {selectedDocument.requirement && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDocument.requirement.name} · {selectedDocument.requirement.code}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(selectedDocument.id)}
                    disabled={deletingId === selectedDocument.id}
                    className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {deletingId === selectedDocument.id ? "Menghapus..." : "Hapus"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDocumentId(null)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-[#1e3a5f]/60 dark:text-slate-300 dark:hover:bg-[#0f1a2e]"
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-50 p-4 dark:bg-[#0a1220]">
              <DocumentPreview doc={selectedDocument} canView={canViewDocuments} />
            </div>
          </div>
        </div>
      )}

      {subsidiaryRevisionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setSubsidiaryRevisionModalOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#1e3a5f]/60">
              <div className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Minta Revisi (Anak Perusahaan)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubsidiaryRevisionModalOpen(false)}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-[#1e3a5f]/60 dark:text-slate-300 dark:hover:bg-[#0f1a2e]"
              >
                Tutup
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tuliskan deskripsi revisi yang perlu diperbaiki oleh Referral Officer. Catatan ini akan terlihat sebagai banner di halaman referral.
              </p>
              <div className="space-y-1">
                <Label htmlFor="subsidiary-revision-note">Deskripsi / Catatan Revisi *</Label>
                <Textarea
                  id="subsidiary-revision-note"
                  value={subsidiaryRevisionNote}
                  onChange={(e) => setSubsidiaryRevisionNote(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan bagian dokumen/data yang perlu diperbaiki beserta alasan..."
                />
              </div>
              {error && <Alert variant="error">{error}</Alert>}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubsidiaryRevisionModalOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSubsidiaryRevision}
                  disabled={loading || !subsidiaryRevisionNote.trim()}
                >
                  {loading ? "Mengirim..." : "Kirim Revisi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {canApprove && referral.status === "PENDING_APPROVAL" && (
        <Card>
          <CardHeader>
            <CardTitle>Minta Revisi Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="revision-note">Catatan Revisi *</Label>
                <Textarea
                  id="revision-note"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan bagian dokumen yang perlu diperbaiki..."
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmitRevision}
                disabled={loading || !revisionNote.trim()}
              >
                {loading ? "Mengirim..." : "Kirim Revisi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {latestValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Validasi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {latestValidation.results.map((r, i) => (
                <li key={i} className={r.passed ? "text-green-700" : "text-red-700"}>
                  [{r.rule.code}] {r.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {referral.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 dark:border-[#1e3a5f]/60">
                  <tr>
                    <th className="py-2.5 pr-4">Keputusan</th>
                    <th className="py-2.5 pr-4">Disetujui / Diproses Oleh</th>
                    <th className="py-2.5 pr-4">Waktu</th>
                    <th className="py-2.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/40">
                  {referral.approvals.map((a, i) => {
                    const isRevision = a.decision === "REVISION_REQUIRED" || a.decision === "REVISION_BY_SUBSIDIARY";
                    const decisionLabel =
                      a.decision === "APPROVED"
                        ? "Disetujui"
                        : a.decision === "REJECTED"
                          ? "Ditolak"
                          : a.decision === "REVISION_BY_SUBSIDIARY"
                            ? "Revisi Anak Perusahaan"
                            : "Revisi Diperlukan";
                    return (
                      <tr key={i} className="align-top hover:bg-slate-50 dark:hover:bg-[#1e3a5f]/20">
                        <td className="py-3 pr-4">
                          <Badge variant={isRevision ? "warning" : a.decision === "APPROVED" ? "success" : "danger"}>
                            {decisionLabel}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                          {a.approver.name}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {formatDate(a.decidedAt)}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">
                          {a.note ? a.note : <span className="text-slate-400">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 dark:border-[#1e3a5f]/60">
                <tr>
                  <th className="py-2.5 pr-4">Status Perubahan</th>
                  <th className="py-2.5 pr-4">Oleh</th>
                  <th className="py-2.5 pr-4">Waktu</th>
                  <th className="py-2.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/40">
                {referral.statusHistory.map((h, i) => (
                  <tr key={i} className="align-top hover:bg-slate-50 dark:hover:bg-[#1e3a5f]/20">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {h.fromStatus ? h.fromStatus : "AKHIR"}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="rounded-md bg-[#0066AE]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
                          {h.toStatus}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {h.changedBy.name}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(h.createdAt)}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {h.note ? h.note : <span className="text-slate-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
