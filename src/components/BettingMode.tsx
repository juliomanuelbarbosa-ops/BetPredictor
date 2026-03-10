import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, TrendingUp, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

interface BettingModeProps {
    upcomingMatches: any[];
    bankroll: number;
    predictions: any[];
    saveBankroll: (val: number | ((prev: number) => number)) => void;
    savePredictions: (newPredictions: any[] | ((prev: any[]) => any[])) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
    isLoading: boolean;
    fetchUpcoming: () => void;
}

export function BettingMode({
    upcomingMatches,
    bankroll,
    predictions,
    saveBankroll,
    savePredictions,
    showToast,
    isLoading,
    fetchUpcoming
}: BettingModeProps) {
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [stake, setStake] = useState<number>(10);
    const [selectedMarket, setSelectedMarket] = useState<'HOME' | 'DRAW' | 'AWAY' | null>(null);

    useEffect(() => {
        if (upcomingMatches.length === 0 && !isLoading) {
            fetchUpcoming();
        }
    }, [upcomingMatches.length, isLoading, fetchUpcoming]);

    const handlePlaceBet = () => {
        if (!selectedMatch || !selectedMarket) {
            showToast("Please select a match and a market.", "error");
            return;
        }
        if (stake <= 0 || stake > bankroll) {
            showToast("Invalid stake amount.", "error");
            return;
        }

        let odds = 2.0;
        let bestBet = "";
        if (selectedMarket === 'HOME') {
            odds = selectedMatch.oddsH || 2.0;
            bestBet = "HOME WIN";
        } else if (selectedMarket === 'DRAW') {
            odds = selectedMatch.oddsD || 3.0;
            bestBet = "DRAW";
        } else if (selectedMarket === 'AWAY') {
            odds = selectedMatch.oddsA || 3.0;
            bestBet = "AWAY WIN";
        }

        const potentialReturn = stake * odds;

        const newBet = {
            id: Math.random().toString(36).substring(2, 9),
            game: selectedMatch,
            probs: [0, 0, 0], // Mock probs for manual bet
            bestBet,
            confidence: 100, // Manual bet
            edge: 0,
            valueText: "MANUAL BET",
            predScore: "N/A",
            stake,
            features: [],
            actual: null,
            bytezAnalysis: { report: "Manual bet placed by user." },
            isManual: true
        };

        saveBankroll(prev => prev - stake);
        savePredictions(prev => [newBet, ...prev]);
        
        showToast(`Bet placed successfully! Potential return: $${potentialReturn.toFixed(2)}`);
        setSelectedMatch(null);
        setSelectedMarket(null);
        setStake(10);
    };

    return (
        <section className="mt-12 animate-in fade-in duration-700 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: MATCH SELECTION */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white tracking-tight">Available Markets</h2>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live API Odds</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchUpcoming}
                            disabled={isLoading}
                            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10 disabled:opacity-50"
                        >
                            {isLoading ? 'Fetching...' : 'Refresh Odds'}
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {upcomingMatches.map((match, idx) => (
                                <motion.div 
                                    key={match.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => {
                                        setSelectedMatch(match);
                                        setSelectedMarket(null);
                                    }}
                                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                        selectedMatch?.id === match.id 
                                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]' 
                                            : 'bg-black/60 border-white/5 hover:border-white/20 hover:bg-black/80'
                                    }`}
                                >
                                    {selectedMatch?.id === match.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
                                    )}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                {match.league}
                                            </span>
                                            {match.isMock && (
                                                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                                                    Mock Data
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-400">
                                            {new Date(match.commence_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-display font-bold text-white mb-2">{match.home}</span>
                                            <span className="text-lg font-mono text-blue-400">{match.oddsH?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Draw</span>
                                            <span className="text-lg font-mono text-gray-400">{match.oddsD?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-display font-bold text-white mb-2">{match.away}</span>
                                            <span className="text-lg font-mono text-blue-400">{match.oddsA?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {!isLoading && upcomingMatches.length === 0 && (
                            <div className="text-center py-12 border border-white/5 rounded-3xl bg-black/40">
                                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">No matches available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: BET SLIP */}
                <div className="lg:col-span-4">
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white tracking-tight">Bet Slip</h3>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Bankroll: ${bankroll.toFixed(2)}</p>
                            </div>
                        </div>

                        {!selectedMatch ? (
                            <div className="text-center py-12 opacity-50">
                                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Select a match to bet</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 text-center">
                                    <p className="text-sm font-bold text-white">{selectedMatch.home} vs {selectedMatch.away}</p>
                                    <p className="text-[10px] font-mono text-gray-500 mt-1">{selectedMatch.league}</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Select Market</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => setSelectedMarket('HOME')}
                                            className={`py-3 rounded-xl border font-mono text-sm transition-all ${
                                                selectedMarket === 'HOME' 
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                                    : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <span className="block text-[9px] mb-1">HOME</span>
                                            {selectedMatch.oddsH?.toFixed(2) || '-'}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMarket('DRAW')}
                                            className={`py-3 rounded-xl border font-mono text-sm transition-all ${
                                                selectedMarket === 'DRAW' 
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                                    : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <span className="block text-[9px] mb-1">DRAW</span>
                                            {selectedMatch.oddsD?.toFixed(2) || '-'}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMarket('AWAY')}
                                            className={`py-3 rounded-xl border font-mono text-sm transition-all ${
                                                selectedMarket === 'AWAY' 
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                                    : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <span className="block text-[9px] mb-1">AWAY</span>
                                            {selectedMatch.oddsA?.toFixed(2) || '-'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Stake Amount</p>
                                        <p className="text-[10px] font-mono text-emerald-400">Max: ${bankroll.toFixed(2)}</p>
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono group-focus-within:text-blue-400 transition-colors">$</span>
                                        <input 
                                            type="number" 
                                            value={stake}
                                            onChange={(e) => setStake(Number(e.target.value))}
                                            min="1"
                                            max={bankroll}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                {selectedMarket && (
                                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Potential Return</span>
                                        <span className="text-lg font-black text-white font-mono">
                                            ${(stake * (
                                                selectedMarket === 'HOME' ? (selectedMatch.oddsH || 2) : 
                                                selectedMarket === 'DRAW' ? (selectedMatch.oddsD || 3) : 
                                                (selectedMatch.oddsA || 3)
                                            )).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <button 
                                    onClick={handlePlaceBet}
                                    disabled={!selectedMarket || stake <= 0 || stake > bankroll}
                                    className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black tracking-[0.2em] transition-all duration-300 disabled:opacity-30 disabled:grayscale hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase text-sm flex justify-center items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Place Bet
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* RECENT MANUAL BETS */}
                    <div className="mt-8 glass-panel p-6 rounded-[2rem] border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Recent Manual Bets
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {predictions.filter(p => p.isManual).length === 0 ? (
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center py-6">No manual bets placed yet</p>
                            ) : (
                                predictions.filter(p => p.isManual).slice(0, 5).map((bet, idx) => (
                                    <div key={bet.id || idx} className="bg-black/40 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-white">{bet.game.home} vs {bet.game.away}</p>
                                            <p className="text-[10px] font-mono text-gray-400 mt-1">{bet.bestBet} • ${bet.stake}</p>
                                        </div>
                                        <div>
                                            {bet.actual === 'WON' ? (
                                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 tracking-widest">WON</span>
                                            ) : bet.actual === 'LOST' ? (
                                                <span className="text-[9px] font-mono text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20 tracking-widest">LOST</span>
                                            ) : (
                                                <span className="text-[9px] font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 tracking-widest">PENDING</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
