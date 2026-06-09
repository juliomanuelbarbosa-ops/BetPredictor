import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Calendar, LayoutGrid, Activity, DollarSign, History as HistoryIcon } from 'lucide-react';
import { calculateKellyStake, formatCurrency, generateId } from '../lib/utils';
import { useUserStore } from '../stores/userStore';
import { useForecastStore } from '../stores/forecastStore';
import { useUIStore } from '../stores/uiStore';
import { useMatchStore } from '../stores/matchStore';
import { useSettingsStore } from '../stores/settingsStore';
import { analyzeUncertainty, MetacognitiveReport } from '../lib/metacognition';
import { getTimingAdvice, TimingAdvice } from '../lib/betTimingEngine';
import { optimizePortfolio, Bet, PortfolioOptimiserResult } from '../lib/portfolioOptimiser';
import { getComprehensiveMatchData } from '../api/footballApi';

// Import refactored components
import { BetSlip } from './betting/BetSlip';
import { MatchList } from './betting/MatchList';
import { PortfolioAnalysis } from './betting/PortfolioAnalysis';
import { BetHistory } from './betting/BetHistory';
import { MatchDetailsModal } from './betting/MatchDetailsModal';
import { ConfirmModal } from './betting/ConfirmModal';
import { fireWinningConfetti } from '../lib/confetti';

