
export interface TransactionCosts {
  margin: number; // 0.02 - 0.08
  withdrawalFee: number;
  tax: number;
  opportunityCost: number;
}

export function calculateAdjustedKelly(
  prob: number,
  odds: number,
  fraction: number,
  costs: TransactionCosts
): number {
  // Standard Kelly: f* = (bp - q) / b
  // b = odds - 1
  // p = prob
  // q = 1 - p
  const b = odds - 1;
  const p = prob;
  const q = 1 - p;
  
  // Adjusted for costs
  const fStar = (b * p - q - costs.margin - costs.tax) / b;
  
  return Math.max(0, fStar * fraction);
}

export function getNetProfit(grossProfit: number, costs: TransactionCosts): number {
  return grossProfit * (1 - costs.tax) - costs.withdrawalFee;
}
