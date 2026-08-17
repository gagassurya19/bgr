"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
} from "@/components/ui";
import { computeKkbSimulation, type KkbResult } from "@/services/kkb-simulation";
import type { SimulationConfig } from "@/lib/simulasi/config";
import { formatCurrency } from "@/lib/utils";
import {
  Calculator,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";

const VEHICLE_PRESETS = [
  { name: "Honda Brio RS CVT", type: "Mobil", price: 243400000, dpPercent: 20 },
  { name: "Toyota Avanza 1.5 G", type: "Mobil", price: 276700000, dpPercent: 20 },
  { name: "Honda HR-V 1.5 SE", type: "Mobil", price: 416100000, dpPercent: 25 },
  { name: "Toyota Innova Zenix", type: "Mobil", price: 425600000, dpPercent: 25 },
  { name: "Honda Vario 160", type: "Motor", price: 27350000, dpPercent: 15 },
  { name: "Yamaha NMAX 155", type: "Motor", price: 32175000, dpPercent: 15 },
];

export function KkbSimulator({ config }: { config: SimulationConfig["kkb"] }) {
  const [otrPrice, setOtrPrice] = useState<number>(243400000);
  const [dpType, setDpType] = useState<"nominal" | "percent">("nominal");
  const [dpNominal, setDpNominal] = useState<number>(50000000);
  const [dpPercent, setDpPercent] = useState<number>(config.defaultDpPercentage || 20);
  const [annualRate, setAnnualRate] = useState<number>(config.defaultAnnualRate || 4.5);
  const [tenorYears, setTenorYears] = useState<number>(config.defaultTenorYears || 5);
  const [adminFee, setAdminFee] = useState<number>(config.adminFee || 1500000);
  const [provisionRate, setProvisionRate] = useState<number>(config.provisionRate || 0.5);

  const effectiveDp = useMemo(() => {
    if (dpType === "percent") {
      return Math.round((otrPrice * dpPercent) / 100);
    }
    return dpNominal;
  }, [dpType, otrPrice, dpPercent, dpNominal]);

  const result: KkbResult = useMemo(() => {
    return computeKkbSimulation({
      otrPrice,
      downPayment: effectiveDp,
      annualRate,
      tenorYears,
      adminFee,
      provisionRate,
    });
  }, [otrPrice, effectiveDp, annualRate, tenorYears, adminFee, provisionRate]);

  function handlePreset(preset: (typeof VEHICLE_PRESETS)[0]) {
    setOtrPrice(preset.price);
    setDpType("nominal");
    setDpNominal(Math.round((preset.price * preset.dpPercent) / 100));
    setDpPercent(preset.dpPercent);
  }

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-[#0066AE] dark:text-[#63ACF2]" />
          Contoh Cepat:
        </span>
        {VEHICLE_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handlePreset(p)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#0066AE] hover:bg-blue-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-200 dark:hover:bg-[#1e3a5f]/40"
          >
            {p.name} ({formatCurrency(p.price)})
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Inputs */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Calculator className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
                Parameter Kredit KKB
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OTR Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="otr">Harga OTR Kendaraan (Rp)</Label>
                  <span className="text-xs font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                    {formatCurrency(otrPrice)}
                  </span>
                </div>
                <Input
                  id="otr"
                  type="number"
                  step="1000000"
                  min="10000000"
                  value={otrPrice || ""}
                  onChange={(e) => setOtrPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="Contoh: 243400000"
                />
              </div>

              {/* DP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Uang Muka (Down Payment)</Label>
                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]">
                    <button
                      type="button"
                      onClick={() => setDpType("nominal")}
                      className={`rounded px-2 py-0.5 font-medium transition ${
                        dpType === "nominal"
                          ? "bg-white text-[#0066AE] shadow-sm dark:bg-[#111d33] dark:text-[#63ACF2]"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Nominal (Rp)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpType("percent")}
                      className={`rounded px-2 py-0.5 font-medium transition ${
                        dpType === "percent"
                          ? "bg-white text-[#0066AE] shadow-sm dark:bg-[#111d33] dark:text-[#63ACF2]"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Persen (%)
                    </button>
                  </div>
                </div>

                {dpType === "nominal" ? (
                  <div className="space-y-1">
                    <Input
                      id="dpNominal"
                      type="number"
                      step="1000000"
                      min="0"
                      max={otrPrice}
                      value={dpNominal || ""}
                      onChange={(e) =>
                        setDpNominal(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      placeholder="Contoh: 50000000"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Setara {result.dpPercentage.toFixed(1)}% dari harga OTR
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Input
                        id="dpPercent"
                        type="number"
                        step="1"
                        min="5"
                        max="90"
                        value={dpPercent || ""}
                        onChange={(e) =>
                          setDpPercent(Math.max(0, parseFloat(e.target.value) || 0))
                        }
                      />
                      <span className="text-sm font-semibold text-slate-600">%</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Setara {formatCurrency(effectiveDp)}
                    </p>
                  </div>
                )}
              </div>

              {/* Tenor */}
              <div className="space-y-1">
                <Label>Pilihan Tenor (Tahun)</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setTenorYears(year)}
                      className={`rounded-lg border py-2 text-center text-sm font-semibold transition ${
                        tenorYears === year
                          ? "border-[#0066AE] bg-[#0066AE] text-white shadow-sm dark:border-[#63ACF2] dark:bg-[#0066AE]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
                      }`}
                    >
                      {year} Thn
                      <span className="block text-[10px] font-normal opacity-80">
                        {year * 12} bln
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="rate">Suku Bunga Flat (%/tahun)</Label>
                  <span className="text-xs text-slate-500">Umumnya 3.5% - 6.0%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={annualRate || ""}
                    onChange={(e) =>
                      setAnnualRate(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                  />
                  <span className="text-sm font-semibold text-slate-600">%</span>
                </div>
              </div>

              {/* Accordion Extra Fees */}
              <details className="rounded-lg border border-slate-200 p-3 text-xs dark:border-[#1e3a5f]/60">
                <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  Biaya Tambahan di Awal (Opsional)
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="adminFee" className="text-xs">
                      Biaya Administrasi (Rp)
                    </Label>
                    <Input
                      id="adminFee"
                      type="number"
                      step="50000"
                      min="0"
                      value={adminFee || ""}
                      onChange={(e) =>
                        setAdminFee(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="provisionRate" className="text-xs">
                      Provisi (% dari pokok kredit)
                    </Label>
                    <Input
                      id="provisionRate"
                      type="number"
                      step="0.1"
                      min="0"
                      value={provisionRate || ""}
                      onChange={(e) =>
                        setProvisionRate(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                    />
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>

        {/* Results & Breakdown */}
        <div className="space-y-6 lg:col-span-7">
          {/* Main Result Card */}
          <Card className="border-[#0066AE]/30 bg-gradient-to-br from-[#0066AE]/5 via-white to-blue-50/50 shadow-md dark:border-[#1e3a5f] dark:from-[#0f1a2e] dark:via-[#111d33] dark:to-[#0f1a2e]">
            <CardHeader className="border-b border-slate-100 pb-3 dark:border-[#1e3a5f]/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0066AE] dark:text-[#63ACF2]">
                    Estimasi Cicilan Bulanan
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tenor {result.tenorYears} Tahun ({result.tenorMonths} Bulan) · Bunga Flat {result.annualRate}%/thn
                  </p>
                </div>
                <Badge variant="info">Bunga Flat</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {formatCurrency(result.monthlyInstallment)}
                </span>
                <span className="text-sm font-medium text-slate-500">/ bulan</span>
              </div>

              <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3 dark:bg-[#0a1220]">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pokok Pinjaman</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(result.principalLoan)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total Bunga ({result.tenorYears} thn)
                  </p>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Pengembalian</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(result.totalRepayment)}
                  </p>
                </div>
              </div>

              {/* Total Pembayaran Pertama */}
              <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/60">
                <span className="text-slate-600 dark:text-slate-300">
                  Estimasi Total Bayar Pertama (DP + Angsuran 1 + Admin + Provisi):
                </span>
                <span className="font-bold text-[#0066AE] dark:text-[#63ACF2]">
                  {formatCurrency(result.firstTotalPayment)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tenor Comparison Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-[#0066AE] dark:text-[#63ACF2]" />
                Perbandingan Cicilan Semua Tenor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 dark:border-[#1e3a5f]/60">
                    <tr>
                      <th className="py-2.5 pr-3">Tenor</th>
                      <th className="py-2.5 pr-3">Cicilan/Bulan</th>
                      <th className="py-2.5 pr-3">Total Bunga</th>
                      <th className="py-2.5 text-right">Total Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/40">
                    {result.comparisons.map((c) => {
                      const isSelected = c.tenorYears === result.tenorYears;
                      return (
                        <tr
                          key={c.tenorYears}
                          className={`transition ${
                            isSelected
                              ? "bg-blue-50/80 font-semibold text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]"
                              : "hover:bg-slate-50 dark:hover:bg-[#1e3a5f]/20"
                          }`}
                        >
                          <td className="py-3 pr-3">
                            <span className="inline-flex items-center gap-1.5">
                              {c.tenorYears} Tahun
                              {isSelected && (
                                <span className="rounded bg-[#0066AE] px-1.5 py-0.5 text-[9px] font-bold text-white dark:bg-[#63ACF2] dark:text-slate-900">
                                  Pilihan
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 pr-3 font-bold">
                            {formatCurrency(c.monthlyInstallment)}
                          </td>
                          <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                            {formatCurrency(c.totalInterest)}
                          </td>
                          <td className="py-3 text-right text-slate-600 dark:text-slate-300">
                            {formatCurrency(c.totalRepayment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-blue-100 bg-blue-50/50 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/40">
            <CardContent className="space-y-2 p-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                <Info className="h-4 w-4" />
                Tips Memilih Simulasi KKB:
              </div>
              <ul className="list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Cicilan lebih ringan:</strong> Pilih DP lebih besar + tenor panjang (4–5 tahun).
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Total bunga lebih kecil:</strong> Pilih DP besar + tenor pendek (1–3 tahun).
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Bebas utang lebih cepat:</strong> Pilih tenor 2–3 tahun untuk menghemat biaya bunga hingga 40%.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
