import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "../api/footballApi";
import { AgentResponse } from "./NewsAgent";

export class MarketAgent {
    private ai: GoogleGenAI | null = null;

    private initAI() {
        const apiKey = getApiKey("VITE_GEMINI_API_KEY") || process.env.GEMINI_API_KEY!;
        this.ai = new GoogleGenAI({ apiKey });
    }

    async run(odds: any): Promise<AgentResponse> {
        this.initAI();
        const prompt = `Analyze the following odds data for sudden line movements or sharp money indicators:
        ${JSON.stringify(odds)}
        Identify if there is a significant shift in favor of one team that contradicts public sentiment.
        Return a JSON object with: { "movement": "significant|stable", "direction": "home|away|draw", "summary": "short analysis" }`;

        const response = await this.ai!.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        return {
            agent: "MARKET_AGENT",
            data,
            summary: data.summary || "Market remains stable."
        };
    }
}
