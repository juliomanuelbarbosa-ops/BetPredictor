import { footballData } from './mockData';

// --- SERVICE REGISTRY ---
export const getApiKey = (envVar: string, fallback: string = "") => {
    if (typeof window !== 'undefined') {
        const local = localStorage.getItem(envVar);
        if (local) return local;
    }
    return (import.meta as any).env[envVar] || fallback;
};

export const API_KEYS = {
    get ODDS() { return getApiKey("VITE_ODDS_API_KEY", "7e8903b0f86e4bff14b6ba1df2d860a724e2adb3e69d8ae3eaaf4dbdfaae6023"); },
    get BYTEZ() { return getApiKey("VITE_BYTEZ_API_KEY", "e6eb939af9210a143459fbdf38262663"); },
    get WEATHER() { return getApiKey("VITE_OPENWEATHER_KEY", "12bd58096ee6939132a07606372444174"); },
    get OPENAI() { return getApiKey("VITE_OPENAI_API_KEY"); },
    get ANTHROPIC() { return getApiKey("VITE_ANTHROPIC_API_KEY"); },
    get GEMINI() { return getApiKey("VITE_GEMINI_API_KEY"); },
    get SPORTMONKS() { return getApiKey("VITE_SPORTMONKS_API_KEY"); },
    get API_FOOTBALL() { return getApiKey("VITE_API_FOOTBALL_KEY"); },
    get ACCUWEATHER() { return getApiKey("VITE_ACCUWEATHER_API_KEY"); },
    get WEATHERSTACK() { return getApiKey("VITE_WEATHERSTACK_API_KEY"); },
    get RAPIDAPI() { return getApiKey("VITE_RAPIDAPI_KEY"); },
    get SPORTRADAR() { return getApiKey("VITE_SPORTRADAR_API_KEY"); },
    get PANDASCORE() { return getApiKey("VITE_PANDASCORE_API_KEY"); },
    get MISTRAL() { return getApiKey("VITE_MISTRAL_API_KEY"); },
    get PERPLEXITY() { return getApiKey("VITE_PERPLEXITY_API_KEY"); },
    get GROQ() { return getApiKey("VITE_GROQ_API_KEY"); },
    get NEWSAPI() { return getApiKey("VITE_NEWSAPI_KEY"); },
    get X_API() { return getApiKey("VITE_X_API_KEY"); },
    get OPENROUTER() { return getApiKey("VITE_OPENROUTER_API_KEY"); },
};

export const getActiveServicesCount = () => {
    return Object.values(API_KEYS).filter(k => k && k.length > 10).length;
};

export const MOCK_GAMES = [
    { id: "mock-1", home: "Arsenal", away: "Liverpool", commence_time: new Date(Date.now() + 3600000).toISOString(), league: "Premier League", oddsH: 2.45, oddsD: 3.40, oddsA: 2.80, isMock: true },
    { id: "mock-2", home: "Real Madrid", away: "Barcelona", commence_time: new Date(Date.now() + 7200000).toISOString(), league: "La Liga", oddsH: 2.10, oddsD: 3.60, oddsA: 3.20, isMock: true },
    { id: "mock-3", home: "Bayern Munich", away: "Dortmund", commence_time: new Date(Date.now() + 10800000).toISOString(), league: "Bundesliga", oddsH: 1.65, oddsD: 4.20, oddsA: 4.50, isMock: true },
    { id: "mock-4", home: "Inter Milan", away: "Juventus", commence_time: new Date(Date.now() + 14400000).toISOString(), league: "Serie A", oddsH: 2.25, oddsD: 3.20, oddsA: 3.10, isMock: true },
    { id: "mock-5", home: "PSG", away: "Marseille", commence_time: new Date(Date.now() + 18000000).toISOString(), league: "Ligue 1", oddsH: 1.45, oddsD: 4.50, oddsA: 6.50, isMock: true },
    { id: "mock-6", home: "Man City", away: "Man Utd", commence_time: new Date(Date.now() + 21600000).toISOString(), league: "Premier League", oddsH: 1.35, oddsD: 5.20, oddsA: 8.00, isMock: true }
];

/**
 * Robust fetch wrapper with exponential backoff for rate limits.
 */
