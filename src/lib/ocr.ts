import { GoogleGenAI, Type } from "@google/genai";

export async function recognizeText(file: File): Promise<any[]> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const base64EncodeString = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
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
                        text: "Extract all the football/soccer matches and their betting odds (1X2 or Home/Draw/Away) from this image. Return a JSON array of objects with keys: home (string), away (string), oddsH (number), oddsD (number), oddsA (number), time (string). If you can't find odds, estimate them based on the teams. If you can't find any matches, return an empty array. Ensure the team names are standard English names (e.g., 'Manchester United' instead of 'Man Utd').",
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
    } catch (e) {
        console.error("Gemini Vision failed:", e);
        throw new Error("Failed to extract matches from image. Please try a clearer screenshot.");
    }
}
