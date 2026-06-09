import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Forecast {
  id: string;
  userId: string;
  game: {
    id: string;
    home: string;
    away: string;
    league: string;
    oddsH: number;
    oddsD: number;
    oddsA: number;
    commence_time: string;
  };
  probs: number[];
  bestBet: string;
  confidence: number;
  edge?: number;
  valueText?: string;
  predScore?: string;
  stake: number;
  features?: number[];
  actual?: string | null;
  bytezAnalysis?: any;
  isManual?: boolean;
  createdAt: string;
  modelUncertainty?: number;
  osAnalysis?: any;
  profit?: number;
  votes?: number[];
  disagreement?: number;
  tags?: string[];
  confidenceHistory?: { timestamp: string; confidence: number }[];
  notes?: string;
  isAccumulator?: boolean;
  accumulatorSelections?: Forecast[];
  accumulatorLegs?: {
    matchId: string;
    home: string;
    away: string;
    market: string;
    odds: number;
    actual?: string | null;
  }[];
}

interface ForecastStore {
  forecasts: Forecast[];
  addForecast: (forecast: Forecast) => void;
  removeForecast: (id: string) => void;
  updateForecast: (id: string, updates: Partial<Forecast>) => void;
  resolveForecast: (id: string, actual: string) => void;
  resolveAccumulatorLeg: (forecastId: string, legIndex: number, actual: string) => void;
  clearHistory: (userId: string) => void;
}

export const useForecastStore = create<ForecastStore>()(
  persist(
    (set) => ({
      forecasts: [],
      addForecast: (forecast) => set((state) => ({ forecasts: [...state.forecasts, forecast] })),
      removeForecast: (id) => set((state) => ({ forecasts: state.forecasts.filter((p) => p.id !== id) })),
      updateForecast: (id, updates) => set((state) => ({
        forecasts: state.forecasts.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      resolveForecast: (id, actual) => set((state) => ({
        forecasts: state.forecasts.map((p) => {
          if (p.id === id) {
            let odds = 1.0;
            if (p.isAccumulator) odds = p.game.oddsH || 1.0;
            else if (p.bestBet === 'HOME WIN') odds = p.game.oddsH || 1.0;
            else if (p.bestBet === 'AWAY WIN') odds = p.game.oddsA || 1.0;
            else if (p.bestBet === 'DRAW') odds = p.game.oddsD || 1.0;
            
            const profit = actual === 'WON' ? (p.stake * odds) - p.stake : actual === 'VOID' ? 0 : -p.stake;
            return { ...p, actual, profit };
          }
          return p;
        })
      })),
      resolveAccumulatorLeg: (forecastId, legIndex, actual) => set((state) => ({
        forecasts: state.forecasts.map((p) => {
          if (p.id === forecastId && p.isAccumulator && p.accumulatorLegs) {
            const updatedLegs = [...p.accumulatorLegs];
            updatedLegs[legIndex] = { ...updatedLegs[legIndex], actual };
            
            // Check if accumulator is fully resolved
            const allResolved = updatedLegs.every(leg => leg.actual !== null && leg.actual !== undefined);
            const anyLost = updatedLegs.some(leg => leg.actual === 'LOST');
            
            let accActual = p.actual;
            let accProfit = p.profit;
            let accOdds = p.game.oddsH;
            
            if (anyLost) {
              accActual = 'LOST';
              accProfit = -p.stake;
            } else if (allResolved) {
              // All legs are resolved and none are LOST. They are WON or VOID.
              const allVoid = updatedLegs.every(leg => leg.actual === 'VOID');
              if (allVoid) {
                accActual = 'VOID';
                accProfit = 0;
              } else {
                accActual = 'WON';
                // Calculate new odds based on WON legs (VOID legs have odds 1.0)
                const finalOdds = updatedLegs.reduce((acc, leg) => {
                  return acc * (leg.actual === 'VOID' ? 1.0 : leg.odds);
                }, 1.0);
                accProfit = (p.stake * finalOdds) - p.stake;
                accOdds = finalOdds;
              }
            }
            
            return { 
              ...p, 
              accumulatorLegs: updatedLegs, 
              actual: accActual, 
              profit: accProfit,
              game: { ...p.game, oddsH: accOdds }
            };
          }
          return p;
        })
      })),
      clearHistory: (userId) => set((state) => ({ forecasts: state.forecasts.filter((p) => p.userId !== userId) })),
    }),
    { name: 'forecast-store' }
  )
);
