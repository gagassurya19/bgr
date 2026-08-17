import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { UsersManager } from "@/components/users/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!canManageUsers(session.user.role)) {
    redirect("/dashboard");
  }

  const [users, businessUnits, businessGroups] = await Promise.all([
    prisma.user.findMany({
      include: {
        businessUnit: { select: { id: true, name: true } },
        businessGroup: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.businessUnit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.businessGroup.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengguna</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manajemen pengguna aplikasi: tambah, edit, dan nonaktifkan akun operasional.
        </p>
      </div>

      <UsersManager
        users={users}
        businessUnits={businessUnits}
        businessGroups={businessGroups}
        currentUserId={session.user.id}
      />
    </div>
  );
}
