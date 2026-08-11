import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canCreateReferral } from "@/lib/rbac";
import { CreateReferralForm } from "@/components/referral/create-referral-form";

export default async function NewReferralPage() {
  const session = await auth();
  if (!session?.user || !canCreateReferral(session.user.role)) {
    redirect("/referrals");
  }

  const businessGroups = await prisma.businessGroup.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Buat Referral</h2>
        <p className="text-sm text-slate-500">Isi data referral dan simpan sebagai draft</p>
      </div>
      <CreateReferralForm businessGroups={businessGroups} />
    </div>
  );
}
