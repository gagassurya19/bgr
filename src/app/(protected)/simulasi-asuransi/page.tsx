import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { simulationConfigService } from "@/services/simulation-config.service";
import { InsuranceSimulator } from "@/components/simulasi/insurance-simulator";

export const dynamic = "force-dynamic";

export default async function SimulasiAsuransiPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const config = await simulationConfigService.getConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Simulasi BCA Insurance & BCA Life
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kalkulator estimasi premi proteksi Kendaraan (Auto Cillin), Kesehatan, dan Jiwa sesuai kebutuhan Anda.
        </p>
      </div>

      <InsuranceSimulator config={config.insurance} />
    </div>
  );
}
