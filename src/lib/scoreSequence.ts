
export interface ScoreState {
  home: number;
  away: number;
}

export function getNextGoalProbability(currentState: ScoreState, homeStrength: number, awayStrength: number): { home: number, draw: number, away: number } {
  const totalStrength = homeStrength + awayStrength;
  const homeProb = totalStrength > 0 ? (homeStrength / totalStrength) * 0.6 : 0.33;
  const awayProb = totalStrength > 0 ? (awayStrength / totalStrength) * 0.4 : 0.33;
  
  return {
    home: homeProb,
    away: awayProb,
    draw: 1 - homeProb - awayProb
  };
}

export interface RhythmAnalysis {
  home: number[];
  away: number[];
  homeTrend: string;
  awayTrend: string;
  homeVolatility: number;
  awayVolatility: number;
  dangerZones: number[];
  volatility: number; // For backward compatibility if needed
  trend: string;      // For backward compatibility if needed
  rhythmScore: number; // For backward compatibility if needed
}

export function analyzeRhythm(homeGoals: number[] = [0, 0, 0, 0, 0, 0], awayGoals: number[] = [0, 0, 0, 0, 0, 0]): RhythmAnalysis {
  const calculateTrend = (goals: number[]) => {
    const firstHalf = goals.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalf = goals.slice(3).reduce((a, b) => a + b, 0);
    return secondHalf > firstHalf ? 'Ascending' : 'Descending';
  };

  const calculateVolatility = (goals: number[]) => {
    const mean = goals.reduce((a, b) => a + b, 0) / goals.length;
    const variance = goals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / goals.length;
    return Math.sqrt(variance);
  };

  const homeTrend = calculateTrend(homeGoals);
  const awayTrend = calculateTrend(awayGoals);
  const homeVolatility = calculateVolatility(homeGoals);
  const awayVolatility = calculateVolatility(awayGoals);

  const dangerZones = homeGoals.map((g, i) => (g + (awayGoals[i] || 0) > 2 ? i : -1)).filter(i => i !== -1);

  return {
    home: homeGoals.map(g => Math.min(1, g / 3)), // Normalize for viz
    away: awayGoals.map(g => Math.min(1, g / 3)),
    homeTrend,
    awayTrend,
    homeVolatility,
    awayVolatility,
    dangerZones,
    volatility: (homeVolatility + awayVolatility) / 2,
    trend: homeTrend.toLowerCase(),
    rhythmScore: 0.75 // Mock score
  };
}
