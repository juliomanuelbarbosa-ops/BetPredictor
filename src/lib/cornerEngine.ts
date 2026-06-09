
export function predictCorners(
  homeCornerRate: number,
  awayCornerRate: number,
  matchIntensity: number = 1.0
): { total: number, over9_5: number } {
  const lambda = (homeCornerRate + awayCornerRate) * matchIntensity;
  
  // Poisson probability for Over 9.5
  // P(X > 9) = 1 - P(X <= 9)
  let pLessEqual9 = 0;
  for (let k = 0; k <= 9; k++) {
    pLessEqual9 += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }
  
  return {
    total: lambda,
    over9_5: 1 - pLessEqual9
  };
}

function factorial(n: number): number {
  if (n === 0) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}
