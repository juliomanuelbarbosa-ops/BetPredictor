import React, { useState, useMemo } from 'react';
import { CloudLightning, Brain, RefreshCw, Calendar, Search, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { formatCurrency, generateId, convertOdds } from '../lib/utils';
import { useMatchStore } from '../stores/matchStore';
import { useForecastStore } from '../stores/forecastStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import { MatchCard } from './MatchCard';
import { ForecastCard } from './ForecastCard';
import { LiveOddsTicker } from './LiveOddsTicker';
import { spartaSimEngine } from '../lib/spartaSim';

const LEAGUE_CODE_MAP: Record<string, string> = {
    'Premier League': 'PL',
    'Bundesliga': 'BL1',
    'La Liga': 'PD',
    'Serie A': 'SA',
    'Ligue 1': 'FL1',
    'Champions League': 'CL',
    'Eredivisie': 'DED',
    'Primeira Liga': 'PPL'
};

export const UpcomingMode = React.memo(function UpcomingMode() {
    const navigate = useNavigate();
    const { 
        upcomingMatches, 
        arbitrageOpportunities, 
        fetchUpcoming 
    } = useMatchStore();
    const { 
        forecasts, 
        addForecast
    } = useForecastStore();
    const { user, bankroll, totalCorrect, totalGames, currency, updateBankroll } = useUserStore();
    const { isLoading, loadingStep, showToast } = useUIStore();

    const handleGenerateForecast = React.useCallback(async (match: any) => {
        if (!user) {
            showToast("Please log in to generate forecasts", "error");
            return;
        }
        
        const { setIsLoading, setLoadingStep } = useUIStore.getState();
        setIsLoading(true);
        setLoadingStep("Resolving Multi-Agent Debate & De-Vigging...");
        
        try {
            // Run Sparta Mult multilateral debate engine
            const result = await spartaSimEngine.runDebate(match, bankroll);
            
            const homeName = match.home || match.home_team || "Home Team";
            const awayName = match.away || match.away_team || "Away Team";
            const probs = result.fairProbs;
            const bestBet = result.bestBet;
            const confidence = Math.round(probs[bestBet === "HOME WIN" ? 0 : bestBet === "DRAW" ? 1 : 2] * 100);
            const edge = result.edge;
            const stake = result.kellyStake > 0 ? result.kellyStake : 10;

            const newPred = {
                id: generateId(),
                userId: user.uid,
                createdAt: new Date().toISOString(),
                game: match,
                probs,
                bestBet,
                confidence,
                edge: isNaN(edge) ? 0 : edge,
                valueText: result.kellyDecision,
                predScore: result.kellyDecision === "FULL KELLY" ? "A+" : result.kellyDecision === "HALF KELLY" ? "A" : "B",
                stake: stake,
                features: [] as number[],
                actual: null,
                bytezAnalysis: { 
                    report: `SPARTA Multi-Agent Consensus Report:\n\n${result.debateLogs.join('\n')}\n\nRecommended Action: ${result.metacognition.recommendedAction} with ${result.kellyDecision}.` 
                },
                isManual: false
            };
            
            updateBankroll(prev => prev - stake);
            addForecast(newPred);
            showToast(`SPARTA: Edge of ${edge.toFixed(1)}% detected! Kelly stake: ${formatCurrency(stake, currency)}`, "success");
        } catch (error) {
            console.error("Failed to generate forecast:", error);
            showToast("Failed to generate forecast", "error");
        } finally {
            setIsLoading(false);
        }
    }, [user, bankroll, addForecast, updateBankroll, showToast, currency]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLeague, setSelectedLeague] = useState("All Leagues");
    const [sortBy, setSortBy] = useState<'time' | 'league' | 'margin'>('time');
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});
    const [sentiments, setSentiments] = useState<Record<string, any>>({});
    const [contrarianSignals, setContrarianSignals] = useState<Record<string, any[]>>({});
    const [loadingInference, setLoadingInference] = useState<Record<string, boolean>>({});

    const leagues = useMemo(() => {
        const unique = Array.from(new Set(upcomingMatches.map(m => m.league)));
        return ["All Leagues", ...unique];
    }, [upcomingMatches]);

    const filteredMatches = useMemo(() => {
        let filtered = upcomingMatches.filter(m => {
            const query = searchQuery.toLowerCase();
            
            // Basic search
            const matchesSearch = m.home.toLowerCase().includes(query) || 
                                m.away.toLowerCase().includes(query);
            
            // Natural Language Filters (Simple implementation)
            const isValueQuery = query.includes('value') || query.includes('edge');
            const isHighMarginQuery = query.includes('high margin') || query.includes('vig');
            const isLowMarginQuery = query.includes('low margin') || query.includes('best odds');

            if (isValueQuery && m.margin > 5) return false; // Filter out high margin if looking for value
            if (isHighMarginQuery && m.margin < 6) return false;
            if (isLowMarginQuery && m.margin > 4) return false;

            const matchesLeague = selectedLeague === "All Leagues" || m.league === selectedLeague;
            return matchesSearch && matchesLeague;
        });

        if (sortBy === 'time') {
            filtered.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
        } else if (sortBy === 'margin') {
            filtered.sort((a, b) => (a.margin || 0) - (b.margin || 0));
        } else {
            filtered.sort((a, b) => a.league.localeCompare(b.league) || new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
        }

        return filtered;
    }, [upcomingMatches, searchQuery, selectedLeague, sortBy]);

    const handleFetchExplanation = React.useCallback(async (match: any) => {
        if (loadingExplanations[match.id]) return;
        
        setLoadingExplanations(prev => ({ ...prev, [match.id]: true }));
        try {
            const { getForecastExplanation, getMarketSentiment, getAdvancedMetrics, detectContrarianSignals } = await import('../api/footballApi');
            
            const [explanation, sentiment, metrics] = await Promise.all([
                getForecastExplanation(match),
                getMarketSentiment(`${match.home} vs ${match.away}`),
                getAdvancedMetrics(match.home)
            ]);

            setExplanations(prev => ({ ...prev, [match.id]: explanation }));
            setSentiments(prev => ({ ...prev, [match.id]: sentiment }));
            
            const signals = detectContrarianSignals(match, metrics, sentiment);
            setContrarianSignals(prev => ({ ...prev, [match.id]: signals }));
        } catch (e) {
            console.error("Failed to fetch quantitative metrics:", e);
            setExplanations(prev => ({ ...prev, [match.id]: "Failed to generate quantitative explanation." }));
        } finally {
            setLoadingExplanations(prev => ({ ...prev, [match.id]: false }));
        }
    }, [loadingExplanations]);



    const handleExportToExcel = () => {
        if (forecasts.length === 0) return;
        
        const headers = ["ID", "Match", "League", "Best Bet", "Confidence", "Stake", "Result", "Profit", "Notes"];
        const rows = forecasts.map(p => [
            p.id,
            p.isAccumulator ? `${p.game.home} ACCUMULATOR` : `${p.game.home} vs ${p.game.away}`,
            p.game.league,
            p.isAccumulator ? 'ACCUMULATOR' : p.bestBet,
            `${p.confidence}%`,
            p.stake,
            p.actual || "Pending",
            p.profit || 0,
            p.notes || ""
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `sparta_forecasts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Exported to CSV", "success");
    };

    return (
        <section className="animate-in fade-in duration-700 relative z-10 space-y-12">
            <LiveOddsTicker />
            
            {/* Welcome Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 relative">
                <div className="absolute -top-24 -left-20 w-96 h-96 bg-stratos-accent/10 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 w-full xl:w-auto">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
                        QUANTITATIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-stratos-accent to-stratos-accent/80">INFERENCE</span>
                    </h1>
                    <div className="status-label text-xs font-mono uppercase tracking-widest text-stratos-muted flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stratos-accent animate-pulse"></span>
                        Scanning {upcomingMatches.length} Markets across {leagues.length - 1} Liquidity Pools
                    </div>
                </div>
                
                <div className="flex shrink-0 glass-panel backdrop-blur-2xl border border-stratos-border/50 rounded-2xl overflow-hidden shadow-2xl relative z-10 w-full xl:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent pointer-events-none"></div>
                    <div className="px-6 py-4 border-r border-stratos-border/30 relative flex-1 xl:flex-none">
                        <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] block mb-1 font-bold">Active Bankroll</span>
                        <span className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm">{formatCurrency(bankroll, currency)}</span>
                    </div>
                    <div className="px-6 py-4 relative bg-gradient-to-r from-stratos-card/50 to-transparent flex-1 xl:flex-none">
                        <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] block mb-1 font-bold">Edge Rate</span>
                        <span className="font-mono text-2xl md:text-3xl font-black text-stratos-accent tracking-tight drop-shadow-[0_0_15px_rgba(23,241,209,0.3)]">
                            {totalGames > 0 ? ((totalCorrect / totalGames) * 100).toFixed(1) : '0.0'}%
                        </span>
                    </div>
                </div>
            </div>



            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stratos-accent/10 flex items-center justify-center border border-stratos-accent/30 shadow-inner">
                        <Calendar className="w-5 h-5 text-stratos-accent" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-white tracking-tight">Upcoming Matches</h2>
                        <p className="text-xs text-stratos-muted font-mono uppercase tracking-[0.2em] mt-1">Next 24 Hours</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-none md:w-96 group">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stratos-muted group-focus-within:text-stratos-accent transition-colors z-10" />
                        <input 
                            aria-label="Quantitative Query Search"
                            type="text"
                            placeholder="Try 'low margin matches' or 'Premier League value'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full glass-panel backdrop-blur-xl border border-stratos-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 hover:border-stratos-accent/30 focus:outline-none focus:border-stratos-accent focus:ring-1 focus:ring-stratos-accent/50 transition-all shadow-inner relative z-10"
                        />
                    </div>

                    {/* League Filter */}
                    <div className="relative flex-1 md:flex-none md:w-56 group">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stratos-muted group-focus-within:text-stratos-accent transition-colors z-10" />
                        <select 
                            aria-label="Filter matches by league"
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                            className="w-full glass-panel backdrop-blur-xl border border-stratos-border/50 rounded-2xl py-3.5 pl-12 pr-10 text-sm text-white appearance-none hover:border-stratos-accent/30 focus:outline-none focus:border-stratos-accent focus:ring-1 focus:ring-stratos-accent/50 transition-all cursor-pointer shadow-inner relative z-10 font-bold"
                        >
                            {leagues.map(l => <option key={l} value={l} className="glass-panel text-white">{l}</option>)}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <svg className="w-4 h-4 text-stratos-muted group-focus-within:text-stratos-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Sort Toggle */}
                    <div className="flex glass-panel backdrop-blur-xl border border-stratos-border/50 rounded-2xl overflow-hidden shadow-inner shrink-0 p-1">
                        <button
                            aria-label="Sort matches by time"
                            onClick={() => setSortBy('time')}
                            className={`px-5 py-2.5 text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all whitespace-nowrap rounded-xl ${sortBy === 'time' ? 'bg-stratos-accent/20 text-stratos-accent shadow-[inset_0_2px_10px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/30' : 'text-stratos-muted hover:text-white hover:bg-white/5'}`}
                        >
                            Time
                        </button>
                        <button
                            aria-label="Sort matches by league"
                            onClick={() => setSortBy('league')}
                            className={`px-5 py-2.5 text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all whitespace-nowrap rounded-xl ${sortBy === 'league' ? 'bg-stratos-accent/20 text-stratos-accent shadow-[inset_0_2px_10px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/30' : 'text-stratos-muted hover:text-white hover:bg-white/5'}`}
                        >
                            League
                        </button>
                        <button
                            aria-label="Sort matches by margin"
                            onClick={() => setSortBy('margin')}
                            className={`px-5 py-2.5 text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all whitespace-nowrap rounded-xl ${sortBy === 'margin' ? 'bg-stratos-accent/20 text-stratos-accent shadow-[inset_0_2px_10px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/30' : 'text-stratos-muted hover:text-white hover:bg-white/5'}`}
                        >
                            Margin
                        </button>
                    </div>

                    <button 
                        onClick={fetchUpcoming} 
                        disabled={isLoading}
                        className="w-14 h-14 flex items-center justify-center glass-panel backdrop-blur-xl hover:bg-stratos-accent/10 border border-stratos-border/50 hover:border-stratos-accent/50 rounded-2xl transition-all duration-300 shadow-inner group shrink-0"
                        aria-label="Refresh matches"
                    >
                        <RefreshCw className={`w-5 h-5 text-stratos-muted group-hover:text-stratos-accent transition-colors ${isLoading ? 'animate-spin text-stratos-accent' : ''}`} />
                    </button>
                    {(searchQuery !== '' || selectedLeague !== 'All Leagues') && (
                        <button
                            aria-label="Clear search and filters"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedLeague('All Leagues');
                            }}
                            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl text-red-500 font-mono text-[10px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] uppercase tracking-[0.2em] shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </div>



            {/* ARBITRAGE SCANNER ALERT */}
            {arbitrageOpportunities.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 bg-stratos-card border border-stratos-border rounded-[2.5rem] p-0 relative overflow-hidden shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-stratos-accent/5 via-transparent to-stratos-accent/5 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center glass-panel p-6 border-b border-stratos-border/50 backdrop-blur-sm relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-stratos-accent/10 rounded-xl border border-stratos-accent/30 shadow-[0_0_20px_rgba(23,241,209,0.1)]">
                                <TrendingUp className="w-5 h-5 text-stratos-accent" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white uppercase tracking-[0.2em]">Arbitrage Scanner</h3>
                                <p className="text-[10px] text-stratos-accent/80 font-mono uppercase tracking-[0.2em] mt-0.5 font-bold">Guaranteed profit detected across {arbitrageOpportunities.length} markets</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-md border border-stratos-accent/30 bg-stratos-accent/10 text-[9px] font-mono text-stratos-accent uppercase tracking-[0.2em] animate-pulse shadow-[inset_0_2px_10px_rgba(23,241,209,0.1)] font-bold">Live Arb Found</div>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 gap-4 relative z-10">
                        {arbitrageOpportunities.map(arb => (
                            <motion.div 
                                key={arb.id} 
                                whileHover={{ scale: 1.01 }}
                                className="glass-panel border border-stratos-border rounded-xl hover:border-stratos-accent/50 transition-all duration-300 group/arb relative overflow-hidden shadow-inner w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stratos-border/50"
                            >
                                <div className="p-5 flex-1 flex justify-between items-center bg-stratos-accent/5">
                                    <div>
                                        <p className="text-[10px] text-stratos-accent font-mono uppercase tracking-[0.2em] mb-1 font-bold">{arb.league}</p>
                                        <p className="font-mono text-sm md:text-base font-bold text-white tracking-[0.1em] uppercase drop-shadow-sm">{arb.match}</p>
                                    </div>
                                    <div className="bg-stratos-accent/10 border border-stratos-accent/30 text-stratos-accent text-xs md:text-sm font-mono font-bold px-3 py-1.5 rounded shadow-[inset_0_2px_10px_rgba(23,241,209,0.1)]">
                                        +{arb.profit.toFixed(2)}% ROI
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center px-5 py-3">
                                    {arb.outcomes.map((o: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center py-2 hover:bg-white/5 transition-colors px-2 rounded -mx-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-stratos-muted uppercase font-mono tracking-[0.2em] font-bold">{o.name}</span>
                                                <span className="text-white font-mono font-bold text-xs tracking-tight">@{o.price.toFixed(2)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-stratos-accent/70 block font-mono uppercase tracking-[0.2em] font-bold">{o.bookie}</span>
                                                <span className="text-stratos-accent font-mono font-black text-xs">{formatCurrency(o.stake, currency)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-5 bg-stratos-card/50 flex flex-col md:justify-center border-t border-stratos-border md:border-none w-full md:w-48 shrink-0 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent pointer-events-none"></div>
                                    <span className="text-[10px] text-stratos-muted font-mono uppercase tracking-[0.2em] font-bold mb-1 relative z-10">Total Stake</span>
                                    <span className="text-sm text-white font-mono font-bold mb-3 relative z-10">{formatCurrency(100, currency)}</span>
                                    <span className="text-[10px] text-stratos-accent font-mono font-black uppercase tracking-[0.2em] relative z-10">Total Profit: <span className="text-sm">{formatCurrency(arb.profit, currency)}</span></span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {isLoading && upcomingMatches.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-stratos-card border border-stratos-border rounded-[2.5rem] p-24 flex flex-col items-center justify-center relative overflow-hidden shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent pointer-events-none"></div>
                    <div className="w-24 h-24 border-4 border-stratos-accent/10 border-t-stratos-accent rounded-full animate-spin mb-8 shadow-[0_0_40px_rgba(23,241,209,0.2)] relative z-10"></div>
                    <p className="text-sm font-mono text-stratos-accent font-bold animate-pulse tracking-[0.3em] uppercase relative z-10">{loadingStep}</p>
                </motion.div>
            ) : (
                <div className="grid gap-8 mb-16">
                    {filteredMatches.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-stratos-card border border-stratos-border rounded-[2.5rem] p-24 text-center relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 tech-grid-dense opacity-20 z-0"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stratos-accent/5 rounded-full blur-[80px]"></div>
                            <Calendar className="w-16 h-16 text-stratos-muted mx-auto mb-6 relative z-10" />
                            <p className="text-stratos-muted font-mono tracking-[0.2em] uppercase mb-6 text-sm relative z-10">
                                {upcomingMatches.length === 0 ? "No matches found" : "No matches match your filters"}
                            </p>
                            {upcomingMatches.length === 0 && (
                                <button onClick={fetchUpcoming} className="text-stratos-accent font-mono font-bold hover:text-stratos-accent/80 transition-colors uppercase tracking-[0.2em] text-xs border-b border-stratos-accent/30 pb-1 relative z-10">Click to refresh</button>
                            )}
                        </motion.div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                        {Array.from(new Map(filteredMatches.map(m => [m.id, m])).values()).map((match, index) => {
                            const isAnalyzed = forecasts.some(p => p.game.id === match.id);
                            return (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    index={index}
                                    isAnalyzed={isAnalyzed}
                                    isLoading={isLoading}
                                    onFetchExplanation={handleFetchExplanation}
                                    onGenerateForecast={handleGenerateForecast}
                                    explanation={explanations[match.id]}
                                    loadingExplanation={loadingExplanations[match.id]}
                                    sentiment={sentiments[match.id]}
                                    contrarianSignals={contrarianSignals[match.id]}
                                />
                            );
                        })}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {forecasts.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-16 space-y-8"
                >
                    <div className="flex items-center gap-4 border-b border-stratos-border pb-4">
                        <div className="w-10 h-10 rounded-xl bg-stratos-accent/10 flex items-center justify-center border border-stratos-accent/30 shadow-[inset_0_2px_10px_rgba(23,241,209,0.1)]">
                            <CloudLightning className="w-5 h-5 text-stratos-accent" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-[0.1em] uppercase">Quantitative Matrices</h2>
                        <button 
                            onClick={handleExportToExcel}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-stratos-accent/10 hover:bg-stratos-accent/20 border border-stratos-accent/30 rounded-xl text-stratos-accent font-mono text-[10px] uppercase font-bold transition-all tracking-[0.2em] shadow-inner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export
                        </button>
                    </div>
                    
                    <motion.div layout className="grid gap-8 md:grid-cols-2" id="forecasts-grid">
                        <AnimatePresence>
                        {forecasts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="col-span-1 md:col-span-2 text-center py-20 px-6 glass-panel border border-stratos-border/50 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl shadow-2xl"
                            >
                                <div className="absolute inset-0 tech-grid opacity-30"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stratos-accent/5 rounded-full blur-[80px]"></div>
                                
                                <div className="w-20 h-20 rounded-full glass-panel border border-stratos-border/50 flex items-center justify-center mb-6 relative z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mx-auto">
                                    <CloudLightning className="w-8 h-8 text-stratos-muted opacity-40 animate-pulse" />
                                </div>
                                <p className="text-sm font-mono text-white uppercase tracking-[0.3em] relative z-10 font-bold">No forecasts yet</p>
                                <p className="text-[10px] font-mono text-stratos-muted mt-3 relative z-10 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Select a market and execute SPARTA Quantitative Inference to generate probabilistic matrices.</p>
                            </motion.div>
                        )}
                        {forecasts.map((pred, i) => (
                            <ForecastCard key={pred.id} pred={pred} index={i} />
                        ))}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
});
