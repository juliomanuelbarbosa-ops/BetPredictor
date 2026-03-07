import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Activity, Shield, RefreshCw, ChevronRight, Database, Terminal, Layers, Eye } from 'lucide-react';
import { SpartaLogo } from './SpartaLogo';

interface SpartaModeProps {
    phase: 'STRATOS' | 'COMBAT';
    matchInput: string;
    setMatchInput: (val: string) => void;
    isLoading: boolean;
    loadingStep: string;
    initializeStratos: () => void;
    stratosResult: any;
    spartaMatrix: any;
    combatResult: any;
    runCombat: () => void;
    resetSparta: () => void;
}

export function SpartaMode({
    phase,
    matchInput,
    setMatchInput,
    isLoading,
    loadingStep,
    initializeStratos,
    stratosResult,
    spartaMatrix,
    combatResult,
    runCombat,
    resetSparta
}: SpartaModeProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                const prefixes = ['SYS', 'NET', 'SIM', 'DATA', 'CORE'];
                const actions = ['CALIBRATING', 'SYNCING', 'ANALYZING', 'INJECTING', 'PROCESSING'];
                const targets = ['VECTOR_X', 'TILT_FACTOR', 'XG_BASE', 'PPDA_VAL', 'MATRIX_NODE'];
                const log = `[${prefixes[Math.floor(Math.random() * prefixes.length)]}] ${actions[Math.floor(Math.random() * actions.length)]} ${targets[Math.floor(Math.random() * targets.length)]}_${Math.floor(Math.random() * 999)}`;
                setLogs(prev => [...prev.slice(-20), log]);
            }, 150);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <section className="max-w-7xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT PANEL: INPUT & MATRIX */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <SpartaLogo className="w-24 h-24 text-emerald-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Sparta Matrix</h2>
                                <p className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">Protocol v4.2.0-Alpha</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="HOME VS AWAY" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm uppercase tracking-widest placeholder:text-gray-700"
                                    value={matchInput}
                                    onChange={(e) => setMatchInput(e.target.value)}
                                    disabled={isLoading || phase === 'COMBAT'}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
                                    <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={initializeStratos}
                                disabled={isLoading || phase === 'COMBAT'}
                                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 uppercase text-xs group"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />}
                                Initialize Protocol
                            </button>
                        </div>

                        <AnimatePresence>
                            {spartaMatrix && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-6 border-t border-white/5 space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { team: 'Home', color: 'text-emerald-500', data: spartaMatrix.home },
                                            { team: 'Away', color: 'text-blue-500', data: spartaMatrix.away }
                                        ].map((t, i) => (
                                            <div key={i} className="space-y-3">
                                                <div className={`flex items-center gap-2 text-[10px] font-mono ${t.color}/70 uppercase tracking-widest`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${t.color.replace('text-', 'bg-')}`}></div>
                                                    {t.team} Vector
                                                </div>
                                                <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                                    {Object.entries(t.data).slice(0, 3).map(([key, val]: [string, any]) => (
                                                        <div key={key} className="flex justify-between text-[10px] font-mono">
                                                            <span className="text-gray-500">{key.toUpperCase()}:</span>
                                                            <span className="text-white">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center gap-4">
                                        <Database className="w-5 h-5 text-emerald-400 opacity-50" />
                                        <div>
                                            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Matrix Status</p>
                                            <p className="text-[10px] text-gray-500 font-mono">300+ VARIABLES SYNCHRONIZED</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SYSTEM LOG PANEL */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Live System Feed</h3>
                        </div>
                        <div className="flex-1 font-mono text-[9px] text-emerald-500/70 overflow-y-auto space-y-1 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="opacity-30">[{i}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                            {!isLoading && logs.length === 0 && (
                                <div className="h-full flex items-center justify-center opacity-20 italic">
                                    Awaiting protocol initialization...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: SIMULATION RESULTS */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {!stratosResult ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[500px] glass-panel rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-12 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative z-10">
                                    <SpartaLogo className="w-12 h-12 text-gray-700" />
                                </div>
                                <h3 className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] mb-4 relative z-10">Awaiting Initialization</h3>
                                <p className="text-gray-700 text-sm max-w-sm leading-relaxed relative z-10">Enter match parameters and initialize the Sparta protocol to begin the 10,000-iteration Monte Carlo simulation.</p>
                                
                                <div className="mt-12 grid grid-cols-3 gap-8 opacity-20 relative z-10">
                                    {[Layers, Activity, Eye].map((Icon, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <Icon className="w-6 h-6" />
                                            <div className="w-12 h-1 bg-white/10 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
                                    
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-white font-bold text-xl flex items-center gap-3">
                                                <Activity className="w-6 h-6 text-emerald-400" />
                                                Simulation Output
                                            </h3>
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Monte Carlo Analysis • 10,000 Iterations</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Active</span>
                                            <span className="text-[8px] font-mono text-gray-600 mt-1 uppercase">Ref: PROTOCOL_X_99</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                        {[
                                            { label: 'Home Win', value: combatResult ? combatResult.homeWins : stratosResult.homeWins, prev: combatResult ? stratosResult.homeWins : null, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                            { label: 'Draw', value: combatResult ? combatResult.draws : stratosResult.draws, prev: combatResult ? stratosResult.draws : null, color: 'text-gray-400', bg: 'bg-gray-500/10' },
                                            { label: 'Away Win', value: combatResult ? combatResult.awayWins : stratosResult.awayWins, prev: combatResult ? stratosResult.awayWins : null, color: 'text-blue-400', bg: 'bg-blue-500/10' }
                                        ].map((res, i) => (
                                            <div key={i} className="bg-black/40 p-8 rounded-3xl border border-white/5 text-center relative overflow-hidden group hover:border-white/10 transition-all">
                                                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-1000" style={{ width: `${res.value}%`, color: res.color.replace('text-', '') }}></div>
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">{res.label}</p>
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className={`text-5xl font-mono font-bold ${res.color}`}>{res.value.toFixed(1)}%</p>
                                                    {res.prev !== null && (
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <span className="text-[10px] font-mono text-gray-600 uppercase">Baseline:</span>
                                                            <span className="text-[10px] font-mono text-gray-400">{res.prev.toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-white/5">
                                        {[
                                            { label: 'Over 2.5', value: combatResult ? combatResult.over25 : stratosResult.over25, prev: combatResult ? stratosResult.over25 : null },
                                            { label: 'Under 2.5', value: combatResult ? combatResult.under25 : stratosResult.under25, prev: combatResult ? stratosResult.under25 : null },
                                            { label: 'BTTS (Yes)', value: combatResult ? combatResult.btts : stratosResult.btts, prev: combatResult ? stratosResult.btts : null },
                                            { label: 'Most Likely', value: combatResult ? combatResult.mostLikelyScore : stratosResult.mostLikelyScore, prev: combatResult ? stratosResult.mostLikelyScore : null, isScore: true }
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center group">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 group-hover:text-gray-400 transition-colors">{stat.label}</p>
                                                <p className={`text-2xl font-mono font-bold ${stat.isScore ? 'text-emerald-400' : 'text-white'}`}>
                                                    {typeof stat.value === 'number' ? `${stat.value.toFixed(1)}%` : stat.value}
                                                </p>
                                                {stat.prev !== null && (
                                                    <p className="text-[9px] font-mono text-gray-600 mt-1">
                                                        {typeof stat.prev === 'number' ? `${stat.prev.toFixed(1)}%` : stat.prev}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!combatResult ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-panel p-10 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Shield className="w-32 h-32 text-emerald-400" />
                                        </div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                                                    <Shield className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg uppercase tracking-widest">Combat Phase Ready</h3>
                                                    <p className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">Awaiting Tactical Injection</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={resetSparta}
                                                className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full"
                                            >
                                                Reset Sim
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-2xl">The Stratos baseline is complete. You can now proceed to the Combat phase for final lineup adjustments and real-time variable injection. This will run a secondary 10,000-iteration simulation with adjusted tactical weights.</p>
                                        <button 
                                            onClick={runCombat}
                                            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-5 rounded-2xl font-black tracking-[0.3em] transition-all flex items-center justify-center gap-4 uppercase text-xs group"
                                        >
                                            Initialize Combat Sequence
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass-panel p-10 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/10 relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                                                    <Shield className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg uppercase tracking-widest">Combat Phase Complete</h3>
                                                    <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Tactical Variables Synchronized</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={resetSparta}
                                                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest border border-emerald-500/30 px-5 py-2 rounded-full bg-emerald-500/5"
                                            >
                                                New Simulation
                                            </button>
                                        </div>
                                        <p className="text-sm text-emerald-400/80 leading-relaxed font-mono">
                                            [SUCCESS] Real-time variables injected. The simulation has been updated with the latest tactical parameters. Final probability vectors stabilized.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

