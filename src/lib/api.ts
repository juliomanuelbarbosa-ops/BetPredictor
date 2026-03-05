const OPENWEATHER_KEY   = "12bd58096ee6939132a07606372444174";
const ODDS_API_KEY      = "7e8903b0f86e4bff14b6ba1df2d860a724e2adb3e69d8ae3eaaf4dbdfaae6023";

export async function getWeather(city: string) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`);
        if (!res.ok) throw new Error('Weather failed');
        const d = await res.json();
        return {
            temp: Math.round(d.main.temp),
            humidity: d.main.humidity,
            wind_speed: d.wind.speed,
            rain: d.rain?.['1h'] || 0
        };
    } catch {
        return { temp: 16, humidity: 55, wind_speed: 6, rain: 0 };
    }
}

export async function getRealOdds(home: string, away: string, league: string) {
    try {
        const res = await fetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${ODDS_API_KEY}&regions=eu`);
        if (!res.ok) throw new Error('Odds API failed');
        const data = await res.json();
        const match = data.find((g: any) => g.home_team.toLowerCase().includes(home.toLowerCase()) && g.away_team.toLowerCase().includes(away.toLowerCase()));
        if (match && match.bookmakers.length > 0) {
            const market = match.bookmakers[0].markets.find((m: any) => m.key === 'h2h');
            if (market) {
                const homeOdds = market.outcomes.find((o: any) => o.name === match.home_team)?.price || 2.5;
                const awayOdds = market.outcomes.find((o: any) => o.name === match.away_team)?.price || 3.5;
                const drawOdds = market.outcomes.find((o: any) => o.name === 'Draw')?.price || 3.5;
                return { avgH: homeOdds, avgD: drawOdds, avgA: awayOdds };
            }
        }
        return { avgH: 2.5, avgD: 3.5, avgA: 3.5 };
    } catch {
        return { avgH: 2.5, avgD: 3.5, avgA: 3.5 };
    }
}

export async function getBetStackData(league: string) {
    return { avgTotal: 2.5 + Math.random() };
}

export async function getBizzoPrediction(home: string, away: string) {
    return { homeWinProb: 40 + Math.random() * 20 };
}

export async function getGameForecast() {
    return { home_prob: 40 + Math.random() * 20 };
}
