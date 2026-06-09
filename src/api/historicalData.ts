/// <reference types="vite/client" />
import axios from 'axios';
import { getApiKey } from '../lib/api';

const BASE_URL = 'https://api.football-data.org/v4';

const getApiInstance = () => {
    const key = getApiKey('VITE_FOOTBALL_DATA_API_KEY');
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'X-Auth-Token': key
        }
    });
};

export interface HistoricalMatch {
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: {
        id: number;
        name: string;
        shortName: string;
        tla: string;
        crest: string;
    };
    awayTeam: {
        id: number;
        name: string;
        shortName: string;
        tla: string;
        crest: string;
    };
    score: {
        winner: string | null;
        duration: string;
        fullTime: {
            home: number | null;
            away: number | null;
        };
        halfTime: {
            home: number | null;
            away: number | null;
        };
    };
}

export const getHistoricalMatches = async (competitionCode: string, season?: number): Promise<HistoricalMatch[]> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/competitions/${competitionCode}/matches`, {
            params: {
                season: season,
                status: 'FINISHED'
            }
        });
        return response.data.matches;
    } catch (error) {
        console.error('Error fetching historical matches:', error);
        return [];
    }
};

export const getStandings = async (competitionCode: string) => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/competitions/${competitionCode}/standings`);
        return response.data.standings[0].table;
    } catch (error) {
        console.error('Error fetching standings:', error);
        return [];
    }
};

export const getTopScorers = async (competitionCode: string) => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/competitions/${competitionCode}/scorers`);
        return response.data.scorers;
    } catch (error) {
        console.error('Error fetching top scorers:', error);
        return [];
    }
};
