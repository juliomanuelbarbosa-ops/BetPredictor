import { footballData } from './data';

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

export async function getPlayerMetrics(team: string) {
    // In a real application, this would fetch from a sports data API (e.g., Sportmonks, API-Football)
    // to get live injury lists, suspension data, and key player recent ratings.
    // For this demonstration, we simulate realistic metrics.
    
    // keyPlayerForm: 0-10 scale (higher is better)
    // injuryImpact: 0-10 scale (higher means more negative impact on the team)
    // disciplineImpact: 0-10 scale (higher means more negative impact, e.g., key suspensions)
    
    return {
        keyPlayerForm: 5 + Math.random() * 4, // 5 to 9
        injuryImpact: Math.random() * 4, // 0 to 4
        disciplineImpact: Math.random() * 2 // 0 to 2
    };
}

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY || "e6eb939af9210a143459fbdf38262663";

export async function getBytezAnalysis(home: string, away: string, weather: any, odds: any, betstack: any): Promise<{ market: string, confidence: number, report: string }> {
    try {
        const h2h = footballData.getH2H(home, away);
        const homeForm = footballData.getTeamForm(home);
        const awayForm = footballData.getTeamForm(away);
        
        // Mock possession since it's not in the CSV, but we use real shots on target and cards
        const homePossession = 45 + Math.random() * 10;
        const awayPossession = 100 - homePossession;
        
        const res = await fetch("https://api.bytez.com/models/v2/meta-llama/Meta-Llama-3-8B-Instruct", {
            method: "POST",
            headers: {
                "Authorization": `Key ${BYTEZ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert sports betting quantitative analyst. 
Analyze the match and recommend the best betting market (e.g., 1X2, Over/Under 2.5 Goals, Both Teams to Score, Asian Handicap).
Provide your response in STRICTLY valid JSON format with three keys:
- "market": (string) The specific bet to place (e.g., "Over 2.5 Goals", "Home Win", "BTTS - Yes").
- "confidence": (number) A confidence score from 1 to 100.
- "report": (string) A serious, detailed 3-4 sentence explanation of why this market was chosen. Consider weather conditions, odds value, and tactical matchups. Do not include any markdown formatting or extra text outside the JSON.`
                    },
                    {
                        role: "user",
                        content: `Match: ${home} vs ${away}. Weather: ${weather.temp}°C, Wind: ${weather.wind_speed}m/s. Odds: Home ${odds.avgH}, Draw ${odds.avgD}, Away ${odds.avgA}. Average Expected Goals: ${betstack.avgTotal.toFixed(2)}. Recent Head-to-Head (last 5): ${home} Wins: ${h2h.homeWins}, ${away} Wins: ${h2h.awayWins}, Draws: ${h2h.draws}.
Recent Form (Last 5 matches):
${home}: Avg Possession: ${homePossession.toFixed(1)}%, Avg Shots on Target: ${homeForm.sot.toFixed(1)}, Yellow Cards: ${Math.round(homeForm.yc)}, Red Cards: ${Math.round(homeForm.rc)}.
${away}: Avg Possession: ${awayPossession.toFixed(1)}%, Avg Shots on Target: ${awayForm.sot.toFixed(1)}, Yellow Cards: ${Math.round(awayForm.yc)}, Red Cards: ${Math.round(awayForm.rc)}.`
                    }
                ]
            })
        });
        
        if (!res.ok) throw new Error("Bytez API failed");
        const data = await res.json();
        const content = data.output?.content || "{}";
        
        let jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        return {
            market: parsed.market || "1X2",
            confidence: parsed.confidence || 50,
            report: parsed.report || "Neutral tactical matchup expected."
        };
    } catch (e) {
        console.error("Bytez error:", e);
        return {
            market: "1X2",
            confidence: 50,
            report: "Neutral tactical matchup expected. Data insufficient for deep analysis."
        };
    }
}
