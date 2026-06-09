
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length < 2) return 0;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return (avgReturn - riskFreeRate) / stdDev;
}

export function calculateSortinoRatio(returns: number[], targetReturn: number = 0): number {
  if (returns.length < 2) return 0;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const downsideReturns = returns.filter(r => r < targetReturn);
  
  if (downsideReturns.length === 0) return 0;
  
  const downsideVariance = downsideReturns.reduce((a, b) => a + Math.pow(b - targetReturn, 2), 0) / returns.length;
  const downsideStdDev = Math.sqrt(downsideVariance);
  
  if (downsideStdDev === 0) return 0;
  
  return (avgReturn - targetReturn) / downsideStdDev;
}