export const BettingMode = React.memo(function BettingMode() {
    const { user, bankroll, currency, updateBankroll, resolveForecast: resolveBankroll } = useUserStore();
    const { forecasts, addForecast, resolveForecast: resolveForecastInStore, resolveAccumulatorLeg } = useForecastStore();
    const { showToast, isLoading } = useUIStore();
    const { upcomingMatches, fetchUpcoming } = useMatchStore();
    const { oddsFormat } = useSettingsStore();

    const [selections, setSelections] = useState<any[]>([]);
    const [stake, setStake] = useState<number>(10);
    const [isAccumulator, setIsAccumulator] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [viewMode, setViewMode] = useState<'SLIP' | 'HISTORY' | 'PORTFOLIO'>('SLIP');
    const [showMatchDetails, setShowMatchDetails] = useState<any | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [kellyFraction, setKellyFraction] = useState<number>(1); // 1 = Full Kelly, 0.5 = Half Kelly
    const [uncertaintyReport, setUncertaintyReport] = useState<MetacognitiveReport | null>(null);
    const [timingAdvice, setTimingAdvice] = useState<TimingAdvice | null>(null);
    const [portfolioResult, setPortfolioResult] = useState<PortfolioOptimiserResult | null>(null);
    const [matchDetailsData, setMatchDetailsData] = useState<any | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        if (showMatchDetails) {
            setIsLoadingDetails(true);
            getComprehensiveMatchData(showMatchDetails.home, showMatchDetails.away, showMatchDetails.league, showMatchDetails.sport_key)
                .then(data => {
                    setMatchDetailsData(data);
                })
                .catch(err => {
                    console.error("Failed to fetch match details", err);
                })
                .finally(() => {
                    setIsLoadingDetails(false);
                });
        } else {
            setMatchDetailsData(null);
        }
    }, [showMatchDetails]);

    useEffect(() => {
        // Map active bets for portfolio optimization
        const activeBets: Bet[] = forecasts.filter(p => p.actual === null).map(p => ({
            id: p.id,
            match: p.isAccumulator ? `${p.game.home} ACCUMULATOR` : `${p.game.home} vs ${p.game.away}`,
            league: p.game.league || 'Unknown',
            date: new Date(p.game.commence_time),
            selection: p.isAccumulator ? 'ACCUMULATOR' : p.bestBet,
            odds: p.isAccumulator ? p.game.oddsH : (p.bestBet === 'HOME WIN' ? p.game.oddsH || 2.0 : p.bestBet === 'AWAY WIN' ? p.game.oddsA || 3.0 : p.game.oddsD || 3.0),
            probability: p.isAccumulator ? (p.confidence / 100) : (p.probs ? (p.bestBet === 'HOME WIN' ? p.probs[0] : p.bestBet === 'AWAY WIN' ? p.probs[2] : p.probs[1]) : 0.5),
            isHomeFavourite: p.isAccumulator ? false : ((p.game.oddsH || 2.0) < (p.game.oddsA || 3.0)),
            isUnderdog: p.isAccumulator ? false : (p.bestBet === 'HOME WIN' ? (p.game.oddsH || 2.0) > (p.game.oddsA || 3.0) : p.bestBet === 'AWAY WIN' ? (p.game.oddsA || 3.0) > (p.game.oddsH || 2.0) : false)
        }));
        
        if (activeBets.length > 0) {
            setPortfolioResult(optimizePortfolio(activeBets, bankroll));
        } else {
            setPortfolioResult(null);
        }
    }, [forecasts, bankroll]);

    const activeMatch = React.useMemo(() => {
        if (activeMatchId) {
            const found = selections.find(s => s.match.id === activeMatchId);
            if (found) return found.match;
        }
        return selections.length > 0 ? selections[selections.length - 1].match : null;
    }, [activeMatchId, selections]);

    useEffect(() => {
        if (activeMatch) {
            const baseConfidence = activeMatch.probs ? Math.max(...activeMatch.probs) * 100 : 75;
            const report = analyzeUncertainty(activeMatch, baseConfidence); 
            setUncertaintyReport(report);
            setTimingAdvice(getTimingAdvice(activeMatch.commence_time));
        } else {
            setUncertaintyReport(null);
            setTimingAdvice(null);
        }
    }, [activeMatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'r') {
                    e.preventDefault();
                    fetchUpcoming();
                }
            }
            if (e.key === 'Escape') {
                setSelections([]);
                setShowConfirmModal(false);
                setShowMatchDetails(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fetchUpcoming]);

    useEffect(() => {
        if (upcomingMatches.length === 0 && !isLoading) {
            fetchUpcoming();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upcomingMatches.length, isLoading]);

    // Calculate Kelly Stake
    useEffect(() => {
        if (selections.length > 0) {
            let totalOdds = 1;
            let totalProb = 1;

            if (isAccumulator) {
                selections.forEach(s => {
                    const odds = s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA;
                    const prob = s.match.probs ? (s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.market === 'AWAY' ? s.match.probs[2] : 0.33) : 0.33;
                    totalOdds *= (odds || 1);
                    totalProb *= (prob || 0.33);
                });
            } else {
                const s = selections[selections.length - 1];
                totalOdds = s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA;
                totalProb = s.match.probs ? (s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.market === 'AWAY' ? s.match.probs[2] : 0.33) : 0.33;
            }

            const savedFraction = localStorage.getItem('kelly_fraction');
            const fraction = savedFraction ? parseFloat(savedFraction) : kellyFraction;
            
            const suggestedStake = calculateKellyStake(totalProb * 100, totalOdds, fraction, 0, bankroll);
            
            if (suggestedStake > 0) {
                setStake(Math.min(suggestedStake, bankroll * 0.2)); // Allow up to 20% for accumulators
            } else {
                setStake(0);
            }
        }
    }, [selections, isAccumulator, bankroll, kellyFraction]);

    const toggleSelection = (match: any, market: 'HOME' | 'DRAW' | 'AWAY') => {
        setSelections(prev => {
            const existing = prev.find(s => s.match.id === match.id);
            if (existing) {
                if (existing.market === market) {
                    return prev.filter(s => s.match.id !== match.id);
                }
                return prev.map(s => s.match.id === match.id ? { ...s, market } : s);
            }
            return [...prev, { match, market }];
        });
        setViewMode('SLIP');
    };

    const removeSelection = (matchId: string) => {
        setSelections(prev => prev.filter(s => s.match.id !== matchId));
    };

    const clearSlip = () => {
        setSelections([]);
        setStake(10);
        setIsAccumulator(false);
    };

    const calculateTotalOdds = () => {
        if (selections.length === 0) return 0;
        if (!isAccumulator) {
            const s = selections[selections.length - 1];
            return (s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA) || 1;
        }
        return selections.reduce((acc, s) => {
            const odds = (s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA) || 1;
            return acc * odds;
        }, 1);
    };

    const calculateTotalProbability = () => {
        if (selections.length === 0) return 0;
        if (!isAccumulator) {
            const s = selections[selections.length - 1];
            if (!s.match.probs) return 0.33;
            return s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.match.probs[2];
        }
        return selections.reduce((acc, s) => {
            const prob = s.match.probs ? (s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.match.probs[2]) : 0.33;
            return acc * prob;
        }, 1);
    };

    const handlePlaceBet = () => {
        if (selections.length === 0) {
            showToast("Please select at least one match.", "error");
            return;
        }
        if (stake <= 0 || stake > bankroll) {
            showToast("Invalid stake amount.", "error");
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmBet = () => {
        const totalOdds = calculateTotalOdds();
        
        if (isAccumulator && selections.length > 1) {
            const newBet = {
                id: generateId(),
                userId: user?.uid || 'anonymous',
                createdAt: new Date().toISOString(),
                game: {
                    id: 'ACC-' + generateId(),
                    home: selections.map(s => s.match.home).join(' + '),
                    away: 'Accumulator',
                    league: 'MULTI',
                    commence_time: selections[0].match.commence_time,
                    oddsH: totalOdds,
                    oddsD: 0,
                    oddsA: 0
                },
                bestBet: 'ACCUMULATOR',
                confidence: Math.round(selections.reduce((acc, s) => acc * (s.match.probs ? (s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.match.probs[2]) : 0.33), 1) * 100),
                probs: [1, 0, 0],
                predScore: 'ACC',
                stake: stake,
                actual: null,
                isAccumulator: true,
                isManual: true,
                bytezAnalysis: { report: `Accumulator with ${selections.length} legs.` },
                accumulatorLegs: selections.map(s => ({
                    matchId: s.match.id,
                    home: s.match.home,
                    away: s.match.away,
                    market: s.market,
                    odds: (s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA) || 1,
                    actual: null
                }))
            };
            
            updateBankroll(prev => prev - stake);
            addForecast(newBet);
            showToast(`Accumulator bet placed! Potential return: ${formatCurrency(stake * totalOdds, currency)}`, "success");
        } else {
            // Place as singles
            const stakePerBet = stake / selections.length;
            updateBankroll(prev => prev - stake);
            selections.forEach(s => {
                const odds = (s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA) || 1;
                const newBet = {
                    id: generateId(),
                    userId: user?.uid || 'anonymous',
                    createdAt: new Date().toISOString(),
                    game: s.match,
                    bestBet: s.market === 'HOME' ? 'HOME WIN' : s.market === 'DRAW' ? 'DRAW' : 'AWAY WIN',
                    confidence: Math.round((s.match.probs ? (s.market === 'HOME' ? s.match.probs[0] : s.market === 'DRAW' ? s.match.probs[1] : s.market === 'AWAY' ? s.match.probs[2] : 0.33) : 0.33) * 100),
                    probs: s.match.probs || [0.33, 0.33, 0.33],
                    predScore: '?',
                    stake: stakePerBet,
                    actual: null,
                    isManual: true,
                    bytezAnalysis: { report: "Manual single bet." }
                };
                addForecast(newBet);
            });
            showToast(`${selections.length} single bets placed!`, "success");
        }

        setShowConfirmModal(false);
        clearSlip();
    };

    const handleResolveLeg = (betId: string, legIndex: number, status: string) => {
        const betBefore = forecasts.find(p => p.id === betId);
        resolveAccumulatorLeg(betId, legIndex, status);
        const betAfter = useForecastStore.getState().forecasts.find(p => p.id === betId);
        
        if (betBefore?.actual === null && betAfter?.actual !== null) {
            if (betAfter.actual === 'WON') {
                resolveBankroll(true, betAfter.stake, betAfter.game.oddsH);
                fireWinningConfetti();
                showToast("Accumulator WON!", "success");
            } else if (betAfter.actual === 'LOST') {
                resolveBankroll(false, betAfter.stake, betAfter.game.oddsH);
                showToast("Accumulator LOST", "error");
            } else if (betAfter.actual === 'VOID') {
                updateBankroll(prev => prev + betAfter.stake);
                showToast("Accumulator VOID", "success");
            }
        } else {
            showToast(`Leg marked as ${status}`, "success");
        }
    };

    return (
        <section className="mt-12 animate-in fade-in duration-700 relative z-10 space-y-8">
            {/* Betting Mode Header */}
            <div className="flex items-center justify-between glass-panel border border-stratos-border/50 p-6 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group/header shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-stratos-accent/10 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-stratos-accent/5 blur-[80px] pointer-events-none rounded-full"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-stratos-accent/10 flex items-center justify-center border border-stratos-accent/30 shadow-[inset_0_0_20px_rgba(23,241,209,0.15)] ring-1 ring-white/5">
                        <DollarSign className="w-7 h-7 text-stratos-accent" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-black text-white tracking-[0.1em] uppercase drop-shadow-md">Betting Terminal</h1>
                        <p className="text-[10px] text-stratos-muted font-mono uppercase tracking-[0.3em] font-bold mt-1">Execute systemic trades & optimize portfolio risk</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6 relative z-10">
                    <div className="text-right p-4 rounded-xl glass-panel border border-stratos-border/50 shadow-inner group">
                        <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">Current Bankroll</p>
                        <p className="text-2xl font-mono font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{formatCurrency(bankroll, currency)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: MATCH SELECTION */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                <Calendar className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Available Markets</h2>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Live Liquidity Feeds</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchUpcoming}
                            disabled={isLoading}
                            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest border border-blue-500/30 px-5 py-2.5 rounded-xl hover:bg-blue-500/10 disabled:opacity-50 font-bold shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                        >
                            {isLoading ? 'Fetching...' : 'Resync Liquidity'}
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <MatchList 
                            upcomingMatches={upcomingMatches}
                            isLoading={isLoading}
                            selections={selections}
                            oddsFormat={oddsFormat}
                            toggleSelection={toggleSelection}
                            setShowMatchDetails={setShowMatchDetails}
                        />
                    </div>
                </div>

                {/* RIGHT: BET SLIP & HISTORY */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex gap-3 mb-6 glass-panel p-2 rounded-[2rem] border border-stratos-border/50 shadow-inner overflow-x-auto custom-scrollbar relative z-10 w-full backdrop-blur-md">
                        <button 
                            onClick={() => setViewMode('SLIP')}
                            className={`flex-1 min-w-[120px] py-3.5 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 ${viewMode === 'SLIP' ? 'bg-stratos-accent/20 text-white border border-stratos-accent/30 shadow-[inset_0_0_20px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/50' : 'bg-transparent text-stratos-muted hover:text-white hover:bg-stratos-accent/10 border border-transparent'}`}
                        >
                            <LayoutGrid className={`w-4 h-4 ${viewMode === 'SLIP' ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : ''}`} /> Execution Matrix
                        </button>
                        <button 
                            onClick={() => setViewMode('PORTFOLIO')}
                            className={`flex-1 min-w-[120px] py-3.5 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 ${viewMode === 'PORTFOLIO' ? 'bg-purple-500/20 text-white border border-purple-500/30 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' : 'bg-transparent text-stratos-muted hover:text-white hover:bg-stratos-accent/10 border border-transparent'}`}
                        >
                            <Activity className={`w-4 h-4 ${viewMode === 'PORTFOLIO' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} /> Risk Portfolio
                        </button>
                        <button 
                            onClick={() => setViewMode('HISTORY')}
                            className={`flex-1 min-w-[120px] py-3.5 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 ${viewMode === 'HISTORY' ? 'bg-stratos-accent/20 text-white border border-stratos-accent/30 shadow-[inset_0_0_20px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/50' : 'bg-transparent text-stratos-muted hover:text-white hover:bg-stratos-accent/10 border border-transparent'}`}
                        >
                            <HistoryIcon className={`w-4 h-4 ${viewMode === 'HISTORY' ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : ''}`} /> Trade Ledger
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {viewMode === 'SLIP' ? (
                            <BetSlip 
                                selections={selections}
                                bankroll={bankroll}
                                currency={currency}
                                oddsFormat={oddsFormat}
                                stake={stake}
                                setStake={setStake}
                                isAccumulator={isAccumulator}
                                setIsAccumulator={setIsAccumulator}
                                kellyFraction={kellyFraction}
                                setKellyFraction={setKellyFraction}
                                calculateTotalOdds={calculateTotalOdds}
                                calculateTotalProbability={calculateTotalProbability}
                                calculateKellyStake={calculateKellyStake}
                                handlePlaceBet={handlePlaceBet}
                                clearSlip={clearSlip}
                                setActiveMatchId={setActiveMatchId}
                                activeMatchId={activeMatchId}
                                removeSelection={removeSelection}
                                uncertaintyReport={uncertaintyReport}
                                timingAdvice={timingAdvice}
                            />
                        ) : viewMode === 'HISTORY' ? (
                            <BetHistory 
                                forecasts={forecasts}
                                currency={currency}
                                oddsFormat={oddsFormat}
                                handleResolveLeg={handleResolveLeg}
                                resolveForecastInStore={resolveForecastInStore}
                                resolveBankroll={resolveBankroll}
                                updateBankroll={updateBankroll}
                                showToast={showToast}
                            />
                        ) : (
                            <PortfolioAnalysis 
                                portfolioResult={portfolioResult}
                                currency={currency}
                                oddsFormat={oddsFormat}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
            {/* CONFIRMATION MODAL */}
            <ConfirmModal 
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                selections={selections}
                isAccumulator={isAccumulator}
                stake={stake}
                currency={currency}
                oddsFormat={oddsFormat}
                calculateTotalOdds={calculateTotalOdds}
                confirmBet={confirmBet}
            />

            <MatchDetailsModal 
                showMatchDetails={showMatchDetails}
                setShowMatchDetails={setShowMatchDetails}
                matchDetailsData={matchDetailsData}
                isLoadingDetails={isLoadingDetails}
                selections={selections}
                oddsFormat={oddsFormat}
                toggleSelection={toggleSelection}
            />
        </section>
    );
});
