import axios from 'axios';
import { getApiKey } from '../lib/api';
import { searchFootballNews } from './firecrawlApi';

// Proxy helper to handle CORS and 403s
const fetchWithProxy = async (url: string) => {
    const proxies = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
    ];

    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy(url);
            const response = await axios.get(proxyUrl, {
                timeout: 10000, // Reduced timeout for faster fallback
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*'
                }
            });
            return response;
        } catch (e) {
            // Silent fail for individual proxies
            continue;
        }
    }
    return null; // Return null instead of throwing
};

// 1. Open-Meteo (Weather Forecast)
const getWeatherForecast = async (lat: number, lon: number) => {
    try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation,windspeed_10m`);
        return response.data;
    } catch (error) {
        console.error("Open-Meteo Error:", error);
        return null;
    }
};

// 2. Nominatim Geocoding (Get Lat/Lon for a city/stadium)
const getCoordinates = async (query: string) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
            headers: {
                'User-Agent': 'SpartaAI/1.0'
            }
        });
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
                displayName: response.data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.error("Nominatim Error:", error);
        return null;
    }
};

// 3. TheSportsDB (Test API Key: 3)
const searchTeam = async (teamName: string) => {
    try {
        const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
        return response.data.teams ? response.data.teams[0] : null;
    } catch (error) {
        console.error("TheSportsDB Error:", error);
        return null;
    }
};

const getTeamLastEvents = async (teamId: string) => {
    try {
        const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`);
        return response.data.results || [];
    } catch (error) {
        console.error("TheSportsDB Error:", error);
        return [];
    }
};

// 4. ScoreBat Video API (Recent Highlights)
const getRecentHighlights = async () => {
    try {
        const url = 'https://www.scorebat.com/video-api/v3/feed/?sort=date';
        const response = await fetchWithProxy(url);
        if (!response) return [];
        
        // allorigins raw returns a string, we might need to parse it if it's JSON
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        return data.response ? data.response.slice(0, 10) : [];
    } catch (error) {
        console.error("ScoreBat Error:", error);
        return [];
    }
};

// 5. ClubElo API (CSV data, we'll fetch and parse basic info)
const getClubElo = async (clubName: string) => {
    try {
        const url = `http://api.clubelo.com/${encodeURIComponent(clubName)}`;
        const response = await fetchWithProxy(url);
        if (!response) return null;
        
        // Simple CSV parsing: get the last row (most recent ELO)
        const lines = response.data.split('\n').filter((l: string) => l.trim().length > 0);
        if (lines.length > 1) {
            const headers = lines[0].split(',');
            const lastRow = lines[lines.length - 1].split(',');
            const eloIndex = headers.indexOf('Elo');
            const dateIndex = headers.indexOf('To');
            if (eloIndex !== -1) {
                return {
                    club: clubName,
                    elo: lastRow[eloIndex],
                    date: dateIndex !== -1 ? lastRow[dateIndex] : 'Unknown'
                };
            }
        }
        return null;
    } catch (error) {
        console.error("ClubElo Error:", error);
        return null;
    }
};

// 6. RSS2JSON (Football News from SkySports)
const getFootballNews = async () => {
    try {
        const rssUrl = 'https://www.skysports.com/rss/12040';
        const response = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        return response.data.items ? response.data.items.slice(0, 5) : [];
    } catch (error) {
        console.error("RSS2JSON Error:", error);
        return [];
    }
};

// 7. Football-Data.co.uk (CSV data)
const getFootballDataCoUk = async (league: string, season: string) => {
    try {
        // e.g. league = 'E0' (Premier League), season = '2324'
        const url = `https://www.football-data.co.uk/mmz4281/${season}/${league}.csv`;
        const response = await fetchWithProxy(url);
        if (!response) return [];
        
        // Parse basic CSV
        const lines = response.data.split('\n').filter((l: string) => l.trim().length > 0);
        if (lines.length > 1) {
            const headers = lines[0].split(',');
            const matches = lines.slice(1, 11).map((line: string) => {
                const values = line.split(',');
                return headers.reduce((obj: any, header: string, index: number) => {
                    obj[header] = values[index];
                    return obj;
                }, {});
            });
            return matches;
        }
        return [];
    } catch (error) {
        console.error("Football-Data.co.uk Error:", error);
        return [];
    }
};

// 8. Understat (Scrape JSON from HTML)
const getUnderstatData = async (league: string, season: string) => {
    try {
        // e.g. league = 'EPL', season = '2023'
        const url = `https://understat.com/league/${league}/${season}`;
        const response = await fetchWithProxy(url);
        if (!response) return null;
        
        // Extract JSON from script tags
        const match = response.data.match(/var teamsData = JSON\.parse\('([^']+)'\)/);
        if (match && match[1]) {
            // Unescape hex sequences
            const jsonStr = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (match: string, p1: string) => String.fromCharCode(parseInt(p1, 16)));
            return JSON.parse(jsonStr);
        }
        return null;
    } catch (error) {
        console.error("Understat Error:", error);
        return null;
    }
};

