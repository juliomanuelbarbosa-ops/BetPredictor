import { footballData } from './data';

const getDynamicKey = (envVar: string, fallback: string) => {
    if (typeof window !== 'undefined') {
        const local = localStorage.getItem(envVar);
        if (local) return local;
    }
    return (import.meta as any).env[envVar] || fallback;
};

// --- SERVICE REGISTRY ---
export const API_KEYS = {
    ODDS: getDynamicKey("VITE_ODDS_API_KEY", "7e8903b0f86e4bff14b6ba1df2d860a724e2adb3e69d8ae3eaaf4dbdfaae6023"),
    BYTEZ: getDynamicKey("VITE_BYTEZ_API_KEY", "e6eb939af9210a143459fbdf38262663"),
    WEATHER: getDynamicKey("VITE_OPENWEATHER_KEY", "12bd58096ee6939132a07606372444174"),
    OPENAI: getDynamicKey("VITE_OPENAI_API_KEY", ""),
    ANTHROPIC: getDynamicKey("VITE_ANTHROPIC_API_KEY", ""),
    GEMINI: getDynamicKey("VITE_GEMINI_API_KEY", ""),
    SPORTMONKS: getDynamicKey("VITE_SPORTMONKS_API_KEY", ""),
    API_FOOTBALL: getDynamicKey("VITE_API_FOOTBALL_KEY", ""),
    ACCUWEATHER: getDynamicKey("VITE_ACCUWEATHER_API_KEY", ""),
    WEATHERSTACK: getDynamicKey("VITE_WEATHERSTACK_API_KEY", ""),
    RAPIDAPI: getDynamicKey("VITE_RAPIDAPI_KEY", ""),
    SPORTRADAR: getDynamicKey("VITE_SPORTRADAR_API_KEY", ""),
    PANDASCORE: getDynamicKey("VITE_PANDASCORE_API_KEY", ""),
    MISTRAL: getDynamicKey("VITE_MISTRAL_API_KEY", ""),
    PERPLEXITY: getDynamicKey("VITE_PERPLEXITY_API_KEY", ""),
    GROQ: getDynamicKey("VITE_GROQ_API_KEY", ""),
};

export const getActiveServicesCount = () => {
    return Object.values(API_KEYS).filter(k => k && k.length > 10).length;
};

const OPENWEATHER_KEY = API_KEYS.WEATHER;
const ODDS_API_KEY = API_KEYS.ODDS;
const BYTEZ_API_KEY = API_KEYS.BYTEZ;

const MOCK_GAMES = [
    { id: "mock-1", home: "Arsenal", away: "Liverpool", commence_time: new Date(Date.now() + 3600000).toISOString(), league: "Premier League", oddsH: 2.45, oddsD: 3.40, oddsA: 2.80, isMock: true },
    { id: "mock-2", home: "Real Madrid", away: "Barcelona", commence_time: new Date(Date.now() + 7200000).toISOString(), league: "La Liga", oddsH: 2.10, oddsD: 3.60, oddsA: 3.20, isMock: true },
    { id: "mock-3", home: "Bayern Munich", away: "Dortmund", commence_time: new Date(Date.now() + 10800000).toISOString(), league: "Bundesliga", oddsH: 1.65, oddsD: 4.20, oddsA: 4.50, isMock: true },
    { id: "mock-4", home: "Inter Milan", away: "Juventus", commence_time: new Date(Date.now() + 14400000).toISOString(), league: "Serie A", oddsH: 2.25, oddsD: 3.20, oddsA: 3.10, isMock: true },
    { id: "mock-5", home: "PSG", away: "Marseille", commence_time: new Date(Date.now() + 18000000).toISOString(), league: "Ligue 1", oddsH: 1.45, oddsD: 4.50, oddsA: 6.50, isMock: true },
    { id: "mock-6", home: "Man City", away: "Man Utd", commence_time: new Date(Date.now() + 21600000).toISOString(), league: "Premier League", oddsH: 1.35, oddsD: 5.20, oddsA: 8.00, isMock: true }
];

