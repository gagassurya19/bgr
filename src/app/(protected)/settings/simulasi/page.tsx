import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { simulationConfigService } from "@/services/simulation-config.service";
import { SimulationConfigManager } from "@/components/settings/simulation-config-manager";

export const dynamic = "force-dynamic";

export default async function SettingsSimulasiPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!canManageUsers(session.user.role)) {
    redirect("/dashboard");
  }

  const config = await simulationConfigService.getConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pengaturan Tarif Simulasi
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Konfigurasi nilai bawaan suku bunga KKB, tarif asuransi, dan biaya administrasi untuk kalkulator simulasi.
        </p>
      </div>

      <SimulationConfigManager initialConfig={config} />
    </div>
  );
}
