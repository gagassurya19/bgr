"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Edit2,
} from "lucide-react";
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
} from "@/components/ui";
import {
  createUserAction,
  updateUserAction,
  deactivateUserAction,
} from "@/actions/user.actions";
import { UserRole, UserStatus } from "@prisma/client";

const MANAGEABLE_ROLES: UserRole[] = [
  "REFERRAL_OFFICER",
  "HEAD_UNIT",
  "SUBSIDIARY_PROCESSOR",
  "VIEWER",
];

export type UserItem = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  businessUnitId: string | null;
  businessGroupId: string | null;
  businessUnit: { id: string; name: string } | null;
  businessGroup: { id: string; name: string } | null;
  createdAt: Date;
};

type OptionItem = { id: string; name: string };

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  HEAD_UNIT: "Head Unit (Approver)",
  REFERRAL_OFFICER: "Referral Officer (Pembuat)",
  SUBSIDIARY_PROCESSOR: "Subsidiary Processor (Anak Perusahaan)",
  VIEWER: "Viewer (Manajemen)",
};

const ROLE_BADGE_VARIANTS: Record<
  UserRole,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  ADMIN: "danger",
  SUPER_ADMIN: "danger",
  HEAD_UNIT: "warning",
  REFERRAL_OFFICER: "info",
  SUBSIDIARY_PROCESSOR: "success",
  VIEWER: "default",
};

export function UsersManager({
  users,
  businessUnits,
  businessGroups,
  currentUserId,
}: {
  users: UserItem[];
  businessUnits: OptionItem[];
  businessGroups: OptionItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const inactiveUsers = totalUsers - activeUsers;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchRole =
      selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createUserAction({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: formData.get("role") as UserRole,
      businessUnitId: String(formData.get("businessUnitId") ?? "") || null,
      businessGroupId: String(formData.get("businessGroupId") ?? "") || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage("Pengguna baru berhasil ditambahkan.");
    form.reset();
    router.refresh();
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");

    const result = await updateUserAction(editingUser.id, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: password ? password : undefined,
      role: formData.get("role") as UserRole,
      businessUnitId: String(formData.get("businessUnitId") ?? "") || null,
      businessGroupId: String(formData.get("businessGroupId") ?? "") || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(`Pengguna "${editingUser.name}" berhasil diperbarui.`);
    setEditingUser(null);
    router.refresh();
  }

  async function handleToggleStatus(user: UserItem) {
    const isDeactivating = user.status === "ACTIVE";
    const actionLabel = isDeactivating ? "menonaktifkan" : "mengaktifkan";
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${actionLabel} pengguna "${user.name}" (${user.username})?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await deactivateUserAction(user.id, isDeactivating);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(
      `Pengguna "${user.name}" berhasil di${
        isDeactivating ? "nonaktifkan" : "aktifkan"
      }.`
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Total Pengguna
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {totalUsers}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066AE]/10 text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Pengguna Aktif
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeUsers}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dinonaktifkan
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-500 dark:text-slate-400">
                {inactiveUsers}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Form Tambah Pengguna */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
            Tambah Pengguna Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="budi@example.local"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  required
                  placeholder="budi.santoso"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password Awal *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="role">Role / Peran *</Label>
                <Select id="role" name="role" required defaultValue="">
                  <option value="" disabled>
                    Pilih Role
                  </option>
                  {MANAGEABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessGroupId">Business Group</Label>
                <Select id="businessGroupId" name="businessGroupId" defaultValue="">
                  <option value="">Tidak ada / Kantor Pusat</option>
                  {businessGroups.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.name}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Wajib untuk Subsidiary Processor
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessUnitId">Unit Kerja</Label>
                <Select id="businessUnitId" name="businessUnitId" defaultValue="">
                  <option value="">Pilih Unit Kerja</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>
                      {bu.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah Pengguna"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal / Dialog Edit Pengguna */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#1e3a5f]/60">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Edit Pengguna: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-[#1e3a5f]/60 dark:text-slate-300 dark:hover:bg-[#0f1a2e]"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-name">Nama Lengkap *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    required
                    defaultValue={editingUser.name}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={editingUser.email}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    name="username"
                    required
                    defaultValue={editingUser.username}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-password">
                    Password Baru (Opsional)
                  </Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    placeholder="Kosongkan jika tidak diubah"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-role">Role / Peran *</Label>
                  <Select
                    id="edit-role"
                    name="role"
                    required
                    defaultValue={editingUser.role}
                  >
                    {MANAGEABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-businessGroupId">Business Group</Label>
                  <Select
                    id="edit-businessGroupId"
                    name="businessGroupId"
                    defaultValue={editingUser.businessGroupId || ""}
                  >
                    <option value="">Tidak ada / Kantor Pusat</option>
                    {businessGroups.map((bg) => (
                      <option key={bg.id} value={bg.id}>
                        {bg.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="edit-businessUnitId">Unit Kerja</Label>
                  <Select
                    id="edit-businessUnitId"
                    name="businessUnitId"
                    defaultValue={editingUser.businessUnitId || ""}
                  >
                    <option value="">Pilih Unit Kerja</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Pengguna */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-[#1e3a5f]/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Daftar Pengguna</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                placeholder="Cari nama/email/username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-52 text-xs"
              />
              <Select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="h-9 w-44 text-xs"
              >
                <option value="ALL">Semua Role</option>
                <option value="ADMIN">Admin</option>
                <option value="HEAD_UNIT">Head Unit</option>
                <option value="REFERRAL_OFFICER">Referral Officer</option>
                <option value="SUBSIDIARY_PROCESSOR">Subsidiary Processor</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit / Business Group</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableEmpty colSpan={6} message="Tidak ada pengguna ditemukan." />
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUserId;
                    const isAdminUser =
                      u.role === "ADMIN" || u.role === "SUPER_ADMIN";
                    const canEditOrDeactivate = !isAdminUser && !isSelf;

                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  Anda
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {u.username}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ROLE_BADGE_VARIANTS[u.role]}>
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === "ACTIVE" ? "success" : "default"}
                          >
                            {u.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          <p>{u.businessUnit?.name ?? "-"}</p>
                          {u.businessGroup && (
                            <p className="text-[11px] text-slate-400">
                              BG: {u.businessGroup.name}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditOrDeactivate ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(u)}
                                disabled={loading}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  u.status === "ACTIVE"
                                    ? "destructive"
                                    : "secondary"
                                }
                                size="sm"
                                onClick={() => handleToggleStatus(u)}
                                disabled={loading}
                              >
                                {u.status === "ACTIVE"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400">
                              {isAdminUser ? "Admin Sistem" : "-"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
