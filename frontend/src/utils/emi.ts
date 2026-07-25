export interface EmiInput {
  price: number;
  downPayment: number;
  annualRatePercent: number;
  tenureMonths: number;
}

export interface EmiResult {
  principal: number;
  monthlyEmi: number;
  totalInterest: number;
  totalAmount: number;
}

/**
 * Standard reducing-balance EMI formula:
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where P = principal, r = monthly interest rate, n = tenure in months.
 */
export function calculateEmi({ price, downPayment, annualRatePercent, tenureMonths }: EmiInput): EmiResult {
  const principal = Math.max(price - downPayment, 0);

  if (principal <= 0 || tenureMonths <= 0) {
    return { principal, monthlyEmi: 0, totalInterest: 0, totalAmount: principal };
  }

  const monthlyRate = annualRatePercent / 12 / 100;

  let monthlyEmi: number;
  if (monthlyRate === 0) {
    monthlyEmi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalAmount = monthlyEmi * tenureMonths;
  const totalInterest = totalAmount - principal;

  return { principal, monthlyEmi, totalInterest, totalAmount };
}

/** Rough default assumptions used for the "EMI starts from" figure shown on car cards. */
export const DEFAULT_EMI_ASSUMPTIONS = {
  downPaymentRatio: 0.2, // 20% down payment
  annualRatePercent: 9.5,
  tenureMonths: 60,
};

export function estimateStartingEmi(price: number): number {
  const { downPaymentRatio, annualRatePercent, tenureMonths } = DEFAULT_EMI_ASSUMPTIONS;
  const { monthlyEmi } = calculateEmi({
    price,
    downPayment: price * downPaymentRatio,
    annualRatePercent,
    tenureMonths,
  });
  return Math.round(monthlyEmi);
}
