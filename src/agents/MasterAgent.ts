import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "../api/footballApi";
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

    async orchestrate(home: string, away: string, odds: any): Promise<OrchestrationResult> {
        this.initAI();
        
        // Run sub-agents in parallel
        const [newsResult, marketResult] = await Promise.all([
            this.newsAgent.run(home, away),
            this.marketAgent.run(odds)
        ]);

        const prompt = `You are the STRATOS Master Orchestrator. Synthesize the following reports:
        NEWS_AGENT: ${newsResult.summary}
        MARKET_AGENT: ${marketResult.summary}
        
        Determine if a highly profitable betting condition exists (e.g., market shift contradicts injury news).
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
