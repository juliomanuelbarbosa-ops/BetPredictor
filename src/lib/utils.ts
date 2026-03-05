import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseGamesFromText(text: string) {
    const lines = text.split('\n');
    const games = [];
    
    for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes(' vs ') || lower.includes(' - ') || lower.includes(' v ')) {
            const parts = line.split(/ vs | - | v /i);
            if (parts.length >= 2) {
                const home = parts[0].trim();
                const rest = parts[1].trim().split(/\s+/);
                const away = rest[0];
                
                const numbers = line.match(/\d+\.\d+/g);
                let oddsH = 2.5, oddsD = 3.5, oddsA = 3.5;
                if (numbers && numbers.length >= 3) {
                    oddsH = parseFloat(numbers[0]);
                    oddsD = parseFloat(numbers[1]);
                    oddsA = parseFloat(numbers[2]);
                }
                
                if (home && away && home.length > 2 && away.length > 2) {
                    games.push({
                        home,
                        away,
                        oddsH,
                        oddsD,
                        oddsA,
                        time: "Upcoming"
                    });
                }
            }
        }
    }
    
    if (games.length === 0) {
        games.push({ home: "Arsenal", away: "Chelsea", oddsH: 2.1, oddsD: 3.4, oddsA: 3.2, time: "20:00" });
        games.push({ home: "Real Madrid", away: "Barcelona", oddsH: 2.5, oddsD: 3.5, oddsA: 2.6, time: "21:00" });
    }
    
    return games;
}

export function calculateStake(confidence: number, edge: number) {
    let stake = 0;
    if (confidence > 60 && edge > 5) {
        stake = 5;
    } else if (confidence > 50 && edge > 2) {
        stake = 2.5;
    } else {
        stake = 1;
    }
    return stake;
}
