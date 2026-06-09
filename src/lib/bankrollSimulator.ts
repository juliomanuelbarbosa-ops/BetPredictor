
export interface SimulationResult {
  finalBankroll: number;
  maxDrawdown: number;
  isRuined: boolean;
  path: number[];
}

export interface MonteCarloSummary {
  riskOfRuin: number;
  expectedFinalBankroll: number;
  p5: number;
  p50: number;
  p95: number;
  probDouble: number;
  probHalf: number;
  avgMaxDrawdown: number;
  recoveryTime: number;
  paths: {
      median: number[];
      p5: number[];
      p95: number[];
  };
}

export function simulateBettingCareer(
  startingBankroll: number,
  winRate: number,
  avgOdds: number,
  stakePercent: number,
  numBets: number
): SimulationResult {
  let currentBankroll = startingBankroll;
  const path = [currentBankroll];
  let maxBankroll = startingBankroll;
  let maxDrawdown = 0;
  let isRuined = false;

  for (let i = 0; i < numBets; i++) {
    const stake = currentBankroll * (stakePercent / 100);
    const won = Math.random() < winRate;

    if (won) {
      currentBankroll += stake * (avgOdds - 1);
    } else {
      currentBankroll -= stake;
    }

    path.push(currentBankroll);
    maxBankroll = Math.max(maxBankroll, currentBankroll);
    const drawdown = maxBankroll > 0 ? (maxBankroll - currentBankroll) / maxBankroll : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);

    if (currentBankroll < startingBankroll * 0.1) {
      isRuined = true;
    }
    
    if (currentBankroll <= 0) {
        currentBankroll = 0;
        break;
    }
  }

  return { finalBankroll: currentBankroll, maxDrawdown, isRuined, path };
}

export function runMonteCarlo(
  startingBankroll: number,
  winRate: number,
  avgOdds: number,
  stakePercent: number,
  numBets: number,
  iterations: number = 5000
): MonteCarloSummary {
  const results: SimulationResult[] = [];
  let doubleCount = 0;
  let halfCount = 0;

  for (let i = 0; i < iterations; i++) {
    const res = simulateBettingCareer(startingBankroll, winRate, avgOdds, stakePercent, numBets);
    results.push(res);
    if (res.finalBankroll >= startingBankroll * 2) doubleCount++;
    if (res.finalBankroll <= startingBankroll * 0.5) halfCount++;
  }

  results.sort((a, b) => a.finalBankroll - b.finalBankroll);
  
  const p5Index = Math.floor(iterations * 0.05);
  const p50Index = Math.floor(iterations * 0.5);
  const p95Index = Math.floor(iterations * 0.95);

  const finalBankrolls = results.map(r => r.finalBankroll);
  const ruinedCount = results.filter(r => r.isRuined).length;

  return {
    riskOfRuin: (ruinedCount / iterations) * 100,
    expectedFinalBankroll: finalBankrolls.reduce((a, b) => a + b, 0) / iterations,
    p5: results[p5Index].finalBankroll,
    p50: results[p50Index].finalBankroll,
    p95: results[p95Index].finalBankroll,
    probDouble: (doubleCount / iterations) * 100,
    probHalf: (halfCount / iterations) * 100,
    avgMaxDrawdown: (results.reduce((a, b) => a + b.maxDrawdown, 0) / iterations) * 100,
    recoveryTime: 0, // Simplified
    paths: {
        median: results[p50Index].path,
        p5: results[p5Index].path,
        p95: results[p95Index].path
    }
  };
}
