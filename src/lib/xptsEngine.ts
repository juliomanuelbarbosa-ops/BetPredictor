export interface TeamXPTS {
  team: string;
  actualPoints: number;
  xPTS: number;
  luckIndex: number;
}

export function calculateLuckIndex(
  matches: { home: string; away: string; homeWinProb: number; drawProb: number; awayWinProb: number; homeGoals: number; awayGoals: number }[]
): TeamXPTS[] {
  const teamStats: Record<string, { actualPoints: number; xPTS: number }> = {};

  matches.forEach(m => {
    // Initialize
    [m.home, m.away].forEach(t => { if (!teamStats[t]) teamStats[t] = { actualPoints: 0, xPTS: 0 }; });

    // Actual Points
    const actualHome = m.homeGoals > m.awayGoals ? 3 : m.homeGoals === m.awayGoals ? 1 : 0;
    const actualAway = 3 - actualHome;
    teamStats[m.home].actualPoints += actualHome;
    teamStats[m.away].actualPoints += actualAway;

    // Expected Points
    const xPTSHome = m.homeWinProb * 3 + m.drawProb * 1;
    const xPTSAway = m.awayWinProb * 3 + m.drawProb * 1;
    teamStats[m.home].xPTS += xPTSHome;
    teamStats[m.away].xPTS += xPTSAway;
  });

  return Object.entries(teamStats).map(([team, stats]) => ({
    team,
    actualPoints: stats.actualPoints,
    xPTS: stats.xPTS,
    luckIndex: stats.actualPoints - stats.xPTS
  })).sort((a, b) => b.actualPoints - a.actualPoints);
}
