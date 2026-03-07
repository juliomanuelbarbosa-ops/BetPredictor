import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Activity, Shield, RefreshCw, ChevronRight, Database } from 'lucide-react';
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
    return (
        <section className="max-w-5xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT PANEL: INPUT & MATRIX */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <SpartaLogo className="w-24 h-24 text-emerald-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Sparta Matrix <span className="text-[10px] font-mono text-emerald-500/50 ml-2 uppercase tracking-widest">v4.2</span></h2>
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
                                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 uppercase text-xs"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
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
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Home Vector
                                            </div>
                                            <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">xG_BASE:</span>
                                                    <span className="text-white">{spartaMatrix.home.xG_base.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">TILT_F:</span>
                                                    <span className="text-white">{spartaMatrix.home.field_tilt.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">PPDA_V:</span>
                                                    <span className="text-white">{spartaMatrix.home.ppda.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-500/70 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                Away Vector
                                            </div>
                                            <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">xG_BASE:</span>
                                                    <span className="text-white">{spartaMatrix.away.xG_base.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">TILT_F:</span>
                                                    <span className="text-white">{spartaMatrix.away.field_tilt.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-gray-500">PPDA_V:</span>
                                                    <span className="text-white">{spartaMatrix.away.ppda.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
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

                    {isLoading && (
                        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4 relative overflow-hidden">
                            {/* Scanning Line Animation */}
                            <motion.div 
                                className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                            <div>
                                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Processing</p>
                                <p className="text-xs text-white font-medium">{loadingStep}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: SIMULATION RESULTS */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {!stratosResult ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] glass-panel rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-12"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                                    <SpartaLogo className="w-10 h-10 text-gray-600" />
                                </div>
                                <h3 className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] mb-2">Awaiting Initialization</h3>
                                <p className="text-gray-700 text-xs max-w-xs leading-relaxed">Enter match parameters and initialize the Sparta protocol to begin Monte Carlo simulation.</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="glass-panel p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-white font-bold text-lg flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-emerald-400" />
                                            Simulation Output
                                        </h3>
                                        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">10,000 Iterations</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 mb-10">
                                        {[
                                            { label: 'Home Win', value: combatResult ? combatResult.homeWins : stratosResult.homeWins, prev: combatResult ? stratosResult.homeWins : null, color: 'text-emerald-400' },
                                            { label: 'Draw', value: combatResult ? combatResult.draws : stratosResult.draws, prev: combatResult ? stratosResult.draws : null, color: 'text-gray-400' },
                                            { label: 'Away Win', value: combatResult ? combatResult.awayWins : stratosResult.awayWins, prev: combatResult ? stratosResult.awayWins : null, color: 'text-blue-400' }
                                        ].map((res, i) => (
                                            <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5 text-center relative overflow-hidden group">
                                                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-1000" style={{ width: `${res.value}%`, color: res.color.replace('text-', '') }}></div>
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">{res.label}</p>
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className={`text-4xl font-mono font-bold ${res.color}`}>{res.value.toFixed(1)}%</p>
                                                    {res.prev !== null && (
                                                        <p className="text-[10px] font-mono text-gray-500 mt-1">vs {res.prev.toFixed(1)}%</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/5">
                                        {[
                                            { label: 'Over 2.5', value: combatResult ? combatResult.over25 : stratosResult.over25, prev: combatResult ? stratosResult.over25 : null },
                                            { label: 'Under 2.5', value: combatResult ? combatResult.under25 : stratosResult.under25, prev: combatResult ? stratosResult.under25 : null },
                                            { label: 'BTTS (Yes)', value: combatResult ? combatResult.btts : stratosResult.btts, prev: combatResult ? stratosResult.btts : null },
                                            { label: 'Most Likely', value: combatResult ? combatResult.mostLikelyScore : stratosResult.mostLikelyScore, prev: combatResult ? stratosResult.mostLikelyScore : null, isScore: true }
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className={`text-lg font-mono font-bold ${stat.isScore ? 'text-emerald-400' : 'text-white'}`}>
                                                    {typeof stat.value === 'number' ? `${stat.value.toFixed(1)}%` : stat.value}
                                                </p>
                                                {stat.prev !== null && (
                                                    <p className="text-[9px] font-mono text-gray-500 mt-0.5">
                                                        vs {typeof stat.prev === 'number' ? `${stat.prev.toFixed(1)}%` : stat.prev}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!combatResult ? (
                                    <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-emerald-400" />
                                                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Combat Phase Ready</h3>
                                            </div>
                                            <button 
                                                onClick={resetSparta}
                                                className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                                            >
                                                Reset Sim
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-6">The Stratos baseline is complete. You can now proceed to the Combat phase for final lineup adjustments and real-time variable injection.</p>
                                        <button 
                                            onClick={runCombat}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 uppercase text-[10px]"
                                        >
                                            Initialize Combat Sequence
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-emerald-400" />
                                                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Combat Phase Complete</h3>
                                            </div>
                                            <button 
                                                onClick={resetSparta}
                                                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full"
                                            >
                                                Reset Sim
                                            </button>
                                        </div>
                                        <p className="text-xs text-emerald-400/80 leading-relaxed">Real-time variables injected. The simulation has been updated with the latest tactical parameters.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
