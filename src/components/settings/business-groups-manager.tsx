"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileStack, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";
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
import { createBusinessGroupAction } from "@/actions/business-group.actions";

type BusinessGroupItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: {
    referrals: number;
    documentRequirements: number;
    users: number;
  };
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(value)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066AE]/10 text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function BusinessGroupsManager({
  groups,
  canManage,
}: {
  groups: BusinessGroupItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeCount = groups.filter((g) => g.isActive).length;
  const totalReferrals = groups.reduce((sum, g) => sum + g._count.referrals, 0);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createBusinessGroupAction({
      code: String(formData.get("code") ?? ""),
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage("Business group berhasil ditambahkan.");
    form.reset();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Business Group" value={groups.length} icon={Building2} />
        <StatCard label="Aktif" value={activeCount} icon={Building2} />
        <StatCard label="Total Referral" value={totalReferrals} icon={Users} />
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Business Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid max-w-2xl gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="code">Kode *</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    placeholder="BCA_FINANCE"
                    className="uppercase"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Huruf besar, angka, underscore. Contoh: BCA_LIFE
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Nama *</Label>
                  <Input id="name" name="name" required placeholder="BCA Finance" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="Anak perusahaan tujuan referral..."
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Tambah Business Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Business Group ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Referral</TableHead>
                  <TableHead className="text-right">Dokumen</TableHead>
                  <TableHead className="text-right">Pengguna</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableEmpty colSpan={7} message="Belum ada business group." />
                ) : (
                  groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-[#0f1a2e] dark:text-slate-200">
                          {g.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0066AE] dark:text-[#63ACF2]" />
                          {g.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-slate-500 dark:text-slate-400">
                        {g.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={g.isActive ? "success" : "default"}>
                          {g.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(g._count.referrals)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-end gap-1 text-slate-600 dark:text-slate-300">
                          <FileStack className="h-3.5 w-3.5" />
                          {formatNumber(g._count.documentRequirements)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(g._count.users)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
