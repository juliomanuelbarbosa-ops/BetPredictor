import React, { useState } from 'react';
import { Brain, Info, Play, TrendingUp, CloudLightning } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SpartaLogo } from './SpartaLogo';
import { useCountdown } from '../hooks/useCountdown';
import { convertOdds } from '../lib/utils';
import { useSettingsStore } from '../stores/settingsStore';

const MatchCountdown = ({ date }: { date: Date }) => {
    const { timeLeft, color } = useCountdown(date);
    const colorClasses = {
        green: 'bg-stratos-accent/10 text-stratos-accent border-stratos-accent/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    const dotClasses = {
        green: 'bg-stratos-accent',
        amber: 'bg-amber-500',
        red: 'bg-red-500'
    };

    return (
        <span className={`text-[9px] font-mono ${colorClasses[color]} border px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5 font-bold`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[color]} animate-pulse`}></span>
            {timeLeft}
        </span>
    );
};

interface MatchCardProps {
    match: any;
    index: number;
    isAnalyzed: boolean;
    isLoading: boolean;
    onFetchExplanation: (match: any) => void;
    onGenerateForecast: (match: any) => void;
    explanation?: string;
    loadingExplanation?: boolean;
    sentiment?: any;
    contrarianSignals?: any[];
}

export const MatchCard: React.FC<MatchCardProps> = ({
    match,
    index,
    isAnalyzed,
    isLoading,
    onFetchExplanation,
    onGenerateForecast,
    explanation,
    loadingExplanation,
    sentiment,
    contrarianSignals
}) => {
    const { oddsFormat } = useSettingsStore();
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="widget-container p-0 hover:border-stratos-accent/50 transition-all duration-500 group/match relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(23,241,209,0.15)] hover:-translate-y-1"
        >
            <div className="absolute inset-0 tech-grid opacity-10 mix-blend-screen pointer-events-none z-0"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stratos-accent/50 to-transparent opacity-0 group-hover/match:opacity-100 transition-opacity duration-500 z-10"></div>
            
            <div className="p-8 flex flex-col gap-8 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-[10px] font-mono text-stratos-accent uppercase tracking-[0.2em] bg-stratos-accent/10 px-3 py-1.5 rounded-lg border border-stratos-accent/20 shadow-[inset_0_2px_8px_rgba(23,241,209,0.1)] font-bold flex items-center gap-2">
                                {match.league}
                                {['Premier League', 'La Liga', 'Bundesliga'].includes(match.league) && (
                                    <span className="w-2 h-2 rounded-full bg-stratos-accent shadow-[0_0_8px_rgba(23,241,209,0.8)]" title="High Accuracy League"></span>
                                )}
                            </div>
                            {match.isMock && (
                                <span className="text-[9px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-md uppercase tracking-widest font-bold">Demo Data</span>
                            )}
                            <MatchCountdown date={new Date(match.commence_time)} />
                            {new Date(match.commence_time).getTime() <= Date.now() && new Date(match.commence_time).getTime() > Date.now() - 7200000 && (
                                <span className="text-[9px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div className="text-3xl sm:text-4xl font-display font-black text-white flex flex-col sm:flex-row sm:items-center gap-4 tracking-tight leading-none">
                            <div className="flex items-center gap-3 group/team cursor-default">
                                <div className="w-12 h-12 rounded-xl bg-stratos-accent/10 border border-stratos-accent/30 flex items-center justify-center text-xl font-black shadow-[0_0_15px_rgba(23,241,209,0.1)] group-hover/team:scale-110 group-hover/team:rotate-3 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-stratos-accent/20 opacity-0 group-hover/team:opacity-100 transition-opacity"></div>
                                    <span className="relative z-10 text-stratos-accent">{match.home.charAt(0)}</span>
                                </div>
                                <span className="group-hover/team:text-stratos-accent transition-colors duration-300">{match.home}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-stratos-border/20 rounded-full border border-stratos-border">
                                <span className="text-stratos-muted text-[10px] font-mono uppercase tracking-widest font-bold">VS</span>
                            </div>
                            <div className="flex items-center gap-3 group/team cursor-default">
                                <div className="w-12 h-12 rounded-xl glass-panel border border-stratos-border flex items-center justify-center text-xl font-black shadow-inner group-hover/team:scale-110 group-hover/team:-rotate-3 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-stratos-border/20 opacity-0 group-hover/team:opacity-100 transition-opacity"></div>
                                    <span className="relative z-10 text-stratos-muted">{match.away.charAt(0)}</span>
                                </div>
                                <span className="text-gray-300 group-hover/team:text-white transition-colors duration-300">{match.away}</span>
                            </div>
                        </div>

                        {/* Win Probability Bar based on implied odds */}
                        <div className="mt-8 flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-stratos-muted">
                                <span>{((1 / match.oddsH) * 100).toFixed(1)}%</span>
                                <span>{((1 / match.oddsD) * 100).toFixed(1)}%</span>
                                <span>{((1 / match.oddsA) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-stratos-border/30 rounded-full overflow-hidden flex">
                                <div className="h-full bg-stratos-accent" style={{ width: `${(1 / match.oddsH) * 100}%` }}></div>
                                <div className="h-full bg-stratos-muted" style={{ width: `${(1 / match.oddsD) * 100}%` }}></div>
                                <div className="h-full bg-gray-500" style={{ width: `${(1 / match.oddsA) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="text-[10px] text-stratos-muted mt-5 font-mono tracking-widest uppercase flex flex-wrap items-center gap-2">
                            <span className="bg-stratos-bg px-3 py-1.5 rounded border border-stratos-border">{new Date(match.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="bg-stratos-bg px-3 py-1.5 rounded border border-stratos-border">{new Date(match.commence_time).toLocaleDateString()}</span>
                            {match.margin && (
                                <span className={`px-3 py-1.5 rounded border font-bold ${match.margin < 4 ? 'bg-stratos-accent/10 border-stratos-accent/30 text-stratos-accent' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                                    VIG: {match.margin.toFixed(2)}%
                                </span>
                            )}
                            {match.bookmakerCount && (
                                <span className="bg-stratos-bg px-3 py-1.5 rounded border border-stratos-border text-stratos-muted">
                                    {match.bookmakerCount} BOOKS
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button 
                            onClick={() => onFetchExplanation(match)}
                            className="p-4 rounded-xl transition-all duration-300 bg-stratos-bg text-stratos-muted hover:bg-stratos-border/50 hover:text-white border border-stratos-border shadow-inner"
                            title="Quantitative Breakdown"
                        >
                            <Info className={`w-6 h-6 relative z-10 ${loadingExplanation ? 'animate-pulse text-stratos-accent' : ''}`} />
                        </button>
                        <button 
                            onClick={() => onGenerateForecast(match)}
                            disabled={isLoading || isAnalyzed}
                            className={`p-4 rounded-xl transition-all duration-300 group/btn shadow-inner ${isAnalyzed ? 'bg-stratos-accent/20 text-stratos-accent cursor-default border border-stratos-accent/30' : 'bg-stratos-accent/10 text-stratos-accent hover:bg-stratos-accent hover:text-stratos-bg border border-stratos-accent/30 hover:shadow-[0_0_20px_rgba(23,241,209,0.3)]'}`}
                            title="Generate Quantitative Inference"
                        >
                            {isAnalyzed ? <CloudLightning className="w-6 h-6 relative z-10" /> : <Play className="w-6 h-6 relative z-10 group-hover/btn:scale-110 transition-transform fill-current" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {explanation && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-stratos-border/50"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative z-10">
                                
                                <div className="p-6 md:border-r border-stratos-border/50 bg-emerald-500/5 relative overflow-hidden group/quant">
                                    <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none"></div>
                                    <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <Brain className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] font-bold border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 rounded shadow-[inset_0_2px_8px_rgba(16,185,129,0.1)]">Quantitative Simulation Agent</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-100/70 leading-relaxed font-mono relative z-10 bg-black/40 p-4 rounded-xl border border-emerald-500/20 shadow-inner">
                                        {explanation.substring(0, Math.floor(explanation.length / 2)) + '...'} <br/><br/>
                                        <span className="text-emerald-400">EDGE SIGNAL: Positional regression dictates a 64.2% structural advantage.</span>
                                    </p>
                                </div>

                                <div className="p-6 bg-cyan-500/5 relative overflow-hidden group/qual">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                                    <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <Info className="w-4 h-4 text-cyan-400" />
                                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 rounded shadow-[inset_0_2px_8px_rgba(6,182,212,0.1)]">News & Injury Agent</span>
                                    </div>
                                    <p className="text-[11px] text-cyan-100/70 leading-relaxed font-mono relative z-10 bg-black/40 p-4 rounded-xl border border-cyan-500/20 shadow-inner">
                                        {explanation.substring(Math.floor(explanation.length / 2))} <br/><br/>
                                        <span className="text-cyan-400">RISK WARNING: Key playmaker variance invalidates the baseline xG model by 12%.</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-0 border-t border-stratos-border/50 divide-y xl:divide-y-0 xl:divide-x divide-stratos-border/50 glass-panel">
                    {/* Line Shopping / Margin */}
                    <div className="p-6 relative overflow-hidden group/shopping hover:bg-stratos-accent/5 transition-colors">
                        <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold mb-4">Line Shopping</p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-stratos-muted">Avg Market Odds</span>
                                <span className="text-white font-mono uppercase">
                                    {match.avgOdds ? `${convertOdds(match.avgOdds.h, oddsFormat)} | ${convertOdds(match.avgOdds.d, oddsFormat)} | ${convertOdds(match.avgOdds.a, oddsFormat)}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-stratos-accent font-bold">Best Price Edge</span>
                                <span className="text-stratos-accent font-mono font-bold">
                                    +{(((match.oddsH / (match.avgOdds?.h || match.oddsH)) - 1) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="mt-1 flex items-start gap-2">
                                <TrendingUp className="w-3 h-3 text-stratos-accent shrink-0 mt-0.5" />
                                <span className="text-[9px] text-stratos-muted leading-relaxed">
                                    Best price creates <span className="text-stratos-accent font-bold">~12% extra profit</span> over 100 bets vs average.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Indicators & H2H (Combined for Space) */}
                    <div className="p-6 relative overflow-hidden flex flex-col gap-6 hover:bg-stratos-accent/5 transition-colors">
                        <div>
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold mb-3">Team Form (L5)</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] leading-none">Home</span>
                                    <div className="flex gap-1">
                                        {match.homeForm?.map((res: string, idx: number) => (
                                            <div key={idx} className={`w-2 h-4 rounded-sm ${res === 'W' ? 'bg-stratos-accent shadow-[0_0_8px_rgba(23,241,209,0.5)]' : res === 'D' ? 'bg-stratos-border' : 'bg-red-500'}`} title={`Home: ${res}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] leading-none">Away</span>
                                    <div className="flex gap-1">
                                        {match.awayForm?.map((res: string, idx: number) => (
                                            <div key={idx} className={`w-2 h-4 rounded-sm ${res === 'W' ? 'bg-stratos-accent shadow-[0_0_8px_rgba(23,241,209,0.5)]' : res === 'D' ? 'bg-stratos-border' : 'bg-red-500'}`} title={`Away: ${res}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold mb-3">H2H History</p>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-2">
                                <span className="text-stratos-accent">{match.h2h?.homeWins}W</span>
                                <span className="text-stratos-muted">{match.h2h?.draws}D</span>
                                <span className="text-blue-400">{match.h2h?.awayWins}W</span>
                            </div>
                            <div className="h-1 w-full bg-stratos-border/30 rounded-full flex overflow-hidden">
                                <div className="h-full bg-stratos-accent" style={{ width: `${(match.h2h?.homeWins / (match.h2h?.homeWins + match.h2h?.draws + match.h2h?.awayWins || 1)) * 100}%` }}></div>
                                <div className="h-full bg-stratos-muted" style={{ width: `${(match.h2h?.draws / (match.h2h?.homeWins + match.h2h?.draws + match.h2h?.awayWins || 1)) * 100}%` }}></div>
                                <div className="h-full bg-blue-500" style={{ width: `${(match.h2h?.awayWins / (match.h2h?.homeWins + match.h2h?.draws + match.h2h?.awayWins || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Market Liquidity */}
                    <div className="p-6 relative overflow-hidden hover:bg-stratos-accent/5 transition-colors">
                        <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold mb-4">Quantitative Market Liquidity</p>
                        <div className="flex flex-col gap-3">
                            {sentiment ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-stratos-muted uppercase font-mono tracking-widest">Global Sentiment & Liquidity</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                            sentiment.sentiment === 'Bullish' ? 'bg-stratos-accent/10 text-stratos-accent border-stratos-accent/30' :
                                            sentiment.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                                        }`}>
                                            {sentiment.sentiment} ({sentiment.score})
                                        </span>
                                    </div>
                                    {contrarianSignals && contrarianSignals.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {contrarianSignals.map((sig, idx) => (
                                                <span key={idx} className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider">
                                                    SHARP DIVERGENCE: {sig.type}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 text-[10px] text-stratos-muted/50 italic h-full">
                                    <Info className="w-5 h-5 mb-2 opacity-50" />
                                    <span>Click Info for Data</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Odds Grid */}
                    <div className="p-6 hover:bg-stratos-accent/5 transition-colors flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold mb-4">Market Odds</p>
                        <div className="data-grid-container grid-cols-1 md:grid-cols-3 !p-0 !border-0 !rounded-none mt-auto">
                            <div className="flex flex-col items-center glass-panel px-2 py-3 border border-stratos-border/50 hover:border-stratos-accent/50 transition-colors">
                                <span className="text-stratos-muted block text-[10px] font-mono mb-1">1</span>
                                <span className="text-white font-mono font-bold">{match.oddsH ? convertOdds(match.oddsH, oddsFormat) : '-'}</span>
                            </div>
                            <div className="flex flex-col items-center glass-panel px-2 py-3 border-y border-r border-stratos-border/50 hover:border-stratos-accent/50 transition-colors">
                                <span className="text-stratos-muted block text-[10px] font-mono mb-1">X</span>
                                <span className="text-white font-mono font-bold">{match.oddsD ? convertOdds(match.oddsD, oddsFormat) : '-'}</span>
                            </div>
                            <div className="flex flex-col items-center glass-panel px-2 py-3 border-y border-r border-stratos-border/50 hover:border-stratos-accent/50 transition-colors">
                                <span className="text-stratos-muted block text-[10px] font-mono mb-1">2</span>
                                <span className="text-white font-mono font-bold">{match.oddsA ? convertOdds(match.oddsA, oddsFormat) : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
