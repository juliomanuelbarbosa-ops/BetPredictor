
export interface PlayerLoad {
  minutesPlayed: number;
  position: 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST';
  intensity: number; // 1.0 standard
  travelHours: number;
}

export interface TeamLoadState {
  acuteLoad: number; // 7-day
  chronicLoad: number; // 28-day
  acwr: number; // Acute:Chronic Workload Ratio
  recoveryHours: number;
  congestionFactor: number;
}

const POSITION_MULTIPLIERS = {
  GK: 0.4,
  CB: 0.7,
  FB: 1.1,
  DM: 0.9,
  CM: 1.0,
  AM: 0.95,
  W: 1.2,
  ST: 0.85
};

export function calculateMatchLoad(player: PlayerLoad, matchIntensity: number = 1.0): number {
  const baseLoad = (player.minutesPlayed / 90) * POSITION_MULTIPLIERS[player.position];
  const travelFactor = player.travelHours > 4 ? 1.2 : player.travelHours > 2 ? 1.1 : 1.0;
  return baseLoad * matchIntensity * travelFactor;
}

export function getACWRStatus(acwr: number): 'UNDERLOADED' | 'OPTIMAL' | 'OVERLOADED' | 'CRITICAL' {
  if (acwr < 0.8) return 'UNDERLOADED';
  if (acwr <= 1.3) return 'OPTIMAL';
  if (acwr <= 1.5) return 'OVERLOADED';
  return 'CRITICAL';
}

export function getPerformanceModifier(state: TeamLoadState): number {
  let modifier = 1.0;
  
  // ACWR impact
  if (state.acwr > 1.5) modifier *= 0.92; // Fatigue
  if (state.acwr < 0.8) modifier *= 0.97; // Rustiness
  
  // Recovery impact
  if (state.recoveryHours < 72) modifier *= 0.93;
  else if (state.recoveryHours < 96) modifier *= 0.98;
  
  // Congestion impact
  if (state.congestionFactor >= 3) modifier *= Math.pow(0.93, state.congestionFactor - 2);
  
  return modifier;
}
