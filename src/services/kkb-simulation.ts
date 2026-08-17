export type KkbInput = {
  otrPrice: number;
  downPayment: number;
  annualRate: number; // in percent, e.g. 4.5
  tenorYears: number; // e.g. 1, 2, 3, 4, 5
  adminFee?: number;
  provisionRate?: number; // in percent, e.g. 0.5
};

export type KkbTenorComparison = {
  tenorYears: number;
  tenorMonths: number;
  principalLoan: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyInstallment: number;
  dpPercentage: number;
};

export type KkbResult = {
  otrPrice: number;
  downPayment: number;
  dpPercentage: number;
  principalLoan: number;
  annualRate: number;
  tenorYears: number;
  tenorMonths: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyInstallment: number;
  adminFee: number;
  provisionFee: number;
  firstTotalPayment: number; // TDP = DP + Angsuran Pertama (ADDB) + Admin + Provisi
  comparisons: KkbTenorComparison[];
};

export function computeKkbSimulation(input: KkbInput): KkbResult {
  const otrPrice = Math.max(0, input.otrPrice || 0);
  const downPayment = Math.max(0, Math.min(input.downPayment || 0, otrPrice));
  const principalLoan = Math.max(0, otrPrice - downPayment);
  const annualRate = Math.max(0, input.annualRate || 0);
  const tenorYears = Math.max(1, Math.round(input.tenorYears || 1));
  const tenorMonths = tenorYears * 12;

  const dpPercentage = otrPrice > 0 ? (downPayment / otrPrice) * 100 : 0;

  // Total Bunga = Pokok Kredit x (Rate / 100) x Tenor
  const totalInterest = Math.round(principalLoan * (annualRate / 100) * tenorYears);
  const totalRepayment = principalLoan + totalInterest;
  const monthlyInstallment = tenorMonths > 0 ? Math.round(totalRepayment / tenorMonths) : 0;

  const adminFee = input.adminFee ?? 0;
  const provisionRate = input.provisionRate ?? 0;
  const provisionFee = Math.round(principalLoan * (provisionRate / 100));

  // TDP (Total Down Payment / Pembayaran Pertama): DP + Angsuran Bulan 1 + Admin + Provisi
  const firstTotalPayment = downPayment + monthlyInstallment + adminFee + provisionFee;

  // Comparison for 1, 2, 3, 4, 5 years
  const tenorOptions = [1, 2, 3, 4, 5];
  const comparisons: KkbTenorComparison[] = tenorOptions.map((years) => {
    const months = years * 12;
    const interest = Math.round(principalLoan * (annualRate / 100) * years);
    const repayment = principalLoan + interest;
    const installment = months > 0 ? Math.round(repayment / months) : 0;
    return {
      tenorYears: years,
      tenorMonths: months,
      principalLoan,
      totalInterest: interest,
      totalRepayment: repayment,
      monthlyInstallment: installment,
      dpPercentage,
    };
  });

  return {
    otrPrice,
    downPayment,
    dpPercentage,
    principalLoan,
    annualRate,
    tenorYears,
    tenorMonths,
    totalInterest,
    totalRepayment,
    monthlyInstallment,
    adminFee,
    provisionFee,
    firstTotalPayment,
    comparisons,
  };
}
