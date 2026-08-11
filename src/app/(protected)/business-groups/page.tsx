import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageBusinessGroups } from "@/lib/rbac";
import { BusinessGroupsManager } from "@/components/settings/business-groups-manager";
import { ChevronLeft } from "lucide-react";

export default async function BusinessGroupsPage() {
  const session = await auth();
  const canManage = session?.user ? canManageBusinessGroups(session.user.role) : false;

  const groups = await prisma.businessGroup.findMany({
    include: {
      _count: {
        select: {
          referrals: true,
          documentRequirements: true,
          users: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-[#0066AE] dark:text-slate-400 dark:hover:text-[#63ACF2]"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Pengaturan
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Business Group</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Anak perusahaan tujuan referral
          {canManage && " — admin dan officer dapat menambah business group baru"}
        </p>
      </div>

      <BusinessGroupsManager groups={groups} canManage={canManage} />
    </div>
  );
}
