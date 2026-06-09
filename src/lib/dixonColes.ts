/**
 * Dixon-Coles Match Predictor
 * 
 * In standard Poisson regression for soccer scores, H and A goals are assumed independent.
 * The Dixon-Coles model (1997) introduces an adjustment factor (rho) for low-scoring games,
 * notably boosting the probability of 0-0, 1-0, 0-1, and 1-1 draws, which are empirically
 * underpredicted by standard Poisson models.
 */

// Basic Poisson probability
// P(x; lambda) = (e^(-lambda) * lambda^x) / x!
function poisson(x: number, lambda: number): number {
    let result = Math.exp(-lambda);
    for (let i = 1; i <= x; i++) {
        result *= lambda / i;
    }
    return result;
}

/**
 * Calculates the Dixon-Coles probability for a given scoreline (homeGoals, awayGoals)
 * 
 * @param homeGoals Number of goals scored by home team
 * @param awayGoals Number of goals scored by away team
 * @param homeExpG Expected goals for home team (lambda)
 * @param awayExpG Expected goals for away team (mu)
 * @param rho Dixon-Coles dependence parameter (typically between -0.2 and 0.2, empirically around -0.13 for top leagues)
 * @returns The adjusted probability of the exact scoreline
 */
export function dixonColesProbability(homeGoals: number, awayGoals: number, homeExpG: number, awayExpG: number, rho: number = -0.13): number {
    const pStandard = poisson(homeGoals, homeExpG) * poisson(awayGoals, awayExpG);

    // Dixon-Coles adjustment only applies to 0-0, 1-0, 0-1, 1-1
    if (homeGoals === 0 && awayGoals === 0) {
        return pStandard * (1 - homeExpG * awayExpG * rho);
    }
    if (homeGoals === 0 && awayGoals === 1) {
        return pStandard * (1 + homeExpG * rho);
    }
    if (homeGoals === 1 && awayGoals === 0) {
        return pStandard * (1 + awayExpG * rho);
    }
    if (homeGoals === 1 && awayGoals === 1) {
        return pStandard * (1 - rho);
    }

    return pStandard;
}

/**
 * Predicts 1X2 Probabilities using a Dixon-Coles probability matrix
 * Assumes a maximum of 10 goals per team in calculations.
 */
export function getDixonColesMatchProbabilities(homeExpG: number, awayExpG: number, rho: number = -0.13): { home: number, draw: number, away: number } {
    let probHome = 0;
    let probDraw = 0;
    let probAway = 0;

    for (let h = 0; h <= 10; h++) {
        for (let a = 0; a <= 10; a++) {
            const prob = dixonColesProbability(h, a, homeExpG, awayExpG, rho);
            
            if (h > a) probHome += prob;
            else if (h === a) probDraw += prob;
            else probAway += prob;
        }
    }

    // Normalize (matrix truncation might leave sum slightly below 1)
    const sum = probHome + probDraw + probAway;

    return {
        home: probHome / sum,
        draw: probDraw / sum,
        away: probAway / sum
    };
}
