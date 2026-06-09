import { API_KEYS, testApiKey, getActiveServicesCount } from '../lib/api';
import { Globe, Cpu, Cloud, Trophy, Zap } from 'lucide-react';
import React from 'react';

export interface ApiKey {
    id: string;
    name: string;
    envVar: string;
    description: string;
    category: 'Sports' | 'Quant' | 'Weather' | 'Other';
    icon: React.ReactNode;
}

export const API_SERVICES: ApiKey[] = [
    { 
        id: 'odds', 
        name: 'The Odds API', 
        envVar: 'VITE_ODDS_API_KEY', 
        category: 'Sports',
        icon: React.createElement(Trophy, { className: "w-5 h-5" }),
        description: 'Primary source for real-time betting odds and market data across 40+ bookmakers.' 
    },
    { 
        id: 'api-football', 
        name: 'API-Football', 
        envVar: 'VITE_API_FOOTBALL_KEY', 
        category: 'Sports',
        icon: React.createElement(Globe, { className: "w-5 h-5" }),
        description: 'Comprehensive football data including fixtures, lineups, and H2H statistics.' 
    },
    { 
        id: 'gemini', 
        name: 'Google Gemini', 
        envVar: 'VITE_GEMINI_API_KEY', 
        category: 'Quant',
        icon: React.createElement(Cpu, { className: "w-5 h-5" }),
        description: 'Powering tactical analysis, match previews, and quantitative agent orchestration.' 
    },
    { 
        id: 'groq', 
        name: 'Groq (Llama 3)', 
        envVar: 'VITE_GROQ_API_KEY', 
        category: 'Quant',
        icon: React.createElement(Zap, { className: "w-5 h-5" }),
        description: 'Ultra-fast inference for real-time metrics and player performance analysis.' 
    },
    { 
        id: 'weather', 
        name: 'OpenWeather', 
        envVar: 'VITE_OPENWEATHER_KEY', 
        category: 'Weather',
        icon: React.createElement(Cloud, { className: "w-5 h-5" }),
        description: 'Real-time pitch conditions, temperature, and precipitation impact analysis.' 
    },
    { 
        id: 'firecrawl', 
        name: 'Firecrawl', 
        envVar: 'VITE_FIRECRAWL_API_KEY', 
        category: 'Other',
        icon: React.createElement(Globe, { className: "w-5 h-5" }),
        description: 'Web scraping and search API for live football news and tactical analysis.' 
    }
];

export const getSecureItem = async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
};

export const setSecureItem = async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
};

export const removeSecureItem = async (key: string): Promise<void> => {
    localStorage.removeItem(key);
};
