"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDocumentRequirementAction,
  toggleDocumentRequirementAction,
} from "@/actions/document-requirement.actions";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";

type BusinessGroup = { id: string; name: string; code: string };

type Requirement = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  businessGroup: { id: string; name: string; code: string } | null;
};

export function DocumentRequirementsManager({
  requirements,
  businessGroups,
}: {
  requirements: Requirement[];
  businessGroups: BusinessGroup[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const businessGroupId = form.get("businessGroupId") as string;

    const result = await createDocumentRequirementAction({
      code: (form.get("code") as string).toUpperCase(),
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      businessGroupId: businessGroupId ? businessGroupId : null,
      isRequired: form.get("isRequired") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    });

    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage("Persyaratan dokumen berhasil ditambahkan.");
    e.currentTarget.reset();
    router.refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    setLoading(true);
    setError(null);
    const result = await toggleDocumentRequirementAction(id, isActive);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Tambah Persyaratan Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid max-w-2xl gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="code">Kode *</Label>
                <Input id="code" name="code" required placeholder="KTP" />
                <p className="text-xs text-slate-500">Contoh: KTP, KK, NPWP</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nama *</Label>
                <Input id="name" name="name" required placeholder="Kartu Tanda Penduduk" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="businessGroupId">Business Group</Label>
              <Select id="businessGroupId" name="businessGroupId" defaultValue="">
                <option value="">Semua business group</option>
                {businessGroups.map((bg) => (
                  <option key={bg.id} value={bg.id}>
                    {bg.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="sortOrder">Urutan</Label>
                <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
              </div>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <input type="checkbox" name="isRequired" defaultChecked className="h-4 w-4" />
                Wajib diunggah
              </label>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah Persyaratan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Persyaratan ({requirements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada persyaratan dokumen.</p>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow className="pointer-events-none hover:bg-transparent">
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Business Group</TableHead>
                    <TableHead>Wajib</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{req.code}</TableCell>
                      <TableCell>{req.name}</TableCell>
                      <TableCell>{req.businessGroup?.name ?? "Semua"}</TableCell>
                      <TableCell>
                        <Badge variant={req.isRequired ? "warning" : "default"}>
                          {req.isRequired ? "Wajib" : "Opsional"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.isActive ? "success" : "default"}>
                          {req.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant={req.isActive ? "outline" : "secondary"}
                          disabled={loading}
                          onClick={() => handleToggle(req.id, !req.isActive)}
                        >
                          {req.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
