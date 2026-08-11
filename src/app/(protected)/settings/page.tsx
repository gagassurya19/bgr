import { prisma } from "@/lib/db";
import { SettingsHub } from "@/components/settings/settings-hub";

export default async function SettingsPage() {
  const [documentRequirements, users, businessGroups] = await Promise.all([
    prisma.documentRequirement.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.businessGroup.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Konfigurasi sistem, organisasi, dan informasi deployment
        </p>
      </div>

      <SettingsHub
        stats={{
          documentRequirements,
          users,
          businessGroups,
        }}
      />
    </div>
  );
}
