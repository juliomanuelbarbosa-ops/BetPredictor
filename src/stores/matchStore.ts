import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { League, LEAGUES } from '../constants/leagues';
import { getUpcomingGames, scanForArbitrage } from '../api/footballApi';
import { useUIStore } from './uiStore';

interface MatchState {
    matchInput: string;
    selectedLeague: League | null;
    selectedMatchObject: any | null;
    upcomingMatches: any[];
    valueBets: any[];
    arbitrageOpportunities: any[];

    setMatchInput: (input: string) => void;
    setSelectedLeague: (league: League | null) => void;
    setUpcomingMatches: (matches: any[]) => void;
    setValueBets: (bets: any[]) => void;
    setArbitrageOpportunities: (opps: any[]) => void;

    // Complex Actions
    fetchUpcoming: () => Promise<void>;
    analyzeMatch: (match: any) => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
        matchInput: "",
        selectedLeague: null,
        selectedMatchObject: null,
        upcomingMatches: [],
        valueBets: [],
        arbitrageOpportunities: [],

        setMatchInput: (matchInput) => set({ matchInput }),
        setSelectedLeague: (selectedLeague) => set({ selectedLeague }),
        setUpcomingMatches: (upcomingMatches) => set({ upcomingMatches }),
        setValueBets: (valueBets) => set({ valueBets }),
        setArbitrageOpportunities: (arbitrageOpportunities) => set({ arbitrageOpportunities }),

        fetchUpcoming: async () => {
            const { setIsLoading, setLoadingStep, showToast } = useUIStore.getState();
            setIsLoading(true);
            setLoadingStep("Fetching global market data...");
            try {
                const matches = await getUpcomingGames();
                set({ upcomingMatches: matches });
                
                setLoadingStep("Scanning for arbitrage...");
                const arbs = scanForArbitrage(matches);
                set({ arbitrageOpportunities: arbs });

                setLoadingStep("Identifying value bets...");
                const values = matches.filter(m => m.margin < 3); // Simple value bet logic
                set({ valueBets: values });

                showToast("Market data synchronized", "success");
            } catch (error) {
                console.error("Fetch failed:", error);
                showToast("Failed to fetch market data", "error");
            } finally {
                setIsLoading(false);
            }
        },

        analyzeMatch: (match: any) => {
            const leagueId = match.sport_key || 'soccer_epl';
            const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
            
            set({
                matchInput: `${match.home} vs ${match.away}`,
                selectedLeague: league,
                selectedMatchObject: match
            });
        }
    }),
    { name: 'match-store', partialize: (s) => ({ upcomingMatches: s.upcomingMatches }) }
  )
);