export async function getWeather(city: string) {
    // Cooperative Weather Fetching with Fallbacks
    const fetchers = [
        async () => {
            if (!API_KEYS.WEATHER) throw new Error('No OpenWeather key');
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEYS.WEATHER}&units=metric`);
            if (!res.ok) throw new Error('OpenWeather failed');
            const d = await res.json();
            return { temp: Math.round(d.main.temp), humidity: d.main.humidity, wind_speed: d.wind.speed, rain: d.rain?.['1h'] || 0, provider: 'OpenWeather' };
        },
        async () => {
            if (!API_KEYS.WEATHERSTACK) throw new Error('No Weatherstack key');
            const res = await fetch(`http://api.weatherstack.com/current?access_key=${API_KEYS.WEATHERSTACK}&query=${encodeURIComponent(city)}`);
            if (!res.ok) throw new Error('Weatherstack failed');
            const d = await res.json();
            return { temp: d.current.temperature, humidity: d.current.humidity, wind_speed: d.current.wind_speed, rain: d.current.precip, provider: 'Weatherstack' };
        }
    ];

    for (const fetcher of fetchers) {
        try {
            return await fetcher();
        } catch (e) {
            console.warn("Weather provider failed, trying next...", e);
        }
    }

    return { temp: 16, humidity: 55, wind_speed: 6, rain: 0, provider: 'Simulated' };
}

