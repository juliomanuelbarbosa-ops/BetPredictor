import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "../api/footballApi";

export interface AgentResponse {
    agent: string;
    data: any;
    summary: string;
}

export class NewsAgent {
    private ai: GoogleGenAI | null = null;

    private initAI() {
        const apiKey = getApiKey("VITE_GEMINI_API_KEY") || process.env.GEMINI_API_KEY!;
        this.ai = new GoogleGenAI({ apiKey });
    }

    async run(home: string, away: string, realNews: string = "No recent news."): Promise<AgentResponse> {
        this.initAI();
        const prompt = `Analyze current news, sentiment, and injury updates for ${home} vs ${away}. 
        Here is the latest real-time news data fetched from our APIs:
        ${realNews}
        
        Identify any critical late-breaking news that could impact the match outcome based on this data.
        Return a JSON object with: { "sentiment": "positive|negative|neutral", "injuries": ["list"], "summary": "short summary" }`;

        const response = await this.ai!.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        return {
            agent: "NEWS_AGENT",
            data,
            summary: data.summary || "No critical news detected."
        };
    }
}
