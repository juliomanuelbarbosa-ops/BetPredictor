export enum MarketRegime {
  EFFICIENT = 'EFFICIENT',
  TRENDING = 'TRENDING',
  UNCERTAIN = 'UNCERTAIN',
  VALUE = 'VALUE',
  TRANSITIONAL = 'TRANSITIONAL'
}

export interface RegimeObservation {
  clv: number; // Closing Line Value
  accuracy: number; // Model accuracy
  upsetRate: number; // Rate of favorites losing
  volatility: number; // Odds volatility
}

export class RegimeDetector {
  private currentRegime: MarketRegime = MarketRegime.EFFICIENT;
  private regimeHistory: MarketRegime[] = [];

  // Hidden Markov Model (HMM) - simplified for demonstration
  // States: MarketRegime
  // Observations: RegimeObservation

  /**
   * Detects the current market regime based on recent observations.
   */
  detect(observations: RegimeObservation[]): MarketRegime {
    if (observations.length === 0) return MarketRegime.EFFICIENT;

    const avgCLV = observations.reduce((sum, o) => sum + o.clv, 0) / observations.length;
    const avgAccuracy = observations.reduce((sum, o) => sum + o.accuracy, 0) / observations.length;
    const avgUpsetRate = observations.reduce((sum, o) => sum + o.upsetRate, 0) / observations.length;

    let detected: MarketRegime = MarketRegime.EFFICIENT;

    if (avgCLV > 0.05 && avgAccuracy > 0.6) {
      detected = MarketRegime.VALUE;
    } else if (avgUpsetRate > 0.4) {
      detected = MarketRegime.UNCERTAIN;
    } else if (avgCLV < 0.02 && avgAccuracy < 0.5) {
      detected = MarketRegime.EFFICIENT;
    } else if (avgCLV > 0.03 && avgAccuracy > 0.55) {
      detected = MarketRegime.TRENDING;
    } else {
      detected = MarketRegime.TRANSITIONAL;
    }

    this.currentRegime = detected;
    this.regimeHistory.push(detected);
    if (this.regimeHistory.length > 50) this.regimeHistory.shift();

    return detected;
  }

  /**
   * Returns the Kelly multiplier based on the current regime.
   */
  getKellyMultiplier(): number {
    switch (this.currentRegime) {
      case MarketRegime.EFFICIENT: return 0.5;
      case MarketRegime.TRENDING: return 1.5;
      case MarketRegime.UNCERTAIN: return 0.25;
      case MarketRegime.VALUE: return 1.25;
      case MarketRegime.TRANSITIONAL: return 0.5;
      default: return 1.0;
    }
  }

  getCurrentRegime(): MarketRegime {
    return this.currentRegime;
  }

  getRegimeHistory(): MarketRegime[] {
    return this.regimeHistory;
  }
}

export const regimeDetector = new RegimeDetector();
