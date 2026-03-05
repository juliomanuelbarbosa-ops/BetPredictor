import Papa from 'papaparse';

interface MatchRecord {
    Date: string;
    HomeTeam: string;
    AwayTeam: string;
    FTHG: number;
    FTAG: number;
    FTR: string;
    HST: number;
    AST: number;
    B365H: number;
    B365D: number;
    B365A: number;
}

class FootballDataService {
    private matches: MatchRecord[] = [];
    private isLoaded = false;

    async loadData() {
        if (this.isLoaded) return;
        
        const urls = [
            "https://www.football-data.co.uk/mmz4281/2324/E0.csv",
            "https://www.football-data.co.uk/mmz4281/2425/E0.csv",
            "https://www.football-data.co.uk/mmz4281/2324/D1.csv",
            "https://www.football-data.co.uk/mmz4281/2425/D1.csv",
            "https://www.football-data.co.uk/mmz4281/2324/SP1.csv",
            "https://www.football-data.co.uk/mmz4281/2425/SP1.csv"
        ];

        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const csv = await res.text();
                const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
                
                const validMatches = parsed.data
                    .filter((r: any) => r.HomeTeam && r.AwayTeam && r.FTR)
                    .map((r: any) => ({
                        Date: r.Date,
                        HomeTeam: r.HomeTeam,
                        AwayTeam: r.AwayTeam,
                        FTHG: parseInt(r.FTHG) || 0,
                        FTAG: parseInt(r.FTAG) || 0,
                        FTR: r.FTR,
                        HST: parseInt(r.HST) || 0,
                        AST: parseInt(r.AST) || 0,
                        B365H: parseFloat(r.B365H) || 2.5,
                        B365D: parseFloat(r.B365D) || 3.5,
                        B365A: parseFloat(r.B365A) || 3.5,
                    }));
                
                this.matches = [...this.matches, ...validMatches];
            } catch (e) {
                console.warn(`Failed to load ${url}`);
            }
        }
        this.isLoaded = true;
    }

    getMatches() {
        return this.matches;
    }

    getTeamForm(team: string, upToDate?: string): { pts: number, gs: number, gc: number, sot: number } {
        // Find last 5 matches for the team
        let teamMatches = this.matches.filter(m => 
            m.HomeTeam.toLowerCase().includes(team.toLowerCase()) || 
            m.AwayTeam.toLowerCase().includes(team.toLowerCase())
        );

        // If upToDate is provided, only consider matches before that date (useful for training data generation)
        // For simplicity in this mock, we'll just take the last 5 in the array if no date logic is strictly applied,
        // assuming the CSV is chronological.
        
        const last5 = teamMatches.slice(-5);
        
        let pts = 0;
        let gs = 0;
        let gc = 0;
        let sot = 0;

        for (const m of last5) {
            const isHome = m.HomeTeam.toLowerCase().includes(team.toLowerCase());
            if (isHome) {
                gs += m.FTHG;
                gc += m.FTAG;
                sot += m.HST;
                if (m.FTR === 'H') pts += 3;
                else if (m.FTR === 'D') pts += 1;
            } else {
                gs += m.FTAG;
                gc += m.FTHG;
                sot += m.AST;
                if (m.FTR === 'A') pts += 3;
                else if (m.FTR === 'D') pts += 1;
            }
        }

        // Fallback if no data found (e.g. team not in CSV)
        if (last5.length === 0) {
            return { pts: 7, gs: 6, gc: 6, sot: 20 }; // Average realistic stats
        }

        return { pts, gs, gc, sot: sot / last5.length };
    }

    getH2H(home: string, away: string): { homeWins: number, awayWins: number, draws: number } {
        const h2h = this.matches.filter(m => 
            (m.HomeTeam.toLowerCase().includes(home.toLowerCase()) && m.AwayTeam.toLowerCase().includes(away.toLowerCase())) ||
            (m.HomeTeam.toLowerCase().includes(away.toLowerCase()) && m.AwayTeam.toLowerCase().includes(home.toLowerCase()))
        ).slice(-5);

        let homeWins = 0;
        let awayWins = 0;
        let draws = 0;

        for (const m of h2h) {
            const isHomeOriginal = m.HomeTeam.toLowerCase().includes(home.toLowerCase());
            if (m.FTR === 'D') draws++;
            else if ((m.FTR === 'H' && isHomeOriginal) || (m.FTR === 'A' && !isHomeOriginal)) homeWins++;
            else awayWins++;
        }

        if (h2h.length === 0) {
            return { homeWins: 2, awayWins: 2, draws: 1 };
        }

        return { homeWins, awayWins, draws };
    }
}

export const footballData = new FootballDataService();
