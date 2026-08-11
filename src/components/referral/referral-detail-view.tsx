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
import { uploadDocumentAction } from "@/actions/document.actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea, Alert } from "@/components/ui";
import { StatusBadge } from "@/components/referral/status-badge";
import { formatDate } from "@/lib/utils";
import {
  formatUploadError,
  MAX_UPLOAD_LABEL,
  validateUploadFileSize,
} from "@/lib/upload.constants";
import { ReferralStatus } from "@prisma/client";

type ReferralDetail = {
  id: string;
  referralNumber: string;
  status: ReferralStatus;
  customerName: string | null;
  customerIdentifier: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subject: string | null;
  description: string | null;
  createdAt: Date;
  businessGroup: { id: string; name: string };
  createdBy: { name: string };
  documents: Array<{
    id: string;
    originalFilename: string;
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

export function ReferralDetailView({
  referral,
  requirements,
  canEdit,
  canSubmit,
  canApprove,
  canProcess,
}: {
  referral: ReferralDetail;
  requirements: Requirement[];
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canProcess: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await updateReferralAction(referral.id, {
      customerName: (form.get("customerName") as string) || undefined,
      customerIdentifier: (form.get("customerIdentifier") as string) || undefined,
      customerEmail: (form.get("customerEmail") as string) || undefined,
      customerPhone: (form.get("customerPhone") as string) || undefined,
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

  async function handleApproval(decision: "APPROVED" | "REJECTED" | "REVISION_REQUIRED") {
    const note = prompt("Catatan (opsional):") ?? undefined;
    setLoading(true);
    const result = await approveReferralAction({ referralId: referral.id, decision, note });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Keputusan persetujuan tersimpan.");
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

  async function handleProcessing(toStatus: "IN_PROCESS" | "COMPLETED" | "REJECTED" | "CANCELLED") {
    setLoading(true);
    const result = await updateProcessingStatusAction(referral.id, toStatus);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setMessage("Status pemrosesan diperbarui.");
    router.refresh();
  }

  const latestValidation = referral.validationRuns[0];

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

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <Button onClick={handleSubmitReferral} disabled={loading}>
            Submit Referral
          </Button>
        )}
        {canApprove && referral.status === "PENDING_APPROVAL" && (
          <>
            <Button onClick={() => handleApproval("APPROVED")} disabled={loading}>
              Setujui
            </Button>
            <Button variant="destructive" onClick={() => handleApproval("REJECTED")} disabled={loading}>
              Tolak
            </Button>
            <Button variant="secondary" onClick={() => handleApproval("REVISION_REQUIRED")} disabled={loading}>
              Minta Revisi
            </Button>
          </>
        )}
        {referral.status === "APPROVED" && (
          <Button onClick={handleSubmitToSubsidiary} disabled={loading}>
            Submit ke Anak Perusahaan
          </Button>
        )}
        {canProcess && referral.status === "SUBMITTED_TO_SUBSIDIARY" && (
          <Button onClick={() => handleProcessing("IN_PROCESS")} disabled={loading}>
            Mulai Proses
          </Button>
        )}
        {canProcess && referral.status === "IN_PROCESS" && (
          <>
            <Button onClick={() => handleProcessing("COMPLETED")} disabled={loading}>
              Selesai
            </Button>
            <Button variant="destructive" onClick={() => handleProcessing("REJECTED")} disabled={loading}>
              Tolak
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
              <ul className="space-y-2 text-sm">
                {referral.documents.map((d) => (
                  <li key={d.id} className="flex justify-between border-b border-slate-100 py-2">
                    <span>
                      {d.originalFilename}
                      {d.requirement && (
                        <span className="ml-2 text-slate-400">
                          ({d.requirement.name} · {d.requirement.code})
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400">{formatDate(d.uploadedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

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
            <ul className="space-y-3 text-sm">
              {referral.approvals.map((a, i) => (
                <li key={i} className="border-b border-slate-100 pb-2">
                  <div className="font-medium">{a.decision} — {a.approver.name}</div>
                  <div className="text-slate-500">{formatDate(a.decidedAt)}</div>
                  {a.note && <div className="mt-1">{a.note}</div>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {referral.statusHistory.map((h, i) => (
              <li key={i} className="border-l-2 border-[#0066AE] pl-4">
                <div className="font-medium">
                  {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                </div>
                <div className="text-slate-500">
                  {h.changedBy.name} · {formatDate(h.createdAt)}
                </div>
                {h.note && <div className="mt-1 text-slate-600">{h.note}</div>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
