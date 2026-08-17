"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Alert,
} from "@/components/ui";
import { updateSimulationConfigAction } from "@/actions/simulation-config.actions";
import {
  DEFAULT_SIMULATION_CONFIG,
  type SimulationConfig,
} from "@/lib/simulasi/config";
import { formatCurrency } from "@/lib/utils";

export function SimulationConfigManager({
  initialConfig,
}: {
  initialConfig: SimulationConfig;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<SimulationConfig>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await updateSimulationConfigAction(config);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage("Konfigurasi tarif simulasi berhasil diperbarui.");
    router.refresh();
  }

  function handleReset() {
    if (window.confirm("Kembalikan ke konfigurasi default sistem?")) {
      setConfig(DEFAULT_SIMULATION_CONFIG);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {/* KKB Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tarif Default KKB (Kredit Kendaraan Bermotor)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="kkbRate">Bunga Flat Default (%/tahun)</Label>
              <Input
                id="kkbRate"
                type="number"
                step="0.01"
                min="0"
                value={config.kkb.defaultAnnualRate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kkb: { ...config.kkb, defaultAnnualRate: parseFloat(e.target.value) || 0 },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="kkbDp">DP Default (%)</Label>
              <Input
                id="kkbDp"
                type="number"
                step="1"
                min="0"
                max="100"
                value={config.kkb.defaultDpPercentage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kkb: { ...config.kkb, defaultDpPercentage: parseFloat(e.target.value) || 0 },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="kkbTenor">Tenor Default (tahun)</Label>
              <Input
                id="kkbTenor"
                type="number"
                step="1"
                min="1"
                max="10"
                value={config.kkb.defaultTenorYears}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kkb: { ...config.kkb, defaultTenorYears: parseInt(e.target.value, 10) || 1 },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="kkbAdmin">Biaya Admin (Rp)</Label>
              <Input
                id="kkbAdmin"
                type="number"
                step="10000"
                min="0"
                value={config.kkb.adminFee}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kkb: { ...config.kkb, adminFee: parseInt(e.target.value, 10) || 0 },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="kkbProvision">Provisi Default (%)</Label>
              <Input
                id="kkbProvision"
                type="number"
                step="0.01"
                min="0"
                value={config.kkb.provisionRate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kkb: { ...config.kkb, provisionRate: parseFloat(e.target.value) || 0 },
                  })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asuransi Mobil */}
      <Card>
        <CardHeader>
          <CardTitle>Tarif Default BCA Insurance - Mobil (Auto Cillin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="allRiskRate">Rate All Risk Default (%)</Label>
              <Input
                id="allRiskRate"
                type="number"
                step="0.01"
                min="0"
                value={config.insurance.mobil.defaultAllRiskRate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      mobil: {
                        ...config.insurance.mobil,
                        defaultAllRiskRate: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tloRate">Rate TLO Default (%)</Label>
              <Input
                id="tloRate"
                type="number"
                step="0.01"
                min="0"
                value={config.insurance.mobil.defaultTloRate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      mobil: {
                        ...config.insurance.mobil,
                        defaultTloRate: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mobilAdmin">Biaya Admin (Rp)</Label>
              <Input
                id="mobilAdmin"
                type="number"
                step="1000"
                min="0"
                value={config.insurance.mobil.adminFee}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      mobil: {
                        ...config.insurance.mobil,
                        adminFee: parseInt(e.target.value, 10) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mobilPolicy">Biaya Polis (Rp)</Label>
              <Input
                id="mobilPolicy"
                type="number"
                step="1000"
                min="0"
                value={config.insurance.mobil.policyFee}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      mobil: {
                        ...config.insurance.mobil,
                        policyFee: parseInt(e.target.value, 10) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asuransi Jiwa */}
      <Card>
        <CardHeader>
          <CardTitle>Tarif Default BCA Life - Jiwa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="jiwaMaleRate">Rate Pria (per 1.000 UP)</Label>
              <Input
                id="jiwaMaleRate"
                type="number"
                step="0.01"
                min="0"
                value={config.insurance.jiwa.defaultRatePerThousandMale}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      jiwa: {
                        ...config.insurance.jiwa,
                        defaultRatePerThousandMale: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="jiwaFemaleRate">Rate Wanita (per 1.000 UP)</Label>
              <Input
                id="jiwaFemaleRate"
                type="number"
                step="0.01"
                min="0"
                value={config.insurance.jiwa.defaultRatePerThousandFemale}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      jiwa: {
                        ...config.insurance.jiwa,
                        defaultRatePerThousandFemale: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="jiwaTerm">Masa Bayar Default (tahun)</Label>
              <Input
                id="jiwaTerm"
                type="number"
                step="1"
                min="1"
                max="30"
                value={config.insurance.jiwa.defaultPaymentTermYears}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    insurance: {
                      ...config.insurance,
                      jiwa: {
                        ...config.insurance.jiwa,
                        defaultPaymentTermYears: parseInt(e.target.value, 10) || 1,
                      },
                    },
                  })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asuransi Kesehatan Tabel Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Tabel Estimasi Premi BCA Life - Kesehatan (/tahun)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Kelompok Usia</th>
                  <th className="py-2 pr-4">Plafon 100 Jt</th>
                  <th className="py-2 pr-4">Plafon 500 Jt</th>
                  <th className="py-2">Plafon 1 Miliar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.insurance.kesehatan.rates.map((tier, idx) => (
                  <tr key={tier.ageGroup}>
                    <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200">
                      {tier.ageGroup}
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        step="100000"
                        value={tier.plan100Jt}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const newRates = [...config.insurance.kesehatan.rates];
                          newRates[idx] = { ...newRates[idx], plan100Jt: val };
                          setConfig({
                            ...config,
                            insurance: {
                              ...config.insurance,
                              kesehatan: { rates: newRates },
                            },
                          });
                        }}
                      />
                      <span className="text-[11px] text-slate-400">
                        {formatCurrency(tier.plan100Jt)}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        step="100000"
                        value={tier.plan500Jt}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const newRates = [...config.insurance.kesehatan.rates];
                          newRates[idx] = { ...newRates[idx], plan500Jt: val };
                          setConfig({
                            ...config,
                            insurance: {
                              ...config.insurance,
                              kesehatan: { rates: newRates },
                            },
                          });
                        }}
                      />
                      <span className="text-[11px] text-slate-400">
                        {formatCurrency(tier.plan500Jt)}
                      </span>
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        step="100000"
                        value={tier.plan1M}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const newRates = [...config.insurance.kesehatan.rates];
                          newRates[idx] = { ...newRates[idx], plan1M: val };
                          setConfig({
                            ...config,
                            insurance: {
                              ...config.insurance,
                              kesehatan: { rates: newRates },
                            },
                          });
                        }}
                      />
                      <span className="text-[11px] text-slate-400">
                        {formatCurrency(tier.plan1M)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan Tarif"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
          Reset ke Default
        </Button>
      </div>
    </form>
  );
}