async function secureFetch(url: string, options: any = {}, providerName: string = "API") {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
        try {
            const response = await fetch(url, options);

            // Handle Unauthorized (401)
            if (response.status === 401) {
                throw new Error(`AUTH_ERROR: [${providerName}] API key is not valid.`);
            }

            // Handle Rate Limiting (429 Too Many Requests)
            if (response.status === 429) {
                console.warn(`[${providerName}] Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries--;
                delay *= 2; // Exponential backoff
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`${providerName} Error (${response.status}): ${errorData.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error: any) {
            if (retries <= 1) throw error;
            console.warn(`[${providerName}] Fetch attempt failed. Retrying in ${delay}ms...`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
            delay *= 2;
        }
    }
    throw new Error(`${providerName} failed after multiple retries.`);
}

export async function getWeather(city: string) {
    // Cooperative Weather Fetching with Fallbacks
    const fetchers = [
        async () => {
            if (!API_KEYS.WEATHER) throw new Error('No OpenWeather key');
            const d = await secureFetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEYS.WEATHER}&units=metric`, {}, 'OpenWeather');
            return { temp: Math.round(d.main.temp), humidity: d.main.humidity, wind_speed: d.wind.speed, rain: d.rain?.['1h'] || 0, provider: 'OpenWeather' };
        },
        async () => {
            if (!API_KEYS.WEATHERSTACK) throw new Error('No Weatherstack key');
            const d = await secureFetch(`http://api.weatherstack.com/current?access_key=${API_KEYS.WEATHERSTACK}&query=${encodeURIComponent(city)}`, {}, 'Weatherstack');
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
            try {
                const data = await secureFetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${API_KEYS.ODDS}&regions=eu`, {}, 'The Odds API');
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
            } catch (e: any) {
                if (e.message?.includes('AUTH_ERROR')) {
                    console.error("Odds API Auth Error:", e.message);
                    throw e; // Don't try other fetchers if it's an auth error
                }
                throw e;
            }
        },
        async () => {
            if (!API_KEYS.SPORTMONKS) throw new Error('No Sportmonks key');
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

export async function fetchH2HStats(homeId: number, awayId: number) {
    const apiKey = API_KEYS.API_FOOTBALL;
    if (!apiKey) return footballData.getH2H("Team A", "Team B"); // Fallback to mock

    try {
        const data = await secureFetch(
            `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeId}-${awayId}&last=5`,
            {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            },
            'API-Football H2H'
        );
        return data.response;
    } catch (e) {
        console.error("H2H fetch failed:", e);
        return null;
    }
}

export async function fetchMatchLineups(fixtureId: number) {
    const apiKey = API_KEYS.API_FOOTBALL;
    if (!apiKey) return null;

    try {
        const data = await secureFetch(
            `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`,
            {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            },
            'API-Football Lineups'
        );
        return data.response;
    } catch (e) {
        console.error("Lineups fetch failed:", e);
        return null;
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
    return {
        keyPlayerForm: 5 + Math.random() * 4,
        injuryImpact: Math.random() * 4,
        disciplineImpact: Math.random() * 2
    };
}

export async function getAdvancedMetrics(team: string) {
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

export async function fetchNews(home: string, away: string) {
    if (!API_KEYS.NEWSAPI) return "No NewsAPI key configured. Assuming standard conditions.";
    try {
        const query = encodeURIComponent(`${home} OR ${away} football injury OR transfer`);
        const res = await secureFetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=3&apiKey=${API_KEYS.NEWSAPI}`, {}, 'NewsAPI');
        if (res.articles && res.articles.length > 0) {
            return res.articles.map((a: any) => `- ${a.title}`).join('\n');
        }
        return "No significant recent news found.";
    } catch (e) {
        return "Failed to fetch news.";
    }
}

export async function getComprehensiveMatchData(home: string, away: string, league: string) {
    // Run multiple API calls in parallel to improve API cooperation and integration
    const [weather, odds, homeAdv, awayAdv, news] = await Promise.all([
        getWeather(home).catch(() => ({ temp: 15, wind_speed: 5, rain: 0, provider: 'Fallback' })),
        getRealOdds(home, away, league).catch(() => ({ avgH: 2.5, avgD: 3.0, avgA: 2.8, provider: 'Fallback' })),
        getAdvancedMetrics(home),
        getAdvancedMetrics(away),
        fetchNews(home, away).catch(() => "No recent news.")
    ]);

    return {
        weather,
        odds,
        h2h: footballData.getH2H(home, away),
        homeAdv,
        awayAdv,
        news
    };
}

export async function getUpcomingGames() {
    const leagues = [
        "soccer_epl", "soccer_germany_bundesliga", "soccer_spain_la_liga", "soccer_italy_serie_a",
        "soccer_france_ligue_one", "soccer_uefa_champions_league", "soccer_uefa_europa_league",
        "soccer_portugal_primeira_liga", "soccer_netherlands_ere_divisie", "soccer_brazil_campeonato",
        "soccer_mexico_liga_mx", "soccer_usa_mls", "soccer_belgium_first_division",
        "soccer_turkey_super_league", "soccer_austria_bundesliga", "soccer_denmark_superliga",
        "soccer_switzerland_superleague", "soccer_poland_ekstraklasa", "soccer_russia_premier_league"
    ];
    
    const allMatches: any[] = [];
    let errorCount = 0;
    
    try {
        if (!API_KEYS.ODDS || API_KEYS.ODDS.length < 10) {
            return MOCK_GAMES;
        }

        const promises = leagues.map(async (league) => {
            try {
                const data = await secureFetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${API_KEYS.ODDS}&regions=eu&markets=h2h`, {}, `The Odds API (${league})`);
                return data;
            } catch (e: any) {
                if (e.message?.includes('AUTH_ERROR')) {
                    throw e;
                }
                console.error(`Failed to fetch odds for ${league}:`, e);
                errorCount++;
                return [];
            }
        });
        
        const results = await Promise.all(promises);
        results.forEach((leagueMatches: any) => {
            if (Array.isArray(leagueMatches)) {
                leagueMatches.forEach((match: any) => {
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
            return MOCK_GAMES;
        }
        
        return allMatches.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
    } catch (e: any) {
        if (e.message?.includes('AUTH_ERROR')) {
            console.warn("Odds API Authentication failed. Switching to tactical simulation mode (Mock Data).");
        } else {
            console.error("Global upcoming games fetch failed:", e);
        }
        return MOCK_GAMES;
    }
}

export async function getSimulationReviews(matchInput: string, combatResult: any) {
    const reviews: { provider: string, review: string }[] = [];
    const prompt = `A Monte Carlo simulation (10,000 iterations) was just run for the match: ${matchInput}.
The results are:
Home Win Probability: ${combatResult.homeWins.toFixed(1)}%
Draw Probability: ${combatResult.draws.toFixed(1)}%
Away Win Probability: ${combatResult.awayWins.toFixed(1)}%
Most Likely Score: ${combatResult.mostLikelyScore}

Please provide a brief, 2-3 sentence expert review of these results. What is the best betting angle?`;

    const systemPrompt = "You are an expert sports betting analyst.";

    const promises = [];

    if (API_KEYS.GEMINI) {
        promises.push((async () => {
            try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey: API_KEYS.GEMINI });
                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: prompt,
                    config: { systemInstruction: systemPrompt }
                });
                reviews.push({ provider: 'Google Gemini', review: response.text || "No response." });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.OPENAI) {
        promises.push((async () => {
            try {
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${API_KEYS.OPENAI}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] })
                });
                const data = await res.json();
                if (data.choices) reviews.push({ provider: 'OpenAI', review: data.choices[0].message.content });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.ANTHROPIC) {
        promises.push((async () => {
            try {
                const res = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: { 
                        "x-api-key": API_KEYS.ANTHROPIC, 
                        "anthropic-version": "2023-06-01",
                        "anthropic-dangerously-allow-browser": "true",
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify({ 
                        model: "claude-3-haiku-20240307", 
                        max_tokens: 150,
                        system: systemPrompt,
                        messages: [{ role: "user", content: prompt }] 
                    })
                });
                const data = await res.json();
                if (data.content) reviews.push({ provider: 'Anthropic', review: data.content[0].text });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.GROQ) {
        promises.push((async () => {
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${API_KEYS.GROQ}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] })
                });
                const data = await res.json();
                if (data.choices) reviews.push({ provider: 'Groq', review: data.choices[0].message.content });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.MISTRAL) {
        promises.push((async () => {
            try {
                const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${API_KEYS.MISTRAL}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] })
                });
                const data = await res.json();
                if (data.choices) reviews.push({ provider: 'Mistral AI', review: data.choices[0].message.content });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.OPENROUTER) {
        promises.push((async () => {
            try {
                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${API_KEYS.OPENROUTER}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "meta-llama/llama-3-8b-instruct:free", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] })
                });
                const data = await res.json();
                if (data.choices) reviews.push({ provider: 'OpenRouter', review: data.choices[0].message.content });
            } catch (e) { console.error(e); }
        })());
    }

    if (API_KEYS.BYTEZ) {
        promises.push((async () => {
            try {
                const res = await fetch("https://api.bytez.com/models/v2/meta-llama/Meta-Llama-3-8B-Instruct", {
                    method: "POST",
                    headers: { "Authorization": `Key ${API_KEYS.BYTEZ}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] })
                });
                const data = await res.json();
                if (data.output) reviews.push({ provider: 'Bytez', review: data.output.content });
            } catch (e) { console.error(e); }
        })());
    }

    await Promise.all(promises);
    return reviews;
}

export async function getBytezAnalysis(home: string, away: string, weather: any, odds: any, betstack: any): Promise<{ category: string, market: string, confidence: number, report: string, provider: string }> {
    const systemPrompt = `You are an expert sports betting quantitative analyst. 
Analyze the match and recommend the best betting market.
Provide your response in STRICTLY valid JSON format with four keys:
- "category": (string) The category of the market.
- "market": (string) The specific bet to place.
- "confidence": (number) A confidence score from 1 to 100.
- "report": (string) A serious, detailed 3-4 sentence explanation.`;

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