// 10. OpenFootball (GitHub raw data)
const getOpenFootballData = async () => {
    try {
        const url = 'https://raw.githubusercontent.com/openfootball/football.json/master/2023-24/en.1.json';
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("OpenFootball Error:", error);
        return null;
    }
};

const getOpenFootballEnglandData = async () => {
    try {
        const url = 'https://raw.githubusercontent.com/openfootball/england/master/2024-25/1-premierleague.txt';
        const response = await axios.get(url);
        // This is a raw text file, we can parse it or just return the raw text for the LLM to parse
        return response.data;
    } catch (error) {
        console.error("OpenFootball England Error:", error);
        return null;
    }
};

// 11. OpenLigaDB (Crowd sourced sports league results, no auth required)
const getOpenLigaDBData = async (league: string, season: string) => {
    try {
        // e.g. league = 'bl1' (Bundesliga), season = '2023'
        const url = `https://api.openligadb.de/getmatchdata/${league}/${season}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("OpenLigaDB Error:", error);
        return null;
    }
};

// 12. Football-Data.org (Free tier, requires registration but no credit card)
const getFootballDataOrgStandings = async (league: string = 'PL') => {
    try {
        const apiKey = getApiKey("VITE_FOOTBALL_DATA_API_KEY");
        if (!apiKey) return null;

        const url = `https://api.football-data.org/v4/competitions/${league}/standings`;
        const response = await axios.get(url, { 
            headers: { 'X-Auth-Token': apiKey } 
        });
        return response.data;
    } catch (error) {
        console.error("Football-Data.org Standings Error:", error);
        return null;
    }
};

export const getFreeApiData = async (home: string, away: string, leagueId?: string) => {
    try {
        // Map leagueId to Understat and Football-Data.co.uk codes
        let understatLeague = 'EPL';
        let fdLeague = 'E0';
        
        if (leagueId) {
            if (leagueId.includes('spain_la_liga')) { understatLeague = 'La_liga'; fdLeague = 'SP1'; }
            else if (leagueId.includes('germany_bundesliga')) { understatLeague = 'Bundesliga'; fdLeague = 'D1'; }
            else if (leagueId.includes('italy_serie_a')) { understatLeague = 'Serie_A'; fdLeague = 'I1'; }
            else if (leagueId.includes('france_ligue_one')) { understatLeague = 'Ligue_1'; fdLeague = 'F1'; }
            else if (leagueId.includes('russia_premier_league')) { understatLeague = 'RFPL'; fdLeague = 'E0'; /* FD doesn't have RFPL easily, fallback to E0 for demo */ }
        }

        const currentYear = new Date().getFullYear();
        const seasonStartYear = new Date().getMonth() > 6 ? currentYear : currentYear - 1;
        const understatSeason = seasonStartYear.toString();
        const fdSeason = `${seasonStartYear.toString().slice(-2)}${(seasonStartYear + 1).toString().slice(-2)}`;

        const [homeCoords, awayCoords, homeTeam, awayTeam, homeElo, awayElo, news, highlights, understat, fbData, openFootball, openFootballEngland, standings, openLigaDB, firecrawlNews] = await Promise.all([
            getCoordinates(home),
            getCoordinates(away),
            searchTeam(home),
            searchTeam(away),
            getClubElo(home),
            getClubElo(away),
            getFootballNews(),
            getRecentHighlights(),
            getUnderstatData(understatLeague, understatSeason),
            getFootballDataCoUk(fdLeague, fdSeason),
            getOpenFootballData(),
            getOpenFootballEnglandData(),
            getFootballDataOrgStandings(fdLeague === 'E0' ? 'PL' : fdLeague === 'SP1' ? 'PD' : fdLeague === 'D1' ? 'BL1' : fdLeague === 'I1' ? 'SA' : fdLeague === 'F1' ? 'FL1' : 'PL'),
            getOpenLigaDBData(fdLeague === 'D1' ? 'bl1' : fdLeague === 'E0' ? 'pl' : 'bl1', understatSeason),
            searchFootballNews(`${home} vs ${away} football match news injuries tactics`)
        ]);

        let homeWeather = null;
        if (homeCoords) {
            homeWeather = await getWeatherForecast(homeCoords.lat, homeCoords.lon);
        }

        let homeLastEvents = [];
        if (homeTeam && homeTeam.idTeam) {
            homeLastEvents = await getTeamLastEvents(homeTeam.idTeam);
        }

        let awayLastEvents = [];
        if (awayTeam && awayTeam.idTeam) {
            awayLastEvents = await getTeamLastEvents(awayTeam.idTeam);
        }

        return {
            homeCoords,
            awayCoords,
            homeWeather,
            homeTeam,
            awayTeam,
            homeLastEvents,
            awayLastEvents,
            homeElo,
            awayElo,
            news,
            highlights,
            understat,
            fbData,
            openFootball,
            openFootballEngland,
            standings,
            openLigaDB,
            firecrawlNews
        };
    } catch (error) {
        console.error("Error fetching free API data:", error);
        return null;
    }
};
