import { GoogleGenAI, Type } from "@google/genai";

export interface SpartaMatrix {
    home: Record<string, number>;
    away: Record<string, number>;
}

export interface SimulationResult {
    homeWins: number;
    draws: number;
    awayWins: number;
    homeGoalsAvg: number;
    awayGoalsAvg: number;
    mostLikelyScore: string;
}

export function initializeSpartaMatrix(homeTeam: string, awayTeam: string): SpartaMatrix {
    // Initialize 300 variables (simulated for now, focusing on key ones)
    const createTeamMatrix = () => ({
        xG_base: 1.0 + Math.random() * 1.5,
        field_tilt: 40 + Math.random() * 20,
        save_pct: 60 + Math.random() * 25,
        finishing_mod: 1.0,
        defensive_resilience: 1.0,
        // ... imagine 295 more variables here
    });

    return {
        home: createTeamMatrix(),
        away: createTeamMatrix()
    };
}

export function runMonteCarlo(matrix: SpartaMatrix, iterations: number = 10000): SimulationResult {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let homeGoalsTotal = 0;
    let awayGoalsTotal = 0;

    const scoreCounts: Record<string, number> = {};

    for (let i = 0; i < iterations; i++) {
        // Simple Poisson-like distribution based on modified xG
        const homeXg = matrix.home.xG_base * matrix.home.finishing_mod * (1 / matrix.away.defensive_resilience);
        const awayXg = matrix.away.xG_base * matrix.away.finishing_mod * (1 / matrix.home.defensive_resilience);

        // Simulate goals (very basic Poisson approximation for speed)
        const homeGoals = simulatePoisson(homeXg);
        const awayGoals = simulatePoisson(awayXg);

        homeGoalsTotal += homeGoals;
        awayGoalsTotal += awayGoals;

        if (homeGoals > awayGoals) homeWins++;
        else if (homeGoals < awayGoals) awayWins++;
        else draws++;

        const score = `${homeGoals}-${awayGoals}`;
        scoreCounts[score] = (scoreCounts[score] || 0) + 1;
    }

    let mostLikelyScore = "0-0";
    let maxCount = 0;
    for (const [score, count] of Object.entries(scoreCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostLikelyScore = score;
        }
    }

    return {
        homeWins: (homeWins / iterations) * 100,
        draws: (draws / iterations) * 100,
        awayWins: (awayWins / iterations) * 100,
        homeGoalsAvg: homeGoalsTotal / iterations,
        awayGoalsAvg: awayGoalsTotal / iterations,
        mostLikelyScore
    };
}

function simulatePoisson(lambda: number): number {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

export function applyCombatPenalties(matrix: SpartaMatrix, lineupData: any) {
    const newMatrix = JSON.parse(JSON.stringify(matrix)) as SpartaMatrix;

    if (lineupData.homeMissingATier > 0) {
        const penalty = 1 - (lineupData.homeMissingATier * 0.15); // 15% penalty per missing star
        newMatrix.home.xG_base *= penalty;
        newMatrix.home.field_tilt *= penalty;
        newMatrix.home.save_pct *= penalty;
    }

    if (lineupData.awayMissingATier > 0) {
        const penalty = 1 - (lineupData.awayMissingATier * 0.15);
        newMatrix.away.xG_base *= penalty;
        newMatrix.away.field_tilt *= penalty;
        newMatrix.away.save_pct *= penalty;
    }

    // Apply ratings modifiers
    if (lineupData.homeAvgRating) {
        newMatrix.home.finishing_mod = lineupData.homeAvgRating / 7.0; // Assuming 7.0 is baseline
        newMatrix.home.defensive_resilience = lineupData.homeAvgRating / 7.0;
    }

    if (lineupData.awayAvgRating) {
        newMatrix.away.finishing_mod = lineupData.awayAvgRating / 7.0;
        newMatrix.away.defensive_resilience = lineupData.awayAvgRating / 7.0;
    }

    return newMatrix;
}

export async function analyzeLineupScreenshot(file: File): Promise<any> {
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
                        text: `Analyze this SofaScore/FlashScore lineup screenshot.
Extract the following:
1. Formations for both Home and Away teams (e.g., "4-3-3").
2. Number of missing "A-Tier" (star) players for each team (estimate based on typical starting XI vs what's shown, or just look for low rated replacements). If unsure, assume 0.
3. Average player rating for the starting XI for both teams (if visible, otherwise default to 7.0).
4. Identify any high-value "Game Changers" on the bench.

Return a JSON object with:
{
  "homeFormation": string,
  "awayFormation": string,
  "homeMissingATier": number,
  "awayMissingATier": number,
  "homeAvgRating": number,
  "awayAvgRating": number,
  "gameChangers": string[]
}`,
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        homeFormation: { type: Type.STRING },
                        awayFormation: { type: Type.STRING },
                        homeMissingATier: { type: Type.NUMBER },
                        awayMissingATier: { type: Type.NUMBER },
                        homeAvgRating: { type: Type.NUMBER },
                        awayAvgRating: { type: Type.NUMBER },
                        gameChangers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["homeFormation", "awayFormation", "homeMissingATier", "awayMissingATier", "homeAvgRating", "awayAvgRating", "gameChangers"]
                }
            },
        });

        const jsonStr = response.text?.trim() || "{}";
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Gemini Vision failed:", e);
        throw new Error("Failed to analyze lineup screenshot.");
    }
}
