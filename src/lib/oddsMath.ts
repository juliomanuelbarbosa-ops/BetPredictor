export function calculateImpliedProbability(odds: number): number {
    if (odds <= 1) return 0;
    return 1 / odds;
}

export function marginProportionalToOdds(oddsMatch: number[]): number[] {
    const implied = oddsMatch.map(calculateImpliedProbability);
    const margin = implied.reduce((a, b) => a + b, 0) - 1;
    
    if (margin <= 0) return implied;

    return implied.map(prob => prob / (1 + margin));
}

/**
 * Shin's Method for margin removal (simplified heuristic approximation for 3-way markets).
 * For a true Shin implementation, we would iteratively solve for z (the proportion of inside bettors).
 * This function provides a robust approximation of favorite-longshot bias correction.
 */
export function shinsMethodApproximation(oddsH: number, oddsD: number, oddsA: number): { fairH: number, fairD: number, fairA: number, margin: number } {
    const p1 = 1 / oddsH;
    const p2 = 1 / oddsD;
    const p3 = 1 / oddsA;
    
    const sumProb = p1 + p2 + p3;
    const margin = sumProb - 1;

    // If there is no margin or an arbitrage situation, return raw implied.
    if (margin <= 0) {
        return { fairH: p1, fairD: p2, fairA: p3, margin: 0 };
    }

    // Favorite-longshot bias adjustment:
    // The margin is disproportionately applied to the longshot.
    // Shin's method distributes the margin non-linearly. We approximate this by calculating a 'z' value.
    // Approximation: True Prob = (ImpliedProb^2) / Sum(ImpliedProb^2) is a decent bias corrector, 
    // but a proper weighted scaling is better.
    
    // A simplified Shin iterative solver:
    let z = 0;
    let step = 0.001;
    let bestZ = 0;
    let minError = Infinity;

    for (let i = 0; i <= 0.1; i += step) {
        const probH = (Math.sqrt(z**2 + 4 * (1 - z) * (p1 * p1 / sumProb)) - z) / (2 * (1 - z));
        const probD = (Math.sqrt(z**2 + 4 * (1 - z) * (p2 * p2 / sumProb)) - z) / (2 * (1 - z));
        const probA = (Math.sqrt(z**2 + 4 * (1 - z) * (p3 * p3 / sumProb)) - z) / (2 * (1 - z));
        
        const sum = probH + probD + probA;
        const error = Math.abs(sum - 1);
        
        if (error < minError) {
            minError = error;
            bestZ = i;
        }
    }

    const fairH = (Math.sqrt(bestZ**2 + 4 * (1 - bestZ) * (p1 * p1 / sumProb)) - bestZ) / (2 * (1 - bestZ));
    const fairD = (Math.sqrt(bestZ**2 + 4 * (1 - bestZ) * (p2 * p2 / sumProb)) - bestZ) / (2 * (1 - bestZ));
    const fairA = (Math.sqrt(bestZ**2 + 4 * (1 - bestZ) * (p3 * p3 / sumProb)) - bestZ) / (2 * (1 - bestZ));

    // Normalize to ensure exactly 1
    const finalSum = fairH + fairD + fairA;

    return {
        fairH: fairH / finalSum,
        fairD: fairD / finalSum,
        fairA: fairA / finalSum,
        margin
    };
}

/**
 * Calculates EV using fair probabilities
 */
export function calculateEV(fairProb: number, offeredOdds: number): number {
    return (fairProb * offeredOdds) - 1;
}
