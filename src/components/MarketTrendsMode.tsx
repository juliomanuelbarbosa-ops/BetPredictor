import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Activity, TrendingUp, TrendingDown, Clock, Zap, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';

const dummySteamMoves = [
    { id: 'sm1', time: 'LIVE', match: 'Trump vs Biden', selection: 'Kalshi: Trump Win Probability', oldOdds: 0.45, newOdds: 0.58, drop: -28.8, bookmaker: 'Kalshi', type: 'crypto', severity: 'high' },
    { id: 'sm2', time: '2m ago', match: 'Man City vs Arsenal', selection: 'Man City ML', oldOdds: 1.85, newOdds: 1.62, drop: 12.4, bookmaker: 'Pinnacle', type: 'sports', severity: 'high' },
    { id: 'sm3', time: '5m ago', match: 'Fed Rate Cut - Sept', selection: 'Polymarket: >= 50bps', oldOdds: 0.22, newOdds: 0.41, drop: -86.3, bookmaker: 'Polymarket', type: 'crypto', severity: 'medium' },
    { id: 'sm4', time: '12m ago', match: 'Chiefs vs Ravens', selection: 'Chiefs ML', oldOdds: 2.25, newOdds: 1.95, drop: 13.3, bookmaker: 'Circa', type: 'sports', severity: 'high' },
];

export const MarketTrendsMode = () => {
    const [scannedMoves, setScannedMoves] = useState(dummySteamMoves);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-black tracking-tight text-white drop-shadow-md">PREDICTION MARKETS</h1>
                        <p className="text-purple-400/70 font-mono text-[11px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            Live Kalshi / Polymarket Stream
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-6 rounded-3xl shadow-2xl relative h-full"
                    >
                        <div className="absolute inset-0 tech-grid-dense opacity-10 pointer-events-none z-0"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-stratos-accent/10 blur-[40px] pointer-events-none rounded-full z-0 mix-blend-screen"></div>
                        <div className="relative z-10 flex flex-col gap-6 h-full">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-stratos-muted mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-stratos-accent" />
                            System Status
                        </h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="text-xs text-stratos-muted font-mono mb-1">Books Scanned</div>
                                <div className="text-2xl font-display font-bold text-white flex items-end gap-2">
                                    32 <span className="text-[10px] text-stratos-accent font-mono mb-1 uppercase tracking-widest">+ Live APIs</span>
                                </div>
                            </div>
                            
                            <div className="h-px bg-stratos-border/50 w-full"></div>

                            <div>
                                <div className="text-xs text-stratos-muted font-mono mb-1">Sharp Money Detected</div>
                                <div className="text-2xl font-display font-bold text-white">$1.2M+</div>
                            </div>
                            
                            <div className="h-px bg-stratos-border/50 w-full"></div>
                            
                            <div>
                                <div className="text-[10px] font-mono text-stratos-muted tracking-widest uppercase mb-3 drop-shadow-md">Detection Sensitivity</div>
                                <div className="flex gap-2">
                                    {['Low', 'Med', 'High'].map((lvl, i) => (
                                        <button key={lvl} className={`flex-1 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-colors ${i === 2 ? 'bg-stratos-accent/20 text-stratos-accent border border-stratos-accent/30' : 'glass-panel text-stratos-muted border border-stratos-border/50 hover:bg-white/5'}`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </div>
                    </motion.div>
                </div>

                {/* Steam Moves List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-stratos-muted ml-2">Recent Sharp Moves</h3>
                    
                    <AnimatePresence>
                        {scannedMoves.map((move, i) => (
                            <motion.div
                                key={move.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 group transition-colors shadow-inner
                                    ${move.type === 'crypto' ? 'border-purple-500/30 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-purple-500/5' : 
                                      move.severity === 'high' ? 'border-red-500/30 hover:border-red-500/50 hover:bg-red-500/5 bg-black/40' : 'border-stratos-border/50 hover:border-stratos-accent/30 bg-black/40'}`}
                            >
                                {move.severity === 'high' && move.type !== 'crypto' && (
                                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none rounded-full"></div>
                                )}
                                {move.type === 'crypto' && (
                                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none rounded-full"></div>
                                )}
                                
                                <div className="flex-1 space-y-2 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className={`w-4 h-4 ${move.type === 'crypto' ? 'text-purple-400' : move.severity === 'high' ? 'text-red-400' : 'text-stratos-accent'}`} />
                                            <span className="text-white font-bold">{move.match}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-stratos-muted tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {move.time}
                                        </div>
                                    </div>
                                    <div className="text-sm text-stratos-muted font-mono">{move.selection} @ <span className={move.type === 'crypto' ? 'text-purple-400 font-bold' : ''}>{move.bookmaker}</span></div>
                                </div>

                                <div className="flex items-center gap-4 sm:border-l sm:border-stratos-border/50 sm:pl-6 relative z-10">
                                    <div className="text-center">
                                        <div className="text-[10px] font-mono text-stratos-muted tracking-wider mb-1">OPEN</div>
                                        <div className="font-mono text-white line-through opacity-50">{move.type === 'crypto' ? (move.oldOdds * 100).toFixed(0) + '¢' : move.oldOdds.toFixed(2)}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-stratos-muted" />
                                    <div className="text-center">
                                        <div className="text-[10px] font-mono text-stratos-muted tracking-wider mb-1">LIVE</div>
                                        <div className={`font-mono font-bold font-display ${move.type === 'crypto' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : move.severity === 'high' ? 'text-red-400' : 'text-stratos-accent'}`}>
                                            {move.type === 'crypto' ? (move.newOdds * 100).toFixed(0) + '¢' : move.newOdds.toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    <div className={`glass-panel px-3 py-2 rounded-xl flex items-center gap-2 min-w-[80px] justify-center ml-2 border ${move.type === 'crypto' ? 'border-purple-500/30' : 'border-stratos-border/50'}`}>
                                        <TrendingDown className={`w-4 h-4 ${move.type === 'crypto' ? 'text-purple-400' : move.severity === 'high' ? 'text-red-400' : 'text-stratos-accent'}`} />
                                        <span className="font-mono font-bold text-white">{move.drop > 0 ? '-' : '+'}{Math.abs(move.drop)}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
