import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseGamesFromText(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const games = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();
        
        // Format 1: Team A vs Team B 2.1 3.4 3.2
        if (lower.includes(' vs ') || lower.includes(' - ') || lower.includes(' v ') || lower.includes(' @ ')) {
            const separator = lower.includes(' vs ') ? / vs /i : lower.includes(' - ') ? / - / : lower.includes(' v ') ? / v /i : / @ /;
            const parts = line.split(separator);
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
                    games.push({ home, away, oddsH, oddsD, oddsA, time: "Upcoming" });
                    continue;
                }
            }
        }
        
        // Format 2: 3 numbers on a line, previous lines are teams
        const numbers = line.match(/\d+\.\d{2}/g);
        if (numbers && numbers.length >= 3 && i >= 2) {
            const home = lines[i-2].replace(/[\d\.]/g, '').trim();
            const away = lines[i-1].replace(/[\d\.]/g, '').trim();
            if (home.length > 2 && away.length > 2) {
                games.push({
                    home,
                    away,
                    oddsH: parseFloat(numbers[0]),
                    oddsD: parseFloat(numbers[1]),
                    oddsA: parseFloat(numbers[2]),
                    time: "Upcoming"
                });
            }
        }
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
