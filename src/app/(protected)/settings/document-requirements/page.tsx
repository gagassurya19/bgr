import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { DocumentRequirementsManager } from "@/components/settings/document-requirements-manager";

export default async function DocumentRequirementsPage() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role)) {
    redirect("/dashboard");
  }

  const [requirements, businessGroups] = await Promise.all([
    prisma.documentRequirement.findMany({
      include: { businessGroup: { select: { id: true, name: true, code: true } } },
      orderBy: [{ businessGroupId: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
    }),
    prisma.businessGroup.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Persyaratan Dokumen</h2>
        <p className="text-sm text-slate-500">
          Kelola jenis dokumen wajib per business group. Daftar ini yang muncul saat upload referral.
        </p>
      </div>
      <DocumentRequirementsManager requirements={requirements} businessGroups={businessGroups} />
    </div>
  );
}
