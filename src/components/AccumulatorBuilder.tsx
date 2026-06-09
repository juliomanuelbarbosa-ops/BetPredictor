import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Plus, Minus, Calculator, Zap, Target, Layers } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useForecastStore } from '../stores/forecastStore';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';

import { formatCurrency, convertOdds, CURRENCIES } from '../lib/utils';

export const AccumulatorBuilder: React.FC = () => {
    const { currency, user, updateBankroll } = useUserStore();
    const { showToast } = useUIStore();
    const { oddsFormat } = useSettingsStore();
    const { forecasts, addForecast } = useForecastStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLogging, setIsLogging] = useState(false);
    const [stake, setStake] = useState<number>(10);

    const toggleMatch = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectedForecasts = useMemo(() => 
        forecasts.filter(p => selectedIds.includes(p.id)),
    [forecasts, selectedIds]);

    const stats = useMemo(() => {
        if (selectedForecasts.length === 0) return { odds: 0, prob: 0, ev: 0 };

        let totalOdds = 1;
        let totalProb = 1;

        selectedForecasts.forEach(p => {
            let odds = 1;
            let prob = 0;

            if (p.bestBet === "HOME WIN") {
                odds = p.game.oddsH || 2.0;
                prob = p.probs[0];
            } else if (p.bestBet === "DRAW") {
                odds = p.game.oddsD || 3.0;
                prob = p.probs[1];
            } else if (p.bestBet === "AWAY WIN") {
                odds = p.game.oddsA || 3.0;
                prob = p.probs[2];
            }

            totalOdds *= odds;
            totalProb *= prob;
        });

        return {
            odds: totalOdds,
            prob: totalProb * 100,
            ev: (totalProb * totalOdds) - 1
        };
    }, [selectedForecasts]);

    const handleLogAccumulator = () => {
        if (!user || selectedForecasts.length < 2) return;
        if (stake <= 0 || stake > (useUserStore.getState().bankroll || 0)) {
            showToast("Invalid stake amount", "error");
            return;
        }
        setIsLogging(true);
        
        setTimeout(() => {
            const accaId = `acca-${Date.now()}`;
            updateBankroll(prev => prev - stake);
            addForecast({
                id: accaId,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                game: {
                    id: accaId,
                    home: `${selectedForecasts.length} FOLD`,
                    away: 'ACCUMULATOR',
                    league: 'MULTI',
                    oddsH: stats.odds,
                    oddsD: 0,
                    oddsA: 0,
                    commence_time: new Date().toISOString()
                },
                probs: [stats.prob / 100, 0, 0],
                bestBet: 'ACCUMULATOR',
                confidence: stats.prob,
                edge: stats.ev * 100,
                valueText: 'ACCUMULATOR',
                predScore: 'N/A',
                stake: stake,
                isAccumulator: true,
                accumulatorLegs: selectedForecasts.map(p => ({
                    matchId: p.game.id,
                    home: p.game.home,
                    away: p.game.away,
                    market: p.bestBet === 'HOME WIN' ? 'HOME' : p.bestBet === 'DRAW' ? 'DRAW' : 'AWAY',
                    odds: (p.bestBet === 'HOME WIN' ? p.game.oddsH : p.bestBet === 'DRAW' ? p.game.oddsD : p.game.oddsA) || 1,
                    actual: null
                }))
            });
            
            setSelectedIds([]);
            setIsLogging(false);
            showToast(`Accumulator bet placed! Potential return: ${formatCurrency(stake * stats.odds, currency)}`, "success");
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative z-10">
            {/* Accumulator Builder Header */}
            <div className="glass-panel border-stratos-border/50 rounded-[2.5rem] p-10 mb-10 flex justify-between items-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute inset-0 tech-grid-dense opacity-20 pointer-events-none z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-stratos-accent/5 via-transparent to-transparent pointer-events-none mix-blend-screen z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-stratos-accent/10 blur-[150px] pointer-events-none rounded-full z-0 mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-stratos-border/0 via-stratos-accent/30 to-stratos-border/0 z-10"></div>
                
                <div className="flex items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stratos-accent/20 blur-xl rounded-full"></div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stratos-card to-black flex items-center justify-center border border-stratos-accent/30 shadow-[inset_0_0_20px_rgba(23,241,209,0.1)] relative z-10">
                            <Layers className="w-10 h-10 text-stratos-accent" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-[0.2em] uppercase mb-4 drop-shadow-md">Matrix Builder</h1>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-stratos-accent animate-pulse shadow-[0_0_10px_rgba(23,241,209,1)]"></span>
                            <p className="text-[10px] text-stratos-accent/80 font-mono uppercase tracking-[0.4em] font-bold">Correlated Probability Synthesizer</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SELECTION LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold">Network Forecasts</h3>
                        <span className="text-[10px] font-mono text-stratos-accent px-3 py-1 rounded-full bg-stratos-accent/10 border border-stratos-accent/20 shadow-inner">
                            {forecasts.filter(p => !p.isManual && !p.isAccumulator).length} ACTIVE
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forecasts.filter(p => !p.isManual && !p.isAccumulator).map((pred, i) => (
                            <motion.div 
                                key={pred.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => toggleMatch(pred.id)}
                                className={`group relative p-6 rounded-[2rem] cursor-pointer overflow-hidden transition-all duration-500 h-full ${
                                    selectedIds.includes(pred.id) 
                                        ? 'bg-gradient-to-br from-[#121215] to-[#0A0A0C] border-stratos-accent/60 shadow-[0_0_40px_rgba(23,241,209,0.15)] ring-1 ring-stratos-accent/30' 
                                        : 'glass-panel border-stratos-border/50 hover:border-stratos-accent/40 shadow-[0_0_30px_rgba(23,241,209,0.02)] backdrop-blur-md'
                                } border`}
                            >
                                <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 blur-[50px] rounded-full pointer-events-none transition-all duration-700 ${selectedIds.includes(pred.id) ? 'bg-stratos-accent/20 opacity-100' : 'bg-stratos-accent/10 opacity-0 group-hover:opacity-50'}`}></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-[0.2em] font-bold shadow-inner ${
                                        selectedIds.includes(pred.id)
                                            ? 'bg-stratos-accent/10 border-stratos-accent/40 text-stratos-accent shadow-[inset_0_0_10px_rgba(23,241,209,0.1)]'
                                            : 'glass-panel border-stratos-border/50 text-stratos-muted group-hover:border-stratos-accent/30'
                                    }`}>
                                        {pred.bestBet}
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                                        selectedIds.includes(pred.id)
                                            ? 'bg-stratos-accent text-black border-stratos-accent shadow-[0_0_20px_rgba(23,241,209,0.6)] rotate-45'
                                            : 'glass-panel border-stratos-border text-stratos-muted group-hover:border-stratos-accent/50 group-hover:text-stratos-accent group-hover:shadow-[0_0_15px_rgba(23,241,209,0.2)]'
                                    }`}>
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                                <h4 className="text-md font-bold text-white mb-8 relative z-10 tracking-wide flex items-center gap-3">
                                    <span>{pred.game.home}</span>
                                    <span className="text-stratos-muted/50 font-mono text-xs">VS</span>
                                    <span>{pred.game.away}</span>
                                </h4>
                                <div className="flex items-center justify-between border-t border-stratos-border/30 pt-4 relative z-10 group-hover:border-stratos-accent/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Target className={`w-4 h-4 transition-colors ${selectedIds.includes(pred.id) ? 'text-stratos-accent' : 'text-stratos-muted group-hover:text-stratos-accent/60'}`} />
                                        <span className={`text-[11px] font-mono tracking-widest ${selectedIds.includes(pred.id) ? 'text-stratos-accent font-bold' : 'text-stratos-muted group-hover:text-white transition-colors'}`}>{pred.confidence}% CONF</span>
                                    </div>
                                    <span className={`text-xs font-mono font-bold tracking-widest px-2 py-1 rounded-md ${selectedIds.includes(pred.id) ? 'bg-stratos-accent/20 text-stratos-accent' : 'glass-panel text-stratos-muted group-hover:text-white transition-colors'}`}>
                                        { convertOdds((pred.bestBet === "HOME WIN" ? pred.game.oddsH : pred.bestBet === "DRAW" ? pred.game.oddsD : pred.game.oddsA) || 1, oddsFormat) }
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        {forecasts.filter(p => !p.isManual && !p.isAccumulator).length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="col-span-1 md:col-span-2 p-16 flex flex-col items-center text-center glass-panel border-2 border-stratos-border/50 border-dashed rounded-[2.5rem] relative overflow-hidden backdrop-blur-md"
                            >
                                <div className="absolute inset-0 tech-grid opacity-30"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stratos-accent/5 rounded-full blur-[80px]"></div>
                                
                                <div className="w-20 h-20 rounded-full glass-panel border border-stratos-border/50 flex items-center justify-center mb-6 relative z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                                    <Target className="w-8 h-8 text-stratos-muted opacity-40 animate-pulse" />
                                </div>
                                <p className="text-sm font-mono text-white uppercase tracking-[0.3em] font-bold mb-3 relative z-10">No Active Matrix Items</p>
                                <p className="text-[10px] font-mono text-stratos-muted max-w-xs leading-relaxed uppercase tracking-wider relative z-10">Deploy the SPARTA Quantitative Engine to generate localized branch probabilities.</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* SLIP / SUMMARY */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="glass-panel border-stratos-border/50 rounded-[2.5rem] overflow-hidden sticky top-8 shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="p-6 border-b border-stratos-border/30 bg-gradient-to-r from-stratos-card to-transparent flex items-center justify-between relative">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-stratos-accent/30 via-transparent to-transparent"></div>
                            <h3 className="text-xs font-mono text-white uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                                <Calculator className="w-4 h-4 text-stratos-accent" />
                                Matrix Slip
                            </h3>
                            <span className="text-[10px] font-mono text-stratos-accent bg-stratos-accent/10 px-3 py-1 rounded-md border border-stratos-accent/20 font-bold shadow-[inset_0_0_10px_rgba(23,241,209,0.05)]">
                                {selectedForecasts.length} LEGS
                            </span>
                        </div>
                        
                        <div className="p-3 glass-panel min-h-[250px] max-h-[450px] overflow-y-auto custom-scrollbar relative">
                            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>
                            <AnimatePresence mode="popLayout">
                                {selectedForecasts.map((p) => (
                                    <motion.div 
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                        className="mb-2 last:mb-0"
                                    >
                                        <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-stratos-border hover:border-stratos-accent/30 shadow-inner group transition-colors">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-xs font-bold text-white truncate mb-1 tracking-wide">{p.game.home} <span className="text-stratos-muted text-[10px] mx-1">vs</span> {p.game.away}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-stratos-accent"></span>
                                                    <p className="text-[10px] font-mono text-stratos-accent uppercase tracking-widest font-bold">{p.bestBet}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="text-[11px] font-mono text-white font-black block tracking-widest">{convertOdds((p.bestBet === "HOME WIN" ? p.game.oddsH : p.bestBet === "DRAW" ? p.game.oddsD : p.game.oddsA) || 1, oddsFormat)}</span>
                                                </div>
                                                <button onClick={() => toggleMatch(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center glass-panel text-stratos-muted hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 border border-stratos-border transition-all">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {selectedForecasts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-stratos-accent/20 rounded-full blur-xl animate-pulse"></div>
                                        <div className="w-16 h-16 rounded-full border border-stratos-border border-dashed flex items-center justify-center relative z-10 glass-panel backdrop-blur-md">
                                            <Plus className="w-6 h-6 text-stratos-accent opacity-80" />
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-mono text-white uppercase tracking-[0.3em] font-bold mb-2">Awaiting Parameters</p>
                                    <p className="text-[10px] font-mono text-stratos-muted/60 tracking-widest uppercase leading-relaxed max-w-[200px]">Select local forecasts to synthesize odds</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gradient-to-b from-black/20 to-black/80 border-t border-stratos-border/50 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-stratos-accent/50 to-transparent"></div>
                            
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between items-end border-b border-stratos-border/30 pb-4">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Total Matrix Odds</span>
                                    <span className="text-3xl font-black font-display text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                        {convertOdds(stats.odds, oddsFormat)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center glass-panel p-2 rounded-lg border border-stratos-border/30">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Win Probability</span>
                                    <span className="text-xs font-mono text-stratos-accent font-bold px-3 py-1 rounded-md bg-stratos-accent/10 border border-stratos-accent/30 shadow-[inset_0_0_10px_rgba(23,241,209,0.1)]">
                                        {stats.prob.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center glass-panel p-2 rounded-lg border border-stratos-border/30">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Expected Value</span>
                                    <span className={`text-[10px] px-3 py-1 rounded-md font-mono font-bold border tracking-widest ${stats.ev > 0 ? 'bg-stratos-accent/10 border-stratos-accent/30 text-stratos-accent shadow-[inset_0_0_10px_rgba(23,241,209,0.1)]' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                                        {stats.ev > 0 ? '+' : ''}{(stats.ev * 100).toFixed(1)}% EV
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 glass-panel p-4 rounded-[1.5rem] border border-stratos-border/50">
                                <div className="flex justify-between items-center text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold px-1">
                                    <span>Stake Amount</span>
                                    <span className="text-stratos-accent">{CURRENCIES.find(c => c.code === currency)?.symbol || '$'}{stake.toFixed(2)}</span>
                                </div>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stratos-accent font-mono font-bold">
                                        {CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                                    </span>
                                    <input 
                                        type="number" 
                                        value={stake}
                                        onChange={(e) => setStake(Number(e.target.value))}
                                        className="w-full glass-panel border border-stratos-border/50 rounded-xl py-3 pl-10 pr-4 text-lg text-white font-mono font-bold focus:outline-none focus:border-stratos-accent/50 focus:ring-1 focus:ring-stratos-accent/30 transition-all shadow-inner hover:border-stratos-border"
                                        min="1"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-2 px-1">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Potential Return</span>
                                    <span className="text-sm font-mono text-white font-bold">{formatCurrency((stats.odds * stake), currency)}</span>
                                </div>
                            </div>

                            <button 
                                disabled={selectedForecasts.length < 2 || isLogging}
                                onClick={handleLogAccumulator}
                                className="w-full py-5 rounded-2xl bg-stratos-accent text-black font-mono font-bold text-xs tracking-[0.3em] uppercase hover:bg-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-30 disabled:hover:-translate-y-0 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(23,241,209,0.3)] disabled:shadow-none relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {isLogging ? <Zap className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                    <span>{isLogging ? 'Executing Swap...' : 'Commit Matrix'}</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
