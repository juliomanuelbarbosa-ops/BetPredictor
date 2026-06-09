export interface UncertaintyFactors {
  modelUncertainty: number; // 0.02 to 0.15
  marketUncertainty: number; // 0.03 to 0.15
  dataUncertainty: number; // 0.02 to 0.10
}

export class UncertaintyKelly {
  /**
   * Calculates the uncertainty-adjusted Kelly fraction.
   * f* = (bp - q) / b
   * assumes p (win probability) is known exactly.
   * In reality p has uncertainty: p ∈ [p_lower, p_upper]
   */
  calculate(
    p: number, 
    odds: number, 
    bankroll: number, 
    factors: UncertaintyFactors, 
    k = 1.5 // safety multiplier
  ) {
    // Combined uncertainty
    const sigmaTotal = Math.sqrt(
      Math.pow(factors.modelUncertainty, 2) + 
      Math.pow(factors.marketUncertainty, 2) + 
      Math.pow(factors.dataUncertainty, 2)
    );

    // Conservative probability
    const pConservative = Math.max(0, p - k * sigmaTotal);
    const qConservative = 1 - pConservative;
    const b = odds - 1;

    // f*_conservative = (b * p_conservative - q_conservative) / b
    const fConservative = (b * pConservative - qConservative) / b;

    if (fConservative <= 0) {
      return {
        stake: 0,
        fraction: 0,
        pConservative,
        sigmaTotal,
        decision: 'SKIP'
      };
    }

    const stake = fConservative * bankroll;
    let decision = 'FULL KELLY';
    if (sigmaTotal > 0.1) decision = 'QUARTER KELLY';
    else if (sigmaTotal > 0.05) decision = 'HALF KELLY';

    return {
      stake: Number(stake.toFixed(2)),
      fraction: Number(fConservative.toFixed(4)),
      pConservative: Number(pConservative.toFixed(4)),
      sigmaTotal: Number(sigmaTotal.toFixed(4)),
      decision
    };
  }

  getUncertaintyLevel(sigma: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (sigma < 0.05) return 'LOW';
    if (sigma < 0.1) return 'MEDIUM';
    return 'HIGH';
  }
}

export const uncertaintyKelly = new UncertaintyKelly();
