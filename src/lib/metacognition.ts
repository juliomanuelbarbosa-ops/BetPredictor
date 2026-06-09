
export interface UncertaintyFactor {
  name: string;
  impact: number; // 0 to 1
  description: string;
}

export interface MetacognitiveReport {
  baseConfidence: number;
  adjustedConfidence: number;
  uncertaintyFactors: UncertaintyFactor[];
  knownUnknowns: string[];
  recommendedAction: 'BET' | 'WAIT' | 'SKIP' | 'RESEARCH_MORE';
  waitingFor: string[];
}

export function analyzeUncertainty(
  match: any,
  baseConfidence: number,
  lineupAnnounced: boolean = false
): MetacognitiveReport {
  const factors: UncertaintyFactor[] = [];
  const unknowns: string[] = [];
  const waitingFor: string[] = [];
  let adjustedConfidence = baseConfidence;

  // 1. Lineup Uncertainty
  if (!lineupAnnounced) {
    const impact = 0.15;
    factors.push({
      name: "Lineup Uncertainty",
      impact,
      description: "Official starting XI not yet confirmed. Tactical changes possible."
    });
    adjustedConfidence *= (1 - impact);
    unknowns.push("Starting XI composition");
    waitingFor.push("Official Lineup Announcement");
  }

  // 2. Data Staleness
  const lastUpdate = match?.lastUpdate ? new Date(match.lastUpdate) : new Date();
  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate > 12) {
    const impact = 0.05;
    factors.push({
      name: "Data Staleness",
      impact,
      description: `Market data is ${Math.round(hoursSinceUpdate)}h old. Sharp moves may have occurred.`
    });
    adjustedConfidence *= (1 - impact);
    unknowns.push("Recent market sentiment shifts");
  }

  // 3. Sample Size
  if (match?.h2hCount && match.h2hCount < 3) {
    const impact = 0.1;
    factors.push({
      name: "Low Sample Size",
      impact,
      description: "Limited head-to-head history between these teams."
    });
    adjustedConfidence *= (1 - impact);
  }

  let recommendedAction: 'BET' | 'WAIT' | 'SKIP' | 'RESEARCH_MORE' = 'BET';
  if (adjustedConfidence < 50) recommendedAction = 'SKIP';
  else if (!lineupAnnounced && adjustedConfidence < 70) recommendedAction = 'WAIT';
  else if (factors.length > 2) recommendedAction = 'RESEARCH_MORE';

  return {
    baseConfidence,
    adjustedConfidence: Math.round(adjustedConfidence),
    uncertaintyFactors: factors,
    knownUnknowns: unknowns,
    recommendedAction,
    waitingFor
  };
}
