
export interface TimingAdvice {
  status: 'OPEN' | 'WAIT' | 'CLOSED';
  urgency: number; // 1-10
  reason: string;
  optimalWindow: string;
}

export function getTimingAdvice(matchTime: string): TimingAdvice {
  const now = new Date();
  const kickoff = new Date(matchTime);
  const hoursToKickoff = (kickoff.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursToKickoff < 0) return { status: 'CLOSED', urgency: 0, reason: "Match has already started", optimalWindow: "N/A" };
  
  if (hoursToKickoff > 72) {
    return {
      status: 'OPEN',
      urgency: 3,
      reason: "Early market. Value often found before sharp adjustment.",
      optimalWindow: "48h-72h before kickoff"
    };
  }
  
  if (hoursToKickoff < 2) {
    return {
      status: 'WAIT',
      urgency: 9,
      reason: "Lineups announced. Market is highly efficient. Only bet if model shows extreme edge.",
      optimalWindow: "Lineup announcement window"
    };
  }
  
  if (hoursToKickoff < 24) {
    return {
      status: 'OPEN',
      urgency: 7,
      reason: "Market volume increasing. Odds stabilizing.",
      optimalWindow: "6h-24h before kickoff"
    };
  }
  
  return {
    status: 'OPEN',
    urgency: 5,
    reason: "Standard betting window.",
    optimalWindow: "24h-48h before kickoff"
  };
}
