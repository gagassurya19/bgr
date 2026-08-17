import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { simulationConfigService } from "@/services/simulation-config.service";
import { KkbSimulator } from "@/components/simulasi/kkb-simulator";

export const dynamic = "force-dynamic";

export default async function SimulasiKkbPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const config = await simulationConfigService.getConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Simulasi KKB (Kredit Kendaraan Bermotor)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hitung perkiraan cicilan bulanan kredit mobil atau motor dengan bunga flat dan bandingkan seluruh tenor secara instan.
        </p>
      </div>

      <KkbSimulator config={config.kkb} />
    </div>
  );
}
