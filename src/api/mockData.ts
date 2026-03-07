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
    HY: number;
    AY: number;
    HR: number;
    AR: number;
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
            "https://www.football-data.co.uk/mmz4281/2425/SP1.csv",
            "https://www.football-data.co.uk/mmz4281/2324/I1.csv",
            "https://www.football-data.co.uk/mmz4281/2425/I1.csv",
            "https://www.football-data.co.uk/mmz4281/2324/F1.csv",
            "https://www.football-data.co.uk/mmz4281/2425/F1.csv"
        ];

        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const csv = await res.text();
                const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
                
                const validMatches = parsed.data
                    .filter((r: any) => r.HomeTeam && r.AwayTeam && r.FTR)
                    .map((r: any) => {
                        let parsedDate = new Date();
                        if (r.Date) {
                            const parts = r.Date.split('/');
                            if (parts.length === 3) {
                                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                                parsedDate = new Date(`${year}-${parts[1]}-${parts[0]}`);
                            }
                        }

                        return {
                            Date: parsedDate.toISOString(),
                            HomeTeam: r.HomeTeam,
                            AwayTeam: r.AwayTeam,
                            FTHG: parseInt(r.FTHG) || 0,
                            FTAG: parseInt(r.FTAG) || 0,
                            FTR: r.FTR,
                            HST: parseInt(r.HST) || 0,
                            AST: parseInt(r.AST) || 0,
                            HY: parseInt(r.HY) || 0,
                            AY: parseInt(r.AY) || 0,
                            HR: parseInt(r.HR) || 0,
                            AR: parseInt(r.AR) || 0,
                            B365H: parseFloat(r.B365H) || 2.5,
                            B365D: parseFloat(r.B365D) || 3.5,
                            B365A: parseFloat(r.B365A) || 3.5,
                        };
                    });
                
                this.matches = [...this.matches, ...validMatches];
            } catch (e) {
                console.warn(`Failed to load ${url}`);
            }
        }
        
        this.matches.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        this.isLoaded = true;
    }

    getMatches() {
        return this.matches;
    }

    getTeamForm(team: string, upToDate?: string): { pts: number, gs: number, gc: number, sot: number, yc: number, rc: number } {
        let teamMatches = this.matches.filter(m => 
            m.HomeTeam.toLowerCase().includes(team.toLowerCase()) || 
            m.AwayTeam.toLowerCase().includes(team.toLowerCase())
        );

        if (upToDate) {
            const limitDate = new Date(upToDate).getTime();
            teamMatches = teamMatches.filter(m => new Date(m.Date).getTime() < limitDate);
        }
        
        const last5 = teamMatches.slice(-5);
        
        let pts = 0;
        let gs = 0;
        let gc = 0;
        let sot = 0;
        let yc = 0;
        let rc = 0;
        let totalWeight = 0;

        for (let i = 0; i < last5.length; i++) {
            const m = last5[i];
            const weight = 0.6 + (0.1 * i);
            totalWeight += weight;

            const isHome = m.HomeTeam.toLowerCase().includes(team.toLowerCase());
            
            let matchPts = 0;
            let matchGs = 0;
            let matchGc = 0;
            let matchSot = 0;
            let matchYc = 0;
            let matchRc = 0;

            if (isHome) {
                matchGs = m.FTHG;
                matchGc = m.FTAG;
                matchSot = m.HST;
                matchYc = m.HY;
                matchRc = m.HR;
                if (m.FTR === 'H') matchPts = 3;
                else if (m.FTR === 'D') matchPts = 1;
            } else {
                matchGs = m.FTAG;
                matchGc = m.FTHG;
                matchSot = m.AST;
                matchYc = m.AY;
                matchRc = m.AR;
                if (m.FTR === 'A') matchPts = 3;
                else if (m.FTR === 'D') matchPts = 1;
            }

            pts += matchPts * weight;
            gs += matchGs * weight;
            gc += matchGc * weight;
            sot += matchSot * weight;
            yc += matchYc * weight;
            rc += matchRc * weight;
        }

        if (last5.length === 0) {
            return { pts: 7, gs: 6, gc: 6, sot: 20, yc: 10, rc: 0 };
        }

        const normalizationFactor = 5 / totalWeight;

        return { 
            pts: pts * normalizationFactor, 
            gs: gs * normalizationFactor, 
            gc: gc * normalizationFactor, 
            sot: (sot / totalWeight),
            yc: yc * normalizationFactor,
            rc: rc * normalizationFactor
        };
    }

    getH2H(home: string, away: string, upToDate?: string): { homeWins: number, awayWins: number, draws: number } {
        let h2hMatches = this.matches.filter(m => 
            (m.HomeTeam.toLowerCase().includes(home.toLowerCase()) && m.AwayTeam.toLowerCase().includes(away.toLowerCase())) ||
            (m.HomeTeam.toLowerCase().includes(away.toLowerCase()) && m.AwayTeam.toLowerCase().includes(home.toLowerCase()))
        );

        if (upToDate) {
            const limitDate = new Date(upToDate).getTime();
            h2hMatches = h2hMatches.filter(m => new Date(m.Date).getTime() < limitDate);
        }

        const h2h = h2hMatches.slice(-5);

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

    getTeamFormResults(team: string): string[] {
        let teamMatches = this.matches.filter(m => 
            m.HomeTeam.toLowerCase().includes(team.toLowerCase()) || 
            m.AwayTeam.toLowerCase().includes(team.toLowerCase())
        );
        
        const last5 = teamMatches.slice(-5);
        return last5.map(m => {
            const isHome = m.HomeTeam.toLowerCase().includes(team.toLowerCase());
            if (m.FTR === 'D') return 'D';
            if ((m.FTR === 'H' && isHome) || (m.FTR === 'A' && !isHome)) return 'W';
            return 'L';
        });
    }
}

export const footballData = new FootballDataService();
