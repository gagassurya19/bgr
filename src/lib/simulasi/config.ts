export type SimulationConfig = {
  kkb: {
    defaultAnnualRate: number; // e.g. 4.5
    defaultTenorYears: number; // e.g. 5
    defaultDpPercentage: number; // e.g. 20
    adminFee: number; // e.g. 1500000
    provisionRate: number; // e.g. 0.5 (%)
  };
  insurance: {
    mobil: {
      defaultAllRiskRate: number; // e.g. 2.2 (%)
      defaultTloRate: number; // e.g. 0.8 (%)
      adminFee: number; // e.g. 150000
      policyFee: number; // e.g. 50000
    };
    kesehatan: {
      rates: Array<{
        ageGroup: string;
        minAge: number;
        maxAge: number;
        plan100Jt: number; // annual premium in IDR
        plan500Jt: number;
        plan1M: number;
      }>;
    };
    jiwa: {
      defaultRatePerThousandMale: number; // e.g. 2.5
      defaultRatePerThousandFemale: number; // e.g. 1.8
      defaultPaymentTermYears: number; // e.g. 10
    };
  };
};

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  kkb: {
    defaultAnnualRate: 4.5,
    defaultTenorYears: 5,
    defaultDpPercentage: 20,
    adminFee: 1500000,
    provisionRate: 0.5,
  },
  insurance: {
    mobil: {
      defaultAllRiskRate: 2.2,
      defaultTloRate: 0.8,
      adminFee: 150000,
      policyFee: 50000,
    },
    kesehatan: {
      rates: [
        { ageGroup: "18 - 30 tahun", minAge: 18, maxAge: 30, plan100Jt: 2500000, plan500Jt: 4500000, plan1M: 7500000 },
        { ageGroup: "31 - 40 tahun", minAge: 31, maxAge: 40, plan100Jt: 3200000, plan500Jt: 5500000, plan1M: 9000000 },
        { ageGroup: "41 - 50 tahun", minAge: 41, maxAge: 50, plan100Jt: 4500000, plan500Jt: 7500000, plan1M: 12500000 },
        { ageGroup: "51 - 60 tahun", minAge: 51, maxAge: 60, plan100Jt: 6500000, plan500Jt: 11000000, plan1M: 18000000 },
      ],
    },
    jiwa: {
      defaultRatePerThousandMale: 2.5,
      defaultRatePerThousandFemale: 1.8,
      defaultPaymentTermYears: 10,
    },
  },
};

export const SIMULATION_CONFIG_KEY = "SIMULATION_CONFIG";
