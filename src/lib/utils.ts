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

export const CURRENCIES = [
    { code: 'USD', symbol: '$', rate: 1.0 },
    { code: 'GBP', symbol: '£', rate: 0.78 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'BRL', symbol: 'R$', rate: 5.0 },
    { code: 'ARS', symbol: '$', rate: 850.0 },
    { code: 'MXN', symbol: '$', rate: 17.0 },
    { code: 'AUD', symbol: 'A$', rate: 1.52 },
    { code: 'JPY', symbol: '¥', rate: 150.0 },
    { code: 'NGN', symbol: '₦', rate: 1500.0 }
];

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount * currency.rate);
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function convertOdds(decimal: number, format: 'DECIMAL' | 'FRACTIONAL' | 'AMERICAN'): string {
  if (format === 'DECIMAL') return decimal.toFixed(2);
  
  if (format === 'FRACTIONAL') {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal - 1;
    do {
      let a = Math.floor(b);
      let aux = h1; h1 = a * h1 + h2; h2 = aux;
      aux = k1; k1 = a * k1 + k2; k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(decimal - 1 - h1 / k1) > (decimal - 1) * tolerance);
    return `${h1}/${k1}`;
  }
  
  if (format === 'AMERICAN') {
    if (decimal >= 2.0) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (decimal - 1))}`;
    }
  }
  
  return decimal.toFixed(2);
}

export function calculateKellyStake(probability: number, odds: number, fraction: number = 0.5, uncertainty: number = 0, bankroll?: number, disagreement: number = 0) {
    if (odds <= 1 || probability <= 0) return 0;
    
    // b is the net odds (decimal odds - 1)
    const b = odds - 1;
    const p = probability / 100;
    const q = 1 - p;
    
    // Kelly formula: f = (bp - q) / b
    let kellyFraction = (b * p - q) / b;
    
    // Apply uncertainty penalty (reduces stake if model confidence is low)
    // uncertainty is 0-1, where 1 is maximum uncertainty
    kellyFraction = kellyFraction * (1 - uncertainty * 0.5);
    
    // Apply disagreement penalty (High disagreement = reduce stake)
    // disagreement is 0-1, where 1 is maximum disagreement
    kellyFraction = kellyFraction * (1 - disagreement * 0.8);
    
    // Apply user fraction (Full, Half, Quarter)
    const finalStakePercentage = kellyFraction * fraction * 100; // Convert to percentage of bankroll
    
    const cappedPercentage = Math.max(0, Math.min(finalStakePercentage, 10)); // Cap at 10% of bankroll for safety
    
    if (bankroll !== undefined) {
        return (cappedPercentage / 100) * bankroll;
    }
    
    return cappedPercentage;
}

export function factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

export function poissonProbability(k: number, lambda: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function generateScoreMatrix(homeExp: number, awayExp: number, size: number = 8) {
    const matrix: number[][] = [];
    for (let h = 0; h < size; h++) {
        matrix[h] = [];
        for (let a = 0; a < size; a++) {
            const probH = poissonProbability(h, homeExp);
            const probA = poissonProbability(a, awayExp);
            matrix[h][a] = probH * probA * 100; // Percentage
        }
    }
    return matrix;
}
