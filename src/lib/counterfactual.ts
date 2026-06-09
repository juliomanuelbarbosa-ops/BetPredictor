export interface CausalFactors {
  squadStrength: number;
  homeAdvantage: number;
  weather: number; // 0: clear, 1: rainy, 2: extreme
  fatigue: number; // 0-1
  refereeStrictness: number; // 0-1
  venue: 'HOME' | 'AWAY' | 'NEUTRAL';
  form: number; // 0-1
}

export interface CounterfactualScenario {
  id: string;
  description: string;
  intervention: (factors: CausalFactors) => CausalFactors;
  impactLabel: string;
}

export class CounterfactualEngine {
  /**
   * Predicts win probability (Home, Draw, Away) based on causal factors.
   * This is a simplified causal model for demonstration.
   */
  private predict(factors: CausalFactors): number[] {
    // Base xG derived from squad strength and home advantage
    let homeXG = factors.squadStrength * 1.5;
    let awayXG = 1.2; // Baseline away strength

    // Apply interventions
    if (factors.venue === 'HOME') {
      homeXG += factors.homeAdvantage;
    } else if (factors.venue === 'AWAY') {
      awayXG += factors.homeAdvantage;
    }

    // Weather impact
    if (factors.weather === 1) {
      homeXG *= 0.9;
      awayXG *= 0.9;
    }

    // Fatigue impact
    homeXG *= (1 - factors.fatigue * 0.2);

    // Form impact
    homeXG *= (0.8 + factors.form * 0.4);

    // Simple Poisson-like probability calculation
    const totalXG = homeXG + awayXG;
    const homeProb = homeXG / totalXG;
    const awayProb = awayXG / totalXG;
    const drawProb = 0.25; // Fixed for simplicity

    const normalizedHome = homeProb * (1 - drawProb);
    const normalizedAway = awayProb * (1 - drawProb);

    return [normalizedHome, drawProb, normalizedAway];
  }

  /**
   * Performs an intervention (do-calculus) and calculates the impact.
   */
  analyze(factualFactors: CausalFactors, scenario: CounterfactualScenario) {
    const factualProb = this.predict(factualFactors);
    const counterfactualFactors = scenario.intervention({ ...factualFactors });
    const counterfactualProb = this.predict(counterfactualFactors);

    const delta = counterfactualProb[0] - factualProb[0]; // Home win probability delta

    return {
      factual: factualProb,
      counterfactual: counterfactualProb,
      delta: delta,
      impact: (delta * 100).toFixed(1) + 'pp'
    };
  }

  getScenarios(): CounterfactualScenario[] {
    return [
      {
        id: 'neutral_venue',
        description: 'What if match was neutral venue?',
        intervention: (f) => ({ ...f, venue: 'NEUTRAL', homeAdvantage: 0 }),
        impactLabel: 'Venue impact'
      },
      {
        id: 'injury_recovery',
        description: 'What if key player (e.g. Haaland) was fit?',
        intervention: (f) => ({ ...f, squadStrength: f.squadStrength * 1.15 }),
        impactLabel: 'Injury impact'
      },
      {
        id: 'clear_weather',
        description: 'What if it had not rained?',
        intervention: (f) => ({ ...f, weather: 0 }),
        impactLabel: 'Weather impact'
      },
      {
        id: 'lenient_referee',
        description: 'What if referee was lenient?',
        intervention: (f) => ({ ...f, refereeStrictness: 0.2 }),
        impactLabel: 'Referee impact'
      },
      {
        id: 'historical_form',
        description: 'What if team played at season average form?',
        intervention: (f) => ({ ...f, form: 0.5 }),
        impactLabel: 'Form impact'
      }
    ];
  }
}

export const counterfactualEngine = new CounterfactualEngine();
