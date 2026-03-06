import { GoogleGenAI, Type } from "@google/genai";

export async function recognizeText(file: File): Promise<any[]> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'undefined') {
            throw new Error("Gemini API Key is missing. If you are running this locally, ensure you have GEMINI_API_KEY set in your .env file and rebuild the app.");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const base64EncodeString = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                if (typeof result === 'string') {
                    resolve(result.split(',')[1]);
                } else {
                    reject(new Error("Failed to read file as base64"));
                }
            };
            reader.onerror = () => reject(new Error("FileReader error"));
            reader.readAsDataURL(file);
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: file.type || "image/png",
                            data: base64EncodeString,
                        },
                    },
                    {
                        text: "Extract all football/soccer matches and their 1X2 betting odds from this image. \n" +
                              "Rules:\n" +
                              "1. Return a JSON array of objects with keys: home, away, oddsH, oddsD, oddsA, time.\n" +
                              "2. Convert all odds to DECIMAL format (e.g., 2.50). Handle fractional (5/2) or American (+150) if present.\n" +
                              "3. Use standard English team names (e.g., 'Bayern Munich', 'Real Madrid').\n" +
                              "4. If odds are missing for a match, estimate realistic odds based on the teams' perceived strength.\n" +
                              "5. If the image is a single match detail view, extract that one match.\n" +
                              "6. If no matches are found, return [].\n" +
                              "7. Do not include any text other than the JSON array.",
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            home: { type: Type.STRING },
                            away: { type: Type.STRING },
                            oddsH: { type: Type.NUMBER },
                            oddsD: { type: Type.NUMBER },
                            oddsA: { type: Type.NUMBER },
                            time: { type: Type.STRING },
                        },
                        required: ["home", "away", "oddsH", "oddsD", "oddsA"],
                    },
                },
            },
        });

        const jsonStr = response.text?.trim() || "[]";
        return JSON.parse(jsonStr);
    } catch (e: any) {
        console.error("Gemini Vision failed:", e);
        const msg = e.message || "Unknown error";
        if (msg.includes("API_KEY_INVALID") || msg.includes("API key not found")) {
            throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
        throw new Error(`Failed to extract matches: ${msg}`);
    }
}