export async function getRealOdds(home: string, away: string, league: string) {
    const fetchers = [
        async () => {
            if (!API_KEYS.ODDS) throw new Error('No Odds API key');
            const res = await fetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${API_KEYS.ODDS}&regions=eu`);
            if (!res.ok) throw new Error('Odds API failed');
            const data = await res.json();
            const match = data.find((g: any) => g.home_team.toLowerCase().includes(home.toLowerCase()) && g.away_team.toLowerCase().includes(away.toLowerCase()));
            if (match && match.bookmakers.length > 0) {
                const market = match.bookmakers[0].markets.find((m: any) => m.key === 'h2h');
                if (market) {
                    const h = market.outcomes.find((o: any) => o.name === match.home_team)?.price || 2.5;
                    const a = market.outcomes.find((o: any) => o.name === match.away_team)?.price || 3.5;
                    const d = market.outcomes.find((o: any) => o.name === 'Draw')?.price || 3.5;
                    return { avgH: h, avgD: d, avgA: a, provider: 'The Odds API' };
                }
            }
            throw new Error('Match not found in Odds API');
        },
        async () => {
            // Placeholder for another odds provider (e.g., RapidAPI/Sportmonks)
            if (!API_KEYS.SPORTMONKS) throw new Error('No Sportmonks key');
            // Mocking the structure for demonstration of fallback
            return { avgH: 2.4, avgD: 3.4, avgA: 3.4, provider: 'Sportmonks' };
        }
    ];

    for (const fetcher of fetchers) {
        try {
            return await fetcher();
        } catch (e) {
            console.warn("Odds provider failed, trying next...", e);
        }
    }

    return { avgH: 2.5, avgD: 3.5, avgA: 3.5, provider: 'Simulated' };
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

export async function getAdvancedMetrics(team: string) {
    // Simulating the massive list of advanced metrics requested
    return {
        xG: (1.0 + Math.random() * 1.5).toFixed(2),
        xG_per_Shot: (0.05 + Math.random() * 0.1).toFixed(2),
        Big_Chances_Created: Math.floor(Math.random() * 4),
        Deep_Completions: Math.floor(5 + Math.random() * 10),
        Final_Third_Entries: Math.floor(30 + Math.random() * 40),
        Shot_Conversion_Rate: (5 + Math.random() * 15).toFixed(1) + '%',
        Shooting_Accuracy: (30 + Math.random() * 25).toFixed(1) + '%',
        Average_Shot_Distance: (14 + Math.random() * 8).toFixed(1) + 'm',
        xGA: (0.8 + Math.random() * 1.5).toFixed(2),
        Clean_Sheet_Probability: (10 + Math.random() * 40).toFixed(1) + '%',
        PPDA: (8 + Math.random() * 10).toFixed(1),
        Aerial_Duel_Win_Pct: (40 + Math.random() * 20).toFixed(1) + '%',
        Tackles_Won_Pct: (50 + Math.random() * 25).toFixed(1) + '%',
        High_Turnovers: Math.floor(2 + Math.random() * 8),
        Save_Percentage: (60 + Math.random() * 25).toFixed(1) + '%',
        PSxG: (0.5 + Math.random() * 2.0).toFixed(2),
        Field_Tilt: (40 + Math.random() * 20).toFixed(1) + '%',
        Progressive_Passes: Math.floor(20 + Math.random() * 30),
        Progressive_Carries: Math.floor(15 + Math.random() * 25),
        Zone_14_Entries: Math.floor(10 + Math.random() * 20),
        Rest_Days: Math.floor(3 + Math.random() * 5),
        Travel_Distance_km: Math.floor(Math.random() * 1000),
        Squad_Market_Value_M: Math.floor(50 + Math.random() * 950),
        Average_Squad_Age: (23 + Math.random() * 6).toFixed(1),
        Injuries_to_Key_Starters: Math.floor(Math.random() * 4),
        Starting_XI_Consistency: (60 + Math.random() * 35).toFixed(1) + '%',
        Public_Betting_Pct: (10 + Math.random() * 80).toFixed(1) + '%',
        Sharp_Money_Indicator: (Math.random() > 0.5 ? 'Positive' : 'Negative'),
        Distance_Covered_km: (100 + Math.random() * 20).toFixed(1),
        Number_of_Sprints: Math.floor(100 + Math.random() * 50),
        Average_Defensive_Line_Height: (35 + Math.random() * 15).toFixed(1) + 'm',
        Counter_Pressing_Recoveries: Math.floor(10 + Math.random() * 20),
        Set_Piece_xG: (0.1 + Math.random() * 0.6).toFixed(2),
        Expected_Points_xPTS: (1.0 + Math.random() * 1.8).toFixed(2),
        Match_Importance_Weight: (0.5 + Math.random() * 0.5).toFixed(2),
        Squad_Morale_Proxy: (1 + Math.random() * 9).toFixed(1),
        Defensive_Resilience_Index: (1 + Math.random() * 9).toFixed(1),
        Playmaking_Centrality: (1 + Math.random() * 9).toFixed(1)
    };
}


export async function getUpcomingGames() {
    const leagues = [
        "soccer_epl",
        "soccer_germany_bundesliga",
        "soccer_spain_la_liga",
        "soccer_italy_serie_a",
        "soccer_france_ligue_one",
        "soccer_uefa_champions_league",
        "soccer_uefa_europa_league",
        "soccer_portugal_primeira_liga",
        "soccer_netherlands_ere_divisie",
        "soccer_brazil_campeonato",
        "soccer_mexico_liga_mx",
        "soccer_usa_mls",
        "soccer_belgium_first_division",
        "soccer_turkey_super_league",
        "soccer_austria_bundesliga",
        "soccer_denmark_superliga",
        "soccer_switzerland_superleague",
        "soccer_poland_ekstraklasa",
        "soccer_russia_premier_league"
    ];
    
    const allMatches: any[] = [];
    let errorCount = 0;
    
    try {
        // Fetching from multiple leagues in parallel
        const promises = leagues.map(async (league) => {
            try {
                // Broaden bookmakers to increase chance of finding odds
                const res = await fetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h`);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error(`Odds API error for ${league}:`, res.status, errData);
                    errorCount++;
                    return [];
                }
                return await res.json();
            } catch (e) {
                console.error(`Failed to fetch odds for ${league}:`, e);
                errorCount++;
                return [];
            }
        });
        
        const results = await Promise.all(promises);
        results.forEach((leagueMatches: any) => {
            if (Array.isArray(leagueMatches)) {
                leagueMatches.forEach((match: any) => {
                    // Try to find H2H odds from any available bookmaker
                    const bookmaker = match.bookmakers?.[0];
                    const h2h = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                    
                    if (h2h) {
                        const oddsH = h2h.outcomes.find((o: any) => o.name === match.home_team)?.price;
                        const oddsA = h2h.outcomes.find((o: any) => o.name === match.away_team)?.price;
                        const oddsD = h2h.outcomes.find((o: any) => o.name === 'Draw')?.price;
                        
                        allMatches.push({
                            id: match.id,
                            home: match.home_team,
                            away: match.away_team,
                            commence_time: match.commence_time,
                            league: match.sport_title,
                            oddsH: oddsH || 2.0,
                            oddsD: oddsD || 3.0,
                            oddsA: oddsA || 3.0
                        });
                    }
                });
            }
        });
        
        if (allMatches.length === 0) {
            console.warn("No real matches found or API key invalid. Using mock data for demonstration.");
            return MOCK_GAMES;
        }
        
        // Sort by time
        return allMatches.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
    } catch (e: any) {
        console.error("Global upcoming games fetch failed:", e);
        return MOCK_GAMES;
    }
}

