
import { TeamLoadState } from './physicalLoad';

export interface InjuryRisk {
  player: string;
  probability: number;
  type: 'Muscle' | 'Ligament' | 'Impact' | 'Other';
  impactOnWinProb: number;
}

export function estimateInjuryRisk(
  position: 'GK' | 'DEF' | 'MID' | 'FWD',
  loadState: TeamLoadState,
  history: { previousInjuries: number, age: number },
  conditions: { pitch: 'Natural' | 'Artificial' | 'Frozen' | 'Waterlogged' }
): number {
  let risk = 0.05; // Base risk per match
  
  // Position base
  const posBase = { GK: 0.04, DEF: 0.07, MID: 0.07, FWD: 0.08 };
  risk = posBase[position];
  
  // Load multipliers
  if (loadState.acwr > 1.5) risk *= 1.8;
  if (loadState.recoveryHours < 72) risk *= 1.4;
  
  // History
  if (history.previousInjuries > 2) risk *= 1.5;
  if (history.age > 30) risk *= 1.2;
  
  // Pitch
  if (conditions.pitch === 'Artificial') risk *= 1.4;
  if (conditions.pitch === 'Frozen') risk *= 2.1;
  
  return Math.min(risk, 0.5); // Cap at 50%
}

export function getExpectedValueWithInjury(
  baseEV: number,
  injuryRisk: number,
  impactIfInjured: number
): number {
  // EV = P(no injury) * EV(fit) + P(injury) * EV(injured)
  const evInjured = baseEV - impactIfInjured;
  return (1 - injuryRisk) * baseEV + injuryRisk * evInjured;
}
