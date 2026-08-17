import { describe, expect, it } from "vitest";
import { computeKkbSimulation } from "@/services/kkb-simulation";

describe("computeKkbSimulation", () => {
  it("matches real-world Honda Brio RS example exactly", () => {
    // Mobil Honda Brio RS CVT
    // OTR: 243.400.000
    // DP: 50.000.000
    // Tenor: 5 tahun (60 bulan)
    // Rate: 4.5% flat/tahun
    const result = computeKkbSimulation({
      otrPrice: 243400000,
      downPayment: 50000000,
      tenorYears: 5,
      annualRate: 4.5,
      adminFee: 0,
      provisionRate: 0,
    });

    expect(result.principalLoan).toBe(193400000);
    expect(result.totalInterest).toBe(43515000);
    expect(result.totalRepayment).toBe(236915000);
    // 236.915.000 / 60 = 3.948.583,33 -> round 3948583
    expect(result.monthlyInstallment).toBe(3948583);
    expect(result.tenorMonths).toBe(60);
  });

  it("calculates comparisons for 1 to 5 years correctly", () => {
    const result = computeKkbSimulation({
      otrPrice: 200000000,
      downPayment: 40000000,
      tenorYears: 3,
      annualRate: 5,
    });

    expect(result.comparisons).toHaveLength(5);
    const year1 = result.comparisons.find((c) => c.tenorYears === 1);
    const year5 = result.comparisons.find((c) => c.tenorYears === 5);

    expect(year1).toBeDefined();
    expect(year5).toBeDefined();

    // Year 1: Pokok 160jt, Interest 5% = 8jt, Total = 168jt, Installment = 168jt / 12 = 14jt
    expect(year1?.principalLoan).toBe(160000000);
    expect(year1?.totalInterest).toBe(8000000);
    expect(year1?.monthlyInstallment).toBe(14000000);

    // Year 5: Pokok 160jt, Interest 5% * 5 = 40jt, Total = 200jt, Installment = 200jt / 60 = 3.333.333
    expect(year5?.totalInterest).toBe(40000000);
    expect(year5?.monthlyInstallment).toBe(3333333);
  });

  it("handles boundary values gracefully (0 OTR, 0 DP)", () => {
    const result = computeKkbSimulation({
      otrPrice: 0,
      downPayment: 0,
      tenorYears: 1,
      annualRate: 4.5,
    });

    expect(result.principalLoan).toBe(0);
    expect(result.monthlyInstallment).toBe(0);
  });
});
