
export interface ForecastPattern {
    type: 'league' | 'odds_range' | 'confidence' | 'team';
    key: string;
    winRate: number;
    total: number;
    profit: number;
    description: string;
}

export function analyzePatterns(forecasts: any[]): ForecastPattern[] {
    const resolved = forecasts.filter(p => p.actual !== null);
    if (resolved.length < 5) return [];

    const patterns: ForecastPattern[] = [];

    // 1. League Analysis
    const leagueStats: Record<string, { won: number, total: number, profit: number }> = {};
    resolved.forEach(p => {
        const league = p.game.league;
        if (!leagueStats[league]) leagueStats[league] = { won: 0, total: 0, profit: 0 };
        leagueStats[league].total++;
        if (p.actual === 'WON') leagueStats[league].won++;
        leagueStats[league].profit += p.profit || 0;
    });

    Object.entries(leagueStats).forEach(([league, stats]) => {
        if (stats.total >= 3) {
            const winRate = (stats.won / stats.total) * 100;
            if (winRate > 60 || winRate < 40) {
                patterns.push({
                    type: 'league',
                    key: league,
                    winRate,
                    total: stats.total,
                    profit: stats.profit,
                    description: winRate > 60 
                        ? `High alpha extraction in ${league}. Model tactical parameters are heavily aligned with this dataset.`
                        : `Sub-optimal EV in ${league}. Consider heavily discounting or excluding this liquidity pool.`
                });
            }
        }
    });

    // 2. Odds Range Analysis
    const oddsRanges = [
        { min: 1.0, max: 1.5, label: 'Heavy Favorites (1.0-1.5)' },
        { min: 1.5, max: 2.0, label: 'Favorites (1.5-2.0)' },
        { min: 2.0, max: 3.0, label: 'Mid-Range (2.0-3.0)' },
        { min: 3.0, max: 10.0, label: 'Underdogs (3.0+)' }
    ];

    oddsRanges.forEach(range => {
        const inRange = resolved.filter(p => {
            let odds = 2.0;
            if (p.bestBet === "HOME WIN") odds = p.game.oddsH || 2.0;
            else if (p.bestBet === "DRAW") odds = p.game.oddsD || 3.0;
            else if (p.bestBet === "AWAY WIN") odds = p.game.oddsA || 3.0;
            return odds >= range.min && odds < range.max;
        });

        if (inRange.length >= 3) {
            const won = inRange.filter(p => p.actual === 'WON').length;
            const winRate = (won / inRange.length) * 100;
            const profit = inRange.reduce((acc, p) => acc + (p.profit || 0), 0);
            
            if (winRate > 65 || winRate < 35) {
                patterns.push({
                    type: 'odds_range',
                    key: range.label,
                    winRate,
                    total: inRange.length,
                    profit,
                    description: winRate > 65
                        ? `Significant positive EV captured in ${range.label} volatility band.`
                        : `Negative EV in ${range.label} brackets. Adjust fractional Kelly divisor or avoid.`
                });
            }
        }
    });

    // 3. Confidence Correlation
    const highConf = resolved.filter(p => p.confidence >= 75);
    if (highConf.length >= 3) {
        const won = highConf.filter(p => p.actual === 'WON').length;
        const winRate = (won / highConf.length) * 100;
        const profit = highConf.reduce((acc, p) => acc + (p.profit || 0), 0);
        
        patterns.push({
            type: 'confidence',
            key: 'High Confidence (75%+)',
            winRate,
            total: highConf.length,
            profit,
            description: winRate > 70
                ? `High conviction signals correlate with positive alpha. Model calibration is optimal.`
                : `High conviction signals are returning negative EV. Model calibration requires strict penalization.`
        });
    }

    // 4. Market Analysis (Home/Draw/Away)
    const marketStats: Record<string, { won: number, total: number, profit: number }> = {};
    resolved.forEach(p => {
        const market = p.bestBet;
        if (!marketStats[market]) marketStats[market] = { won: 0, total: 0, profit: 0 };
        marketStats[market].total++;
        if (p.actual === 'WON') marketStats[market].won++;
        marketStats[market].profit += p.profit || 0;
    });

    Object.entries(marketStats).forEach(([market, stats]) => {
        if (stats.total >= 3) {
            const winRate = (stats.won / stats.total) * 100;
            if (winRate > 60 || winRate < 40) {
                patterns.push({
                    type: 'team',
                    key: market,
                    winRate,
                    total: stats.total,
                    profit: stats.profit,
                    description: winRate > 60 
                        ? `Statistically significant edge identified in ${market} pricing models.`
                        : `A systemic leak of value in ${market} forecasts. Immediate parameter review advised.`
                });
            }
        }
    });

    return patterns.sort((a, b) => Math.abs(b.winRate - 50) - Math.abs(a.winRate - 50));
}
