"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { failure, success, type ActionResult } from "@/lib/errors";
import { canManageUsers } from "@/lib/rbac";
import { simulationConfigService } from "@/services/simulation-config.service";
import type { SimulationConfig } from "@/lib/simulasi/config";

export async function updateSimulationConfigAction(
  config: SimulationConfig,
): Promise<ActionResult<SimulationConfig>> {
  const session = await auth();
  if (!session?.user) {
    return failure("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }

  if (!canManageUsers(session.user.role)) {
    return failure("FORBIDDEN", "Hanya Administrator yang dapat mengubah konfigurasi simulasi.");
  }

  try {
    const updated = await simulationConfigService.updateConfig(config, session.user.id);
    revalidatePath("/simulasi-kkb");
    revalidatePath("/simulasi-asuransi");
    revalidatePath("/settings/simulasi");
    return success(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui konfigurasi simulasi.";
    return failure("UPDATE_FAILED", message);
  }
}
