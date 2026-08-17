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
import type { SimulationConfig } from "@/lib/simulasi/config";
import {
  computeInsuranceMobil,
  computeInsuranceKesehatan,
  computeInsuranceJiwa,
} from "@/services/insurance-simulation";
import { formatCurrency } from "@/lib/utils";
import {
  Car,
  HeartPulse,
  Shield,
  Sparkles,
} from "lucide-react";

type InsuranceCategory = "MOBIL" | "KESEHATAN" | "JIWA";

const MOBIL_PRESETS = [
  { name: "Toyota Calya 2024", price: 170000000, type: "ALL_RISK" as const },
  { name: "Toyota Avanza 2024", price: 250000000, type: "ALL_RISK" as const },
  { name: "Honda HR-V 2024", price: 415000000, type: "ALL_RISK" as const },
  { name: "Toyota Alphard", price: 1200000000, type: "TLO" as const },
];

export function InsuranceSimulator({ config }: { config: SimulationConfig["insurance"] }) {
  const [activeTab, setActiveTab] = useState<InsuranceCategory>("MOBIL");

  // 1. Mobil State
  const [vehiclePrice, setVehiclePrice] = useState<number>(170000000);
  const [coverageType, setCoverageType] = useState<"ALL_RISK" | "TLO">("ALL_RISK");
  const [mobilRate, setMobilRate] = useState<number>(config.mobil.defaultAllRiskRate || 2.2);

  // 2. Kesehatan State
  const [kesehatanAge, setKesehatanAge] = useState<number>(30);
  const [kesehatanLimit, setKesehatanLimit] = useState<"100JT" | "500JT" | "1M">("500JT");

  // 3. Jiwa State
  const [jiwaSumAssured, setJiwaSumAssured] = useState<number>(1000000000);
  const [jiwaGender, setJiwaGender] = useState<"MALE" | "FEMALE">("MALE");
  const [jiwaTerm, setJiwaTerm] = useState<number>(config.jiwa.defaultPaymentTermYears || 10);
  const [jiwaRate, setJiwaRate] = useState<number>(config.jiwa.defaultRatePerThousandMale || 2.5);

  // Mobil calculation
  const mobilResult = useMemo(() => {
    return computeInsuranceMobil(
      {
        vehiclePrice,
        coverageType,
        ratePercent: mobilRate,
        adminFee: config.mobil.adminFee,
        policyFee: config.mobil.policyFee,
      },
      config.mobil,
    );
  }, [vehiclePrice, coverageType, mobilRate, config.mobil]);

  // Kesehatan calculation
  const kesehatanResult = useMemo(() => {
    return computeInsuranceKesehatan(
      {
        age: kesehatanAge,
        coverageLimit: kesehatanLimit,
      },
      config.kesehatan,
    );
  }, [kesehatanAge, kesehatanLimit, config.kesehatan]);

  // Jiwa calculation
  const jiwaResult = useMemo(() => {
    return computeInsuranceJiwa(
      {
        sumAssured: jiwaSumAssured,
        gender: jiwaGender,
        paymentTermYears: jiwaTerm,
        ratePerThousand: jiwaRate,
      },
      config.jiwa,
    );
  }, [jiwaSumAssured, jiwaGender, jiwaTerm, jiwaRate, config.jiwa]);

  function handleCoverageChange(type: "ALL_RISK" | "TLO") {
    setCoverageType(type);
    setMobilRate(type === "ALL_RISK" ? config.mobil.defaultAllRiskRate : config.mobil.defaultTloRate);
  }

  function handleGenderChange(gender: "MALE" | "FEMALE") {
    setJiwaGender(gender);
    setJiwaRate(
      gender === "MALE"
        ? config.jiwa.defaultRatePerThousandMale
        : config.jiwa.defaultRatePerThousandFemale,
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-[#1e3a5f]/60 dark:bg-[#111d33]">
        <button
          type="button"
          onClick={() => setActiveTab("MOBIL")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "MOBIL"
              ? "bg-[#0066AE] text-white shadow dark:bg-[#0066AE]"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Asuransi Mobil</span>
          <span className="hidden text-xs font-normal opacity-80 sm:inline">(Auto Cillin)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("KESEHATAN")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "KESEHATAN"
              ? "bg-[#0066AE] text-white shadow dark:bg-[#0066AE]"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
          }`}
        >
          <HeartPulse className="h-4 w-4" />
          <span>Asuransi Kesehatan</span>
          <span className="hidden text-xs font-normal opacity-80 sm:inline">(BCA Life)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("JIWA")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "JIWA"
              ? "bg-[#0066AE] text-white shadow dark:bg-[#0066AE]"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Asuransi Jiwa</span>
          <span className="hidden text-xs font-normal opacity-80 sm:inline">(BCA Life)</span>
        </button>
      </div>

      {/* 1. ASURANSI MOBIL CONTENT */}
      {activeTab === "MOBIL" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-[#0066AE] dark:text-[#63ACF2]" />
              Contoh Mobil:
            </span>
            {MOBIL_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setVehiclePrice(p.price);
                  handleCoverageChange(p.type);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#0066AE] hover:bg-blue-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-200"
              >
                {p.name} ({formatCurrency(p.price)})
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Form */}
            <div className="space-y-6 lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Parameter Asuransi Mobil (Auto Cillin)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="vehPrice">Harga Pertanggungan / Mobil (Rp)</Label>
                      <span className="text-xs font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                        {formatCurrency(vehiclePrice)}
                      </span>
                    </div>
                    <Input
                      id="vehPrice"
                      type="number"
                      step="1000000"
                      min="10000000"
                      value={vehiclePrice || ""}
                      onChange={(e) =>
                        setVehiclePrice(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      placeholder="Contoh: 170000000"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Jenis Pertanggungan</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCoverageChange("ALL_RISK")}
                        className={`rounded-xl border p-3 text-left transition ${
                          coverageType === "ALL_RISK"
                            ? "border-[#0066AE] bg-blue-50/80 dark:border-[#63ACF2] dark:bg-[#0066AE]/20"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          All Risk
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Cover semua kerusakan & kehilangan (1.8% - 3.5%)
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCoverageChange("TLO")}
                        className={`rounded-xl border p-3 text-left transition ${
                          coverageType === "TLO"
                            ? "border-[#0066AE] bg-blue-50/80 dark:border-[#63ACF2] dark:bg-[#0066AE]/20"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          TLO
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Total Loss Only: hilang / rusak &gt;75% (0.6% - 1.2%)
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="mRate">Rate Premi (%)</Label>
                      <span className="text-xs text-slate-400">Default: {mobilResult.ratePercent}%</span>
                    </div>
                    <Input
                      id="mRate"
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="10"
                      value={mobilRate || ""}
                      onChange={(e) =>
                        setMobilRate(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6 lg:col-span-7">
              <Card className="border-[#0066AE]/30 bg-gradient-to-br from-[#0066AE]/5 via-white to-blue-50/50 shadow-md dark:border-[#1e3a5f] dark:from-[#0f1a2e] dark:via-[#111d33] dark:to-[#0f1a2e]">
                <CardHeader className="border-b border-slate-100 pb-3 dark:border-[#1e3a5f]/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0066AE] dark:text-[#63ACF2]">
                        Estimasi Premi Asuransi Mobil
                      </p>
                      <p className="text-xs text-slate-500">
                        {coverageType === "ALL_RISK" ? "All Risk (Komprehensif)" : "Total Loss Only (TLO)"} · Rate {mobilResult.ratePercent}%
                      </p>
                    </div>
                    <Badge variant="info">Auto Cillin</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                      {formatCurrency(mobilResult.totalAnnualPremium)}
                    </span>
                    <span className="text-sm font-medium text-slate-500">/ tahun</span>
                  </div>

                  <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3 dark:bg-[#0a1220]">
                    <div>
                      <p className="text-[11px] text-slate-500">Premi Dasar ({mobilResult.ratePercent}%)</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(mobilResult.basePremium)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Biaya Admin</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(mobilResult.adminFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Biaya Polis</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(mobilResult.policyFee)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/60 dark:text-slate-300">
                    💡 <strong>Catatan:</strong> Premi resmi dapat berbeda tergantung wilayah operasional kendaraan, usia mobil di atas 5 tahun, dan riwayat klaim.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASURANSI KESEHATAN CONTENT */}
      {activeTab === "KESEHATAN" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Parameter Asuransi Kesehatan (BCA Life)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="kAge">Usia Tertanggung (Tahun)</Label>
                    <span className="text-xs font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                      {kesehatanAge} Tahun ({kesehatanResult.ageGroup})
                    </span>
                  </div>
                  <Input
                    id="kAge"
                    type="number"
                    min="1"
                    max="70"
                    value={kesehatanAge || ""}
                    onChange={(e) =>
                      setKesehatanAge(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Plafon Pertanggungan Tahunan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["100JT", "500JT", "1M"] as const).map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => setKesehatanLimit(limit)}
                        className={`rounded-xl border py-3 text-center transition ${
                          kesehatanLimit === limit
                            ? "border-[#0066AE] bg-[#0066AE] text-white shadow dark:border-[#63ACF2]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-300"
                        }`}
                      >
                        <p className="text-sm font-bold">
                          {limit === "100JT" ? "100 Jt" : limit === "500JT" ? "500 Jt" : "1 Miliar"}
                        </p>
                        <p className="text-[10px] opacity-80">/ tahun</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-[#0066AE]/30 bg-gradient-to-br from-[#0066AE]/5 via-white to-blue-50/50 shadow-md dark:border-[#1e3a5f] dark:from-[#0f1a2e] dark:via-[#111d33] dark:to-[#0f1a2e]">
              <CardHeader className="border-b border-slate-100 pb-3 dark:border-[#1e3a5f]/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0066AE] dark:text-[#63ACF2]">
                      Estimasi Premi Kesehatan (BCA Life)
                    </p>
                    <p className="text-xs text-slate-500">
                      Kelompok {kesehatanResult.ageGroup} · Plafon {formatCurrency(kesehatanResult.coverageAmount)}/thn
                    </p>
                  </div>
                  <Badge variant="info">BCA Life</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                    {formatCurrency(kesehatanResult.annualPremium)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ tahun</span>
                </div>

                <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 dark:bg-[#0a1220]">
                  <div>
                    <p className="text-[11px] text-slate-500">Estimasi Opsi Bulanan</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ± {formatCurrency(kesehatanResult.monthlyPremium)} / bln
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Plafon Manfaat Tahunan</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(kesehatanResult.coverageAmount)}
                    </p>
                  </div>
                </div>

                {/* Table Comparison for all age groups */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tabel Estimasi Premi Berdasarkan Usia (Plafon {kesehatanLimit}):
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#1e3a5f]/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-[#0f1a2e]">
                        <tr>
                          <th className="p-2">Kelompok Usia</th>
                          <th className="p-2 text-right">Premi / Tahun</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/40">
                        {config.kesehatan.rates.map((tier) => {
                          const isCurrent = tier.ageGroup === kesehatanResult.ageGroup;
                          const amount =
                            kesehatanLimit === "100JT"
                              ? tier.plan100Jt
                              : kesehatanLimit === "500JT"
                              ? tier.plan500Jt
                              : tier.plan1M;
                          return (
                            <tr
                              key={tier.ageGroup}
                              className={isCurrent ? "bg-blue-50/80 font-bold text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]" : ""}
                            >
                              <td className="p-2">
                                {tier.ageGroup} {isCurrent && "(Pilihan Anda)"}
                              </td>
                              <td className="p-2 text-right">{formatCurrency(amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. ASURANSI JIWA CONTENT */}
      {activeTab === "JIWA" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Parameter Asuransi Jiwa (BCA Life)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="jUP">Uang Pertanggungan / Santunan (Rp)</Label>
                    <span className="text-xs font-semibold text-[#0066AE] dark:text-[#63ACF2]">
                      {formatCurrency(jiwaSumAssured)}
                    </span>
                  </div>
                  <Input
                    id="jUP"
                    type="number"
                    step="50000000"
                    min="100000000"
                    value={jiwaSumAssured || ""}
                    onChange={(e) =>
                      setJiwaSumAssured(Math.max(0, parseInt(e.target.value, 10) || 0))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Jenis Kelamin Tertanggung</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("MALE")}
                      className={`rounded-xl border p-2.5 text-center font-medium transition ${
                        jiwaGender === "MALE"
                          ? "border-[#0066AE] bg-[#0066AE] text-white shadow"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-300"
                      }`}
                    >
                      Pria (Rate {config.jiwa.defaultRatePerThousandMale}/1000)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("FEMALE")}
                      className={`rounded-xl border p-2.5 text-center font-medium transition ${
                        jiwaGender === "FEMALE"
                          ? "border-[#0066AE] bg-[#0066AE] text-white shadow"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-300"
                      }`}
                    >
                      Wanita (Rate {config.jiwa.defaultRatePerThousandFemale}/1000)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Masa Pembayaran Premi (Tahun)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20].map((years) => (
                      <button
                        key={years}
                        type="button"
                        onClick={() => setJiwaTerm(years)}
                        className={`rounded-xl border py-2.5 text-center text-sm font-bold transition ${
                          jiwaTerm === years
                            ? "border-[#0066AE] bg-[#0066AE] text-white shadow"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-300"
                        }`}
                      >
                        {years} Tahun
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="jRate">Rate per 1.000 UP</Label>
                  <Input
                    id="jRate"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={jiwaRate || ""}
                    onChange={(e) =>
                      setJiwaRate(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-[#0066AE]/30 bg-gradient-to-br from-[#0066AE]/5 via-white to-blue-50/50 shadow-md dark:border-[#1e3a5f] dark:from-[#0f1a2e] dark:via-[#111d33] dark:to-[#0f1a2e]">
              <CardHeader className="border-b border-slate-100 pb-3 dark:border-[#1e3a5f]/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0066AE] dark:text-[#63ACF2]">
                      Estimasi Premi Asuransi Jiwa
                    </p>
                    <p className="text-xs text-slate-500">
                      Uang Pertanggungan {formatCurrency(jiwaResult.sumAssured)} · Bayar {jiwaResult.paymentTermYears} Tahun
                    </p>
                  </div>
                  <Badge variant="info">BCA Life</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                    {formatCurrency(jiwaResult.annualPremium)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ tahun</span>
                </div>

                <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 dark:bg-[#0a1220]">
                  <div>
                    <p className="text-[11px] text-slate-500">Total Premi yang Dibayar ({jiwaResult.paymentTermYears} thn)</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(jiwaResult.totalPremiumPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Uang Pertanggungan (UP Santunan)</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(jiwaResult.sumAssured)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-[#1e3a5f]/60 dark:bg-[#0f1a2e]/60 dark:text-slate-300">
                  🛡️ <strong>Ilustrasi:</strong> Dengan membayar premi tahunan sebesar {formatCurrency(jiwaResult.annualPremium)} selama {jiwaResult.paymentTermYears} tahun (Total {formatCurrency(jiwaResult.totalPremiumPaid)}), keluarga Anda terlindungi dengan santunan tunai hingga {formatCurrency(jiwaResult.sumAssured)}.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
