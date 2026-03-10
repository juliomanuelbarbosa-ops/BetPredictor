import { GoogleGenAI } from "@google/genai";
import { getApiKey, getComprehensiveMatchData } from "../api/footballApi";
import { AgentResponse, NewsAgent } from "./NewsAgent";
import { MarketAgent } from "./MarketAgent";

export interface OrchestrationResult {
    news: AgentResponse;
    market: AgentResponse;
    master: {
        recommendation: string;
        confidence: number;
        shouldNotify: boolean;
        payload: any;
    };
}

export class MasterAgent {
    private ai: GoogleGenAI | null = null;
    private newsAgent = new NewsAgent();
    private marketAgent = new MarketAgent();

    private initAI() {
        const apiKey = getApiKey("VITE_GEMINI_API_KEY") || process.env.GEMINI_API_KEY!;
        this.ai = new GoogleGenAI({ apiKey });
    }

    async orchestrate(home: string, away: string, league: string): Promise<OrchestrationResult> {
        this.initAI();
        
        // Fetch comprehensive real-time data
        const matchData = await getComprehensiveMatchData(home, away, league);

        // Run sub-agents in parallel with real data
        const [newsResult, marketResult] = await Promise.all([
            this.newsAgent.run(home, away, matchData.news),
            this.marketAgent.run(matchData.odds)
        ]);

        const prompt = `You are the STRATOS Master Orchestrator. Synthesize the following reports and real-time data:
        MATCH: ${home} vs ${away}
        WEATHER: ${matchData.weather.temp}°C, Wind: ${matchData.weather.wind_speed}m/s
        H2H (Last 5): ${home} Wins: ${matchData.h2h.homeWins}, ${away} Wins: ${matchData.h2h.awayWins}, Draws: ${matchData.h2h.draws}
        
        NEWS_AGENT: ${newsResult.summary}
        MARKET_AGENT: ${marketResult.summary}
        
        Determine if a highly profitable betting condition exists (e.g., market shift contradicts injury news or weather).
        Return a JSON object with: 
        { 
            "recommendation": "specific bet recommendation", 
            "confidence": 0-100, 
            "shouldNotify": true|false,
            "notificationPayload": { "title": "Tactical Alert", "body": "message" }
        }`;

        const response = await this.ai!.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        
        return {
            news: newsResult,
            market: marketResult,
            master: {
                recommendation: data.recommendation,
                confidence: data.confidence,
                shouldNotify: data.shouldNotify,
                payload: data.notificationPayload
            }
        };
    }
}

export const orchestrator = new MasterAgent();
