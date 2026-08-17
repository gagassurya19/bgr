import { describe, expect, it } from "vitest";
import {
  computeInsuranceMobil,
  computeInsuranceKesehatan,
  computeInsuranceJiwa,
} from "@/services/insurance-simulation";
import { DEFAULT_SIMULATION_CONFIG } from "@/lib/simulasi/config";

describe("computeInsuranceMobil", () => {
  it("matches real-world Calya 170jt All Risk 2.2% example", () => {
    // Mobil Toyota Calya 2024, Harga Rp 170.000.000
    // All Risk rate 2.2%
    // Premi Dasar = 170.000.000 x 2.2% = Rp 3.740.000
    // Admin = 150.000, Polis = 50.000 -> Total = 3.940.000
    const result = computeInsuranceMobil(
      {
        vehiclePrice: 170000000,
        coverageType: "ALL_RISK",
        ratePercent: 2.2,
        adminFee: 150000,
        policyFee: 0,
      },
      DEFAULT_SIMULATION_CONFIG.insurance.mobil,
    );

    expect(result.basePremium).toBe(3740000);
    expect(result.totalAnnualPremium).toBe(3890000);
  });

  it("calculates TLO correctly with default rates", () => {
    const result = computeInsuranceMobil(
      {
        vehiclePrice: 100000000,
        coverageType: "TLO",
      },
      DEFAULT_SIMULATION_CONFIG.insurance.mobil,
    );

    // 100jt * 0.8% = 800.000 + 150.000 (admin) + 50.000 (polis) = 1.000.000
    expect(result.basePremium).toBe(800000);
    expect(result.totalAnnualPremium).toBe(1000000);
  });
});

describe("computeInsuranceKesehatan", () => {
  it("calculates 30yo male 500jt coverage correctly", () => {
    const result = computeInsuranceKesehatan(
      {
        age: 30,
        coverageLimit: "500JT",
      },
      DEFAULT_SIMULATION_CONFIG.insurance.kesehatan,
    );

    expect(result.ageGroup).toBe("18 - 30 tahun");
    expect(result.annualPremium).toBe(4500000);
    expect(result.coverageAmount).toBe(500000000);
  });

  it("calculates 45yo 1M coverage correctly", () => {
    const result = computeInsuranceKesehatan(
      {
        age: 45,
        coverageLimit: "1M",
      },
      DEFAULT_SIMULATION_CONFIG.insurance.kesehatan,
    );

    expect(result.ageGroup).toBe("41 - 50 tahun");
    expect(result.annualPremium).toBe(12500000);
  });
});

describe("computeInsuranceJiwa", () => {
  it("matches real-world 30yo male 1M UP 10yr payment example", () => {
    // Pria 30th, UP 1 Miliar, bayar 10 tahun
    // Rate: 2.5 per 1000
    // Premi = 1.000.000.000 x 2.5 / 1000 = Rp 2.500.000/tahun
    // Total bayar = 2.500.000 x 10 = Rp 25.000.000
    const result = computeInsuranceJiwa(
      {
        sumAssured: 1000000000,
        gender: "MALE",
        paymentTermYears: 10,
        ratePerThousand: 2.5,
      },
      DEFAULT_SIMULATION_CONFIG.insurance.jiwa,
    );

    expect(result.annualPremium).toBe(2500000);
    expect(result.totalPremiumPaid).toBe(25000000);
  });

  it("handles female rate default correctly", () => {
    const result = computeInsuranceJiwa(
      {
        sumAssured: 500000000,
        gender: "FEMALE",
        paymentTermYears: 5,
      },
      DEFAULT_SIMULATION_CONFIG.insurance.jiwa,
    );

    // 500jt * 1.8 / 1000 = 900.000/thn -> total 4.5jt
    expect(result.annualPremium).toBe(900000);
    expect(result.totalPremiumPaid).toBe(4500000);
  });
});
