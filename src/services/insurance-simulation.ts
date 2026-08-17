import type { SimulationConfig } from "@/lib/simulasi/config";

// 1. Asuransi Mobil
export type InsuranceMobilInput = {
  vehiclePrice: number;
  coverageType: "ALL_RISK" | "TLO";
  ratePercent?: number; // custom rate
  adminFee?: number;
  policyFee?: number;
};

export type InsuranceMobilResult = {
  vehiclePrice: number;
  coverageType: "ALL_RISK" | "TLO";
  ratePercent: number;
  basePremium: number;
  adminFee: number;
  policyFee: number;
  totalAnnualPremium: number;
  monthlyEstimate: number; // typically annual, but helpful context
};

export function computeInsuranceMobil(
  input: InsuranceMobilInput,
  defaults: SimulationConfig["insurance"]["mobil"],
): InsuranceMobilResult {
  const vehiclePrice = Math.max(0, input.vehiclePrice || 0);
  const isAllRisk = input.coverageType === "ALL_RISK";
  const ratePercent =
    input.ratePercent ??
    (isAllRisk ? defaults.defaultAllRiskRate : defaults.defaultTloRate);

  const basePremium = Math.round(vehiclePrice * (ratePercent / 100));
  const adminFee = input.adminFee ?? defaults.adminFee;
  const policyFee = input.policyFee ?? defaults.policyFee;
  const totalAnnualPremium = basePremium + adminFee + policyFee;
  const monthlyEstimate = Math.round(totalAnnualPremium / 12);

  return {
    vehiclePrice,
    coverageType: input.coverageType,
    ratePercent,
    basePremium,
    adminFee,
    policyFee,
    totalAnnualPremium,
    monthlyEstimate,
  };
}

// 2. Asuransi Kesehatan
export type InsuranceKesehatanInput = {
  age: number;
  coverageLimit: "100JT" | "500JT" | "1M";
};

export type InsuranceKesehatanResult = {
  age: number;
  ageGroup: string;
  coverageLimit: "100JT" | "500JT" | "1M";
  coverageAmount: number;
  annualPremium: number;
  monthlyPremium: number;
};

export function computeInsuranceKesehatan(
  input: InsuranceKesehatanInput,
  config: SimulationConfig["insurance"]["kesehatan"],
): InsuranceKesehatanResult {
  const age = Math.max(1, Math.min(100, input.age || 30));

  const tier =
    config.rates.find((r) => age >= r.minAge && age <= r.maxAge) ||
    config.rates[config.rates.length - 1];

  let coverageAmount = 500000000;
  let annualPremium = tier.plan500Jt;

  if (input.coverageLimit === "100JT") {
    coverageAmount = 100000000;
    annualPremium = tier.plan100Jt;
  } else if (input.coverageLimit === "1M") {
    coverageAmount = 1000000000;
    annualPremium = tier.plan1M;
  }

  const monthlyPremium = Math.round((annualPremium * 1.05) / 12); // ~5% modal factor for monthly

  return {
    age,
    ageGroup: tier.ageGroup,
    coverageLimit: input.coverageLimit,
    coverageAmount,
    annualPremium,
    monthlyPremium,
  };
}

// 3. Asuransi Jiwa
export type InsuranceJiwaInput = {
  sumAssured: number; // Uang Pertanggungan, e.g. 1.000.000.000
  gender: "MALE" | "FEMALE";
  paymentTermYears: number; // e.g. 5, 10, 20
  ratePerThousand?: number;
};

export type InsuranceJiwaResult = {
  sumAssured: number;
  gender: "MALE" | "FEMALE";
  ratePerThousand: number;
  paymentTermYears: number;
  annualPremium: number;
  totalPremiumPaid: number;
  monthlyPremium: number;
};

export function computeInsuranceJiwa(
  input: InsuranceJiwaInput,
  defaults: SimulationConfig["insurance"]["jiwa"],
): InsuranceJiwaResult {
  const sumAssured = Math.max(0, input.sumAssured || 0);
  const isMale = input.gender === "MALE";
  const ratePerThousand =
    input.ratePerThousand ??
    (isMale
      ? defaults.defaultRatePerThousandMale
      : defaults.defaultRatePerThousandFemale);

  const paymentTermYears = Math.max(1, input.paymentTermYears || defaults.defaultPaymentTermYears);

  // Rumus Premi = Uang Pertanggungan x Rate / 1000
  const annualPremium = Math.round((sumAssured * ratePerThousand) / 1000);
  const totalPremiumPaid = annualPremium * paymentTermYears;
  const monthlyPremium = Math.round((annualPremium * 1.05) / 12);

  return {
    sumAssured,
    gender: input.gender,
    ratePerThousand,
    paymentTermYears,
    annualPremium,
    totalPremiumPaid,
    monthlyPremium,
  };
}
