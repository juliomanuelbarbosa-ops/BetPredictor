export interface Bet {
    id: string;
    match: string;
    league: string;
    date: Date;
    selection: string;
    odds: number;
    probability: number;
    isHomeFavourite: boolean;
    isUnderdog: boolean;
}

export interface PortfolioOptimiserResult {
    bets: {
        bet: Bet;
        standardKelly: number;
        adjustedKelly: number;
        recommendedStake: number;
        expectedValue: number;
    }[];
    totalExposure: number;
    portfolioEV: number;
    maxLoss: number;
    efficientFrontier: {
        riskMultiplier: number;
        expectedReturn: number;
        variance: number;
        sharpeRatio: number;
    }[];
    optimalMultiplier: number;
    currentMultiplier: number;
    insight: string;
}

export function estimateCorrelation(bet1: Bet, bet2: Bet): number {
    if (bet1.id === bet2.id) return 1.0;
    if (bet1.match === bet2.match) return 1.0;

    let correlation = 0;

    const isSameDay = bet1.date.toDateString() === bet2.date.toDateString();
    const isSameLeague = bet1.league === bet2.league;

    if (isSameDay && isSameLeague) {
        correlation += 0.25;
    } else if (isSameDay && !isSameLeague) {
        correlation += 0.05;
    } else if (!isSameDay) {
        correlation += 0.02;
    }

    if (bet1.isHomeFavourite && bet2.isHomeFavourite) {
        correlation += 0.10;
    }
    if (bet1.isUnderdog && bet2.isUnderdog) {
        correlation += 0.08;
    }

    return Math.min(1.0, Math.max(0, correlation));
}

export function calculateStandardKelly(prob: number, odds: number): number {
    const q = 1 - prob;
    const b = odds - 1;
    const f = (prob * b - q) / b;
    return Math.max(0, f);
}

export function optimizePortfolio(bets: Bet[], bankroll: number): PortfolioOptimiserResult {
    const n = bets.length;
    if (n === 0) {
        return {
            bets: [], totalExposure: 0, portfolioEV: 0, maxLoss: 0,
            efficientFrontier: [], optimalMultiplier: 1, currentMultiplier: 1, insight: "No bets in portfolio."
        };
    }

    // 1. Standard Kelly
    const standardKellys = bets.map(b => calculateStandardKelly(b.probability, b.odds));

    // 2. Correlation Matrix
    const correlationMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            correlationMatrix[i][j] = estimateCorrelation(bets[i], bets[j]);
        }
    }

    // 3. Apply portfolio reduction
    const adjustedKellys = standardKellys.map((sk, i) => {
        let sumCorr = 0;
        for (let j = 0; j < n; j++) {
            if (i !== j) sumCorr += correlationMatrix[i][j];
        }
        const avgCorr = n > 1 ? sumCorr / (n - 1) : 0;
        return sk * (1 - avgCorr);
    });

    // 4. Ensure total exposure <= 20%
    let totalFraction = adjustedKellys.reduce((a, b) => a + b, 0);
    const maxExposure = 0.20;
    let finalFractions = [...adjustedKellys];
    
    if (totalFraction > maxExposure) {
        const scale = maxExposure / totalFraction;
        finalFractions = finalFractions.map(f => f * scale);
        totalFraction = maxExposure;
    }

    // Calculate EV and Max Loss
    let portfolioEV = 0;
    let maxLoss = 0;
    const betResults = bets.map((bet, i) => {
        const stake = finalFractions[i] * bankroll;
        const ev = stake * (bet.probability * bet.odds - 1);
        portfolioEV += ev;
        maxLoss += stake;
        return {
            bet,
            standardKelly: standardKellys[i],
            adjustedKelly: finalFractions[i],
            recommendedStake: stake,
            expectedValue: ev
        };
    });

    // 5. Efficient Frontier (Simulate risk levels)
    const efficientFrontier = [];
    let optimalMultiplier = 1.0;
    let maxSharpe = -Infinity;

    for (let mult = 0.5; mult <= 2.0; mult += 0.1) {
        // Simulate 1000 outcomes for this multiplier
        const simulatedReturns = [];
        for (let sim = 0; sim < 1000; sim++) {
            let simReturn = 0;
            for (let i = 0; i < n; i++) {
                const stake = finalFractions[i] * bankroll * mult;
                const won = Math.random() < bets[i].probability;
                simReturn += won ? stake * (bets[i].odds - 1) : -stake;
            }
            simulatedReturns.push(simReturn);
        }

        const meanReturn = simulatedReturns.reduce((a, b) => a + b, 0) / 1000;
        const variance = simulatedReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / 1000;
        const stdDev = Math.sqrt(variance);
        const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;

        efficientFrontier.push({
            riskMultiplier: mult,
            expectedReturn: meanReturn,
            variance,
            sharpeRatio
        });

        if (sharpeRatio > maxSharpe) {
            maxSharpe = sharpeRatio;
            optimalMultiplier = mult;
        }
    }

    let insight = "Portfolio is well-balanced.";
    if (optimalMultiplier < 0.9) {
        insight = `Reducing your stakes by ${Math.round((1 - optimalMultiplier) * 100)}% improves risk-adjusted return based on your current bet correlation.`;
    } else if (optimalMultiplier > 1.1) {
        insight = `Increasing your stakes by ${Math.round((optimalMultiplier - 1) * 100)}% could improve returns without excessive risk.`;
    }

    return {
        bets: betResults,
        totalExposure: totalFraction,
        portfolioEV,
        maxLoss,
        efficientFrontier,
        optimalMultiplier,
        currentMultiplier: 1.0,
        insight
    };
}
