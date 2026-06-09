
export interface ForecastSignal {
  source: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  weight: number;
}

export function aggregateSignals(signals: ForecastSignal[]): { home: number, draw: number, away: number, confidence: number } {
  let totalWeight = 0;
  let homeSum = 0;
  let drawSum = 0;
  let awaySum = 0;
  
  // Logarithmic pooling (simplified for demo)
  signals.forEach(s => {
    homeSum += s.homeProb * s.weight;
    drawSum += s.drawProb * s.weight;
    awaySum += s.awayProb * s.weight;
    totalWeight += s.weight;
  });
  
  const home = homeSum / totalWeight;
  const draw = drawSum / totalWeight;
  const away = awaySum / totalWeight;
  
  // Disagreement measure (Standard Deviation across sources)
  const variances = signals.map(s => Math.pow(s.homeProb - home, 2));
  const disagreement = Math.sqrt(variances.reduce((a, b) => a + b, 0) / signals.length);
  
  const confidence = Math.max(0, 100 - (disagreement * 200));
  
  return { home, draw, away, confidence };
}