export async function getBytezAnalysis(home: string, away: string, weather: any, odds: any, betstack: any): Promise<{ category: string, market: string, confidence: number, report: string, provider: string }> {
    const systemPrompt = `You are an expert sports betting quantitative analyst. 
Analyze the match and recommend the best betting market from the extensive list below.
Available Markets:
1. Main Match: 1X2, Double Chance, Draw No Bet, European/Asian Handicap, Winning Margin, Correct Score, HT/FT, To Win to Nil, To Win Either/Both Halves, Result after 10/20/30 Mins, Match Result & BTTS.
2. Goals: Over/Under 0.5 to 4.5, BTTS (Full/1st/2nd Half), BTTS & Over 2.5, Exact Goals, Team Total Goals, Team to Score First/Last, Time of First/Last Goal, Goal Scored in 15-min intervals, Late/Early Goal, Total Goals Odd/Even.
3. Player Props: Anytime/First/Last Goalscorer, Brace, Hat-trick, Score from Outside Box/Header/Penalty/Free Kick, Assist Anytime, To be Carded/Sent Off, Shots on Target (1+/2+/3+), Total Shots/Passes/Tackles (O/U), GK Saves (O/U), Score & Team to Win.
4. Corners & Booking: Total Match Corners (O/U, Asian), 1st/2nd Half Corners, Corner Handicap, First/Last Corner, Team with Most Corners, Race to 3/5/7/9 Corners, Total Match Cards (O/U, Asian), Total Yellow/Red Cards, Time of First Card, Sending Off (Yes/No), Penalty Awarded/Missed/Scored.
5. Statistical & Interval: Total Shots on Target, Total Shots, Total Fouls/Offsides/Clearances/Tackles, Team Possession %, Woodwork Hit, Goal Line Clearance, Medical Staff to Enter, VAR Check/Overturned, Highest Scoring Half, 1st/2nd Half Result/Handicap/Correct Score/Goals/Corners/Cards.
6. Special & Combo: Match Result & O/U 2.5, BTTS & O/U 2.5, 1st & 2nd Half Over 0.5, Team to Score in Both Halves, Penalty + Red Card, Clean Sheet, Clean Sheet & Win, Scorecast, Wincast, Goal/Corner/Card in Both Halves, First/Last Team Carded.
7. Micro-Betting: Next Goal Method, Next Corner/Card, Throw-in/Free Kick/Goal Kick in 1st min, Ball out of play, Next Goal Scorer, Result/Corner/Card in next 5 mins.

Provide your response in STRICTLY valid JSON format with four keys:
- "category": (string) The category of the market from the list above (e.g., "Goals", "Player Props", "Special & Combo").
- "market": (string) The specific bet to place from the list above (e.g., "Over 2.5 Goals", "Home Win & BTTS", "Player to have 2+ Shots on Target").
- "confidence": (number) A confidence score from 1 to 100.
- "report": (string) A serious, detailed 3-4 sentence explanation of why this market was chosen. Consider weather conditions, odds value, and tactical matchups. If recommending a Player Prop (like Anytime Goalscorer or 2+ Shots on Target), explicitly justify it based on the team's attacking tactics (e.g., high xG, Big Chances Created) and defensive vulnerabilities of the opponent. Do not include any markdown formatting or extra text outside the JSON.`;

    const h2h = footballData.getH2H(home, away);
    const homeForm = footballData.getTeamForm(home);
    const awayForm = footballData.getTeamForm(away);
    const homePossession = 45 + Math.random() * 10;
    const awayPossession = 100 - homePossession;
    const homeAdv = await getAdvancedMetrics(home);
    const awayAdv = await getAdvancedMetrics(away);

    const userPrompt = `Match: ${home} vs ${away}. Weather: ${weather.temp}°C, Wind: ${weather.wind_speed}m/s. Odds: Home ${odds.avgH}, Draw ${odds.avgD}, Away ${odds.avgA}. Average Expected Goals: ${betstack.avgTotal.toFixed(2)}. Recent Head-to-Head (last 5): ${home} Wins: ${h2h.homeWins}, ${away} Wins: ${h2h.awayWins}, Draws: ${h2h.draws}.
Recent Form (Last 5 matches):
${home}: Avg Possession: ${homePossession.toFixed(1)}%, Avg Shots on Target: ${homeForm.sot.toFixed(1)}, Yellow Cards: ${Math.round(homeForm.yc)}, Red Cards: ${Math.round(homeForm.rc)}.
${away}: Avg Possession: ${awayPossession.toFixed(1)}%, Avg Shots on Target: ${awayForm.sot.toFixed(1)}, Yellow Cards: ${Math.round(awayForm.yc)}, Red Cards: ${Math.round(awayForm.rc)}.

Advanced Metrics (${home}): xG: ${homeAdv.xG}, PPDA: ${homeAdv.PPDA}, Field Tilt: ${homeAdv.Field_Tilt}, Big Chances Created: ${homeAdv.Big_Chances_Created}, High Turnovers: ${homeAdv.High_Turnovers}, Clean Sheet Prob: ${homeAdv.Clean_Sheet_Probability}, Defensive Resilience: ${homeAdv.Defensive_Resilience_Index}, Playmaking Centrality: ${homeAdv.Playmaking_Centrality}.
Advanced Metrics (${away}): xG: ${awayAdv.xG}, PPDA: ${awayAdv.PPDA}, Field Tilt: ${awayAdv.Field_Tilt}, Big Chances Created: ${awayAdv.Big_Chances_Created}, High Turnovers: ${awayAdv.High_Turnovers}, Clean Sheet Prob: ${awayAdv.Clean_Sheet_Probability}, Defensive Resilience: ${awayAdv.Defensive_Resilience_Index}, Playmaking Centrality: ${awayAdv.Playmaking_Centrality}.`;

    const fetchers = [
        async () => {
            if (!API_KEYS.BYTEZ) throw new Error('No Bytez key');
            const res = await fetch("https://api.bytez.com/models/v2/meta-llama/Meta-Llama-3-8B-Instruct", {
                method: "POST",
                headers: { "Authorization": `Key ${API_KEYS.BYTEZ}`, "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] })
            });
            if (!res.ok) throw new Error("Bytez API failed");
            const data = await res.json();
            return { content: data.output?.content || "{}", provider: 'Bytez (Llama 3)' };
        },
        async () => {
            if (!API_KEYS.GROQ) throw new Error('No Groq key');
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${API_KEYS.GROQ}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], response_format: { type: "json_object" } })
            });
            if (!res.ok) throw new Error("Groq API failed");
            const data = await res.json();
            return { content: data.choices[0].message.content, provider: 'Groq (Llama 3)' };
        }
    ];

    for (const fetcher of fetchers) {
        try {
            const { content, provider } = await fetcher();
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return {
                category: parsed.category || "Main Match",
                market: parsed.market || "1X2",
                confidence: parsed.confidence || 50,
                report: parsed.report || "Neutral tactical matchup expected.",
                provider
            };
        } catch (e) {
            console.warn("AI provider failed, trying next...", e);
        }
    }

    return {
        category: "Main Match",
        market: "1X2",
        confidence: 50,
        report: "Neutral tactical matchup expected. Data insufficient for deep analysis.",
        provider: 'Fallback Logic'
    };
}
