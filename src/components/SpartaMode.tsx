import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

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
    lineupAnalysis: any;
    isDragging: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    lineupAnalysis,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    resetSparta
}: SpartaModeProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <section className="glass-card rounded-3xl p-6 sm:p-10 mb-10">
            <div className="flex flex-col items-center gap-8">
                {/* STRATOS PHASE */}
                <div className="w-full max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <span className="text-emerald-400 font-mono font-bold">1</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Phase 1: Stratos <span className="text-gray-500 font-mono text-sm ml-2">(T-24h)</span></h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <input 
                            type="text" 
                            placeholder="Enter Match (e.g., Arsenal vs Chelsea)" 
                            className="flex-1 bg-black/50 border border-gray-800 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                            value={matchInput}
                            onChange={(e) => setMatchInput(e.target.value)}
                            disabled={isLoading || phase === 'COMBAT'}
                        />
                        <button 
                            onClick={initializeStratos}
                            disabled={isLoading || phase === 'COMBAT'}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                        >
                            INIT MATRIX
                        </button>
                    </div>
                    
                    {stratosResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Baseline Monte Carlo Results
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-center mb-8">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Home Win</div>
                                        <div className="text-3xl font-bold text-emerald-400">{stratosResult.homeWins.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Draw</div>
                                        <div className="text-3xl font-bold text-gray-300">{stratosResult.draws.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Away Win</div>
                                        <div className="text-3xl font-bold text-emerald-400">{stratosResult.awayWins.toFixed(1)}%</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-white/5 pt-6">
                                    <div>
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Over 2.5</div>
                                        <div className="text-xl font-semibold text-gray-200">{stratosResult.over25.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Under 2.5</div>
                                        <div className="text-xl font-semibold text-gray-200">{stratosResult.under25.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">BTTS (Yes)</div>
                                        <div className="text-xl font-semibold text-gray-200">{stratosResult.btts.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Most Likely</div>
                                        <div className="text-xl font-semibold text-emerald-400">{stratosResult.mostLikelyScore}</div>
                                    </div>
                                </div>
                            </div>

                            {spartaMatrix && (
                                <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Sparta Matrix Variables (Sample)</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <div className="font-mono text-sm text-emerald-400 mb-3 border-b border-white/10 pb-2">HOME_TEAM</div>
                                            <div className="space-y-2 text-xs font-mono text-gray-400">
                                                <div className="flex justify-between"><span>xG_base:</span> <span className="text-gray-200">{spartaMatrix.home.xG_base.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>field_tilt:</span> <span className="text-gray-200">{spartaMatrix.home.field_tilt.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>save_pct:</span> <span className="text-gray-200">{spartaMatrix.home.save_pct.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>ppda:</span> <span className="text-gray-200">{spartaMatrix.home.ppda.toFixed(1)}</span></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-mono text-sm text-emerald-400 mb-3 border-b border-white/10 pb-2">AWAY_TEAM</div>
                                            <div className="space-y-2 text-xs font-mono text-gray-400">
                                                <div className="flex justify-between"><span>xG_base:</span> <span className="text-gray-200">{spartaMatrix.away.xG_base.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>field_tilt:</span> <span className="text-gray-200">{spartaMatrix.away.field_tilt.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>save_pct:</span> <span className="text-gray-200">{spartaMatrix.away.save_pct.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>ppda:</span> <span className="text-gray-200">{spartaMatrix.away.ppda.toFixed(1)}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* COMBAT PHASE */}
                {spartaMatrix && (
                    <div className="w-full max-w-2xl border-t border-white/10 pt-10 mt-2 animate-in fade-in duration-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <span className="text-emerald-400 font-mono font-bold">2</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Phase 2: Combat <span className="text-gray-500 font-mono text-sm ml-2">(T-60m)</span></h2>
                        </div>
                        <p className="text-gray-400 mb-6 text-sm">Upload a SofaScore or FlashScore lineup screenshot to extract Starting XI and apply FM Penalty Logic.</p>
                        
                        <div 
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                                isDragging 
                                    ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' 
                                    : isLoading 
                                        ? 'border-emerald-500/30 bg-black/40 cursor-wait' 
                                        : 'border-gray-700 cursor-pointer hover:border-emerald-500/50 hover:bg-white/5'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-lg text-emerald-400 font-medium animate-pulse">{loadingStep}</p>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-emerald-400' : 'text-gray-500/70'}`} />
                                    <p className="text-lg text-gray-300 font-medium">{isDragging ? 'Drop lineup here!' : 'Drop lineup screenshot here'}</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        
                        {combatResult && lineupAnalysis && (
                            <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6">
                                    <h3 className="text-sm font-mono text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        FM Penalty Logic Applied
                                    </h3>
                                    <ul className="text-sm text-gray-300 space-y-2 font-mono list-none">
                                        <li className="flex items-center gap-2"><span className="text-gray-500">›</span> Home Formation: <span className="text-white">{lineupAnalysis.homeFormation}</span></li>
                                        <li className="flex items-center gap-2"><span className="text-gray-500">›</span> Away Formation: <span className="text-white">{lineupAnalysis.awayFormation}</span></li>
                                        {lineupAnalysis.homeMissingATier > 0 && <li className="flex items-center gap-2 text-red-300"><span className="text-red-500">⚠</span> Home missing {lineupAnalysis.homeMissingATier} A-Tier players (-{lineupAnalysis.homeMissingATier * 15}% efficiency)</li>}
                                        {lineupAnalysis.awayMissingATier > 0 && <li className="flex items-center gap-2 text-red-300"><span className="text-red-500">⚠</span> Away missing {lineupAnalysis.awayMissingATier} A-Tier players (-{lineupAnalysis.awayMissingATier * 15}% efficiency)</li>}
                                        <li className="flex items-center gap-2"><span className="text-gray-500">›</span> Game Changers on Bench: <span className="text-emerald-400">{lineupAnalysis.gameChangers.join(', ') || 'None identified'}</span></li>
                                    </ul>
                                </div>
                                
                                <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                                    <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Final Combat Results
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center mb-8">
                                        <div className="bg-black/40 rounded-xl p-4 border border-emerald-900/30">
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Home Win</div>
                                            <div className="text-3xl font-bold text-emerald-400">{combatResult.homeWins.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.homeWins.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-4 border border-emerald-900/30">
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Draw</div>
                                            <div className="text-3xl font-bold text-gray-300">{combatResult.draws.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.draws.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-4 border border-emerald-900/30">
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Away Win</div>
                                            <div className="text-3xl font-bold text-emerald-400">{combatResult.awayWins.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.awayWins.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-emerald-900/30 pt-6">
                                        <div>
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Over 2.5</div>
                                            <div className="text-xl font-semibold text-emerald-300">{combatResult.over25.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.over25.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Under 2.5</div>
                                            <div className="text-xl font-semibold text-emerald-300">{combatResult.under25.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.under25.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">BTTS (Yes)</div>
                                            <div className="text-xl font-semibold text-emerald-300">{combatResult.btts.toFixed(1)}%</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.btts.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Most Likely</div>
                                            <div className="text-xl font-semibold text-emerald-400">{combatResult.mostLikelyScore}</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1">vs {stratosResult.mostLikelyScore}</div>
                                        </div>
                                    </div>
                                </div>

                                {spartaMatrix && (
                                    <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Adjusted Sparta Matrix Variables</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <div className="font-mono text-sm text-emerald-400 mb-3 border-b border-white/10 pb-2">HOME_TEAM</div>
                                                <div className="space-y-2 text-xs font-mono text-gray-400">
                                                    <div className="flex justify-between"><span>xG_base:</span> <span className="text-gray-200">{spartaMatrix.home.xG_base.toFixed(2)}</span></div>
                                                    <div className="flex justify-between"><span>field_tilt:</span> <span className="text-gray-200">{spartaMatrix.home.field_tilt.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>save_pct:</span> <span className="text-gray-200">{spartaMatrix.home.save_pct.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>ppda:</span> <span className="text-gray-200">{spartaMatrix.home.ppda.toFixed(1)}</span></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm text-emerald-400 mb-3 border-b border-white/10 pb-2">AWAY_TEAM</div>
                                                <div className="space-y-2 text-xs font-mono text-gray-400">
                                                    <div className="flex justify-between"><span>xG_base:</span> <span className="text-gray-200">{spartaMatrix.away.xG_base.toFixed(2)}</span></div>
                                                    <div className="flex justify-between"><span>field_tilt:</span> <span className="text-gray-200">{spartaMatrix.away.field_tilt.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>save_pct:</span> <span className="text-gray-200">{spartaMatrix.away.save_pct.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>ppda:</span> <span className="text-gray-200">{spartaMatrix.away.ppda.toFixed(1)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-center mt-8">
                                    <button 
                                        onClick={resetSparta}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-8 py-3 rounded-xl font-mono text-sm tracking-widest transition-colors"
                                    >
                                        RESET SIMULATION
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
