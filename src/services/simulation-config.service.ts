import { prisma } from "@/lib/db";
import {
  DEFAULT_SIMULATION_CONFIG,
  SIMULATION_CONFIG_KEY,
  type SimulationConfig,
} from "@/lib/simulasi/config";

export const simulationConfigService = {
  async getConfig(): Promise<SimulationConfig> {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: SIMULATION_CONFIG_KEY },
      });

      if (!setting || !setting.value || typeof setting.value !== "object") {
        return DEFAULT_SIMULATION_CONFIG;
      }

      const val = setting.value as Partial<SimulationConfig>;
      return {
        kkb: {
          ...DEFAULT_SIMULATION_CONFIG.kkb,
          ...(val.kkb || {}),
        },
        insurance: {
          mobil: {
            ...DEFAULT_SIMULATION_CONFIG.insurance.mobil,
            ...(val.insurance?.mobil || {}),
          },
          kesehatan: {
            rates: val.insurance?.kesehatan?.rates || DEFAULT_SIMULATION_CONFIG.insurance.kesehatan.rates,
          },
          jiwa: {
            ...DEFAULT_SIMULATION_CONFIG.insurance.jiwa,
            ...(val.insurance?.jiwa || {}),
          },
        },
      };
    } catch {
      return DEFAULT_SIMULATION_CONFIG;
    }
  },

  async updateConfig(newConfig: SimulationConfig, updatedById: string): Promise<SimulationConfig> {
    const updated = await prisma.systemSetting.upsert({
      where: { key: SIMULATION_CONFIG_KEY },
      create: {
        key: SIMULATION_CONFIG_KEY,
        value: newConfig,
        description: "Konfigurasi tarif default simulasi KKB dan BCA Insurance",
        updatedById,
      },
      update: {
        value: newConfig,
        updatedById,
      },
    });

    return updated.value as SimulationConfig;
  },
};
