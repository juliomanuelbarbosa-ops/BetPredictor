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
        <section className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
                {/* STRATOS PHASE */}
                <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4 text-emerald-400">Phase 1: Stratos (T-24h)</h2>
                    <div className="flex gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Enter Match (e.g., Arsenal vs Chelsea)" 
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            value={matchInput}
                            onChange={(e) => setMatchInput(e.target.value)}
                            disabled={isLoading || phase === 'COMBAT'}
                        />
                        <button 
                            onClick={initializeStratos}
                            disabled={isLoading || phase === 'COMBAT'}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            Initialize Matrix
                        </button>
                    </div>
                    
                    {stratosResult && (
                        <div className="space-y-6">
                            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                <h3 className="text-lg font-semibold mb-4 text-gray-300">Baseline Monte Carlo Results (10,000 iterations)</h3>
                                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                    <div>
                                        <div className="text-sm text-gray-400">Home Win</div>
                                        <div className="text-2xl font-bold text-emerald-400">{stratosResult.homeWins.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Draw</div>
                                        <div className="text-2xl font-bold text-gray-300">{stratosResult.draws.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Away Win</div>
                                        <div className="text-2xl font-bold text-emerald-400">{stratosResult.awayWins.toFixed(1)}%</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-gray-700/50 pt-4">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Over 2.5</div>
                                        <div className="text-lg font-semibold text-gray-200">{stratosResult.over25.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Under 2.5</div>
                                        <div className="text-lg font-semibold text-gray-200">{stratosResult.under25.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">BTTS (Yes)</div>
                                        <div className="text-lg font-semibold text-gray-200">{stratosResult.btts.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Most Likely</div>
                                        <div className="text-lg font-semibold text-emerald-400">{stratosResult.mostLikelyScore}</div>
                                    </div>
                                </div>
                            </div>

                            {spartaMatrix && (
                                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Sparta Matrix Variables (Sample)</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="font-semibold text-emerald-400 mb-2 border-b border-gray-700 pb-1">Home</div>
                                            <div className="space-y-1 text-xs font-mono text-gray-300">
                                                <div className="flex justify-between"><span>xG_base:</span> <span>{spartaMatrix.home.xG_base.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>field_tilt:</span> <span>{spartaMatrix.home.field_tilt.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>save_pct:</span> <span>{spartaMatrix.home.save_pct.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>ppda:</span> <span>{spartaMatrix.home.ppda.toFixed(1)}</span></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-emerald-400 mb-2 border-b border-gray-700 pb-1">Away</div>
                                            <div className="space-y-1 text-xs font-mono text-gray-300">
                                                <div className="flex justify-between"><span>xG_base:</span> <span>{spartaMatrix.away.xG_base.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>field_tilt:</span> <span>{spartaMatrix.away.field_tilt.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>save_pct:</span> <span>{spartaMatrix.away.save_pct.toFixed(1)}%</span></div>
                                                <div className="flex justify-between"><span>ppda:</span> <span>{spartaMatrix.away.ppda.toFixed(1)}</span></div>
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
                    <div className="w-full max-w-2xl border-t border-gray-800 pt-8 mt-4">
                        <h2 className="text-2xl font-bold mb-4 text-emerald-400">Phase 2: Combat (T-60m)</h2>
                        <p className="text-gray-400 mb-4">Upload a SofaScore or FlashScore lineup screenshot to extract Starting XI and apply FM Penalty Logic.</p>
                        
                        <div 
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full h-48 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
                                isDragging 
                                    ? 'border-emerald-500 bg-emerald-950/20 scale-[1.02]' 
                                    : isLoading 
                                        ? 'border-emerald-500/30 bg-gray-900/50 cursor-wait' 
                                        : 'border-gray-700/70 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-950/10'
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
                            <div className="mt-8 space-y-6">
                                <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-red-400">FM Penalty Logic Applied</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                                        <li>Home Formation: {lineupAnalysis.homeFormation}</li>
                                        <li>Away Formation: {lineupAnalysis.awayFormation}</li>
                                        {lineupAnalysis.homeMissingATier > 0 && <li className="text-red-300">Home missing {lineupAnalysis.homeMissingATier} A-Tier players (-{lineupAnalysis.homeMissingATier * 15}% efficiency)</li>}
                                        {lineupAnalysis.awayMissingATier > 0 && <li className="text-red-300">Away missing {lineupAnalysis.awayMissingATier} A-Tier players (-{lineupAnalysis.awayMissingATier * 15}% efficiency)</li>}
                                        <li>Game Changers on Bench: {lineupAnalysis.gameChangers.join(', ') || 'None identified'}</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-emerald-400">Final Combat Results (10,000 iterations)</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                        <div>
                                            <div className="text-sm text-gray-400">Home Win</div>
                                            <div className="text-2xl font-bold text-emerald-400">{combatResult.homeWins.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.homeWins.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Draw</div>
                                            <div className="text-2xl font-bold text-gray-300">{combatResult.draws.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.draws.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Away Win</div>
                                            <div className="text-2xl font-bold text-emerald-400">{combatResult.awayWins.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.awayWins.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-emerald-900/50 pt-4">
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Over 2.5</div>
                                            <div className="text-lg font-semibold text-emerald-300">{combatResult.over25.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.over25.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Under 2.5</div>
                                            <div className="text-lg font-semibold text-emerald-300">{combatResult.under25.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.under25.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">BTTS (Yes)</div>
                                            <div className="text-lg font-semibold text-emerald-300">{combatResult.btts.toFixed(1)}%</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.btts.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Most Likely</div>
                                            <div className="text-lg font-semibold text-emerald-400">{combatResult.mostLikelyScore}</div>
                                            <div className="text-xs text-gray-500">vs {stratosResult.mostLikelyScore}</div>
                                        </div>
                                    </div>
                                </div>

                                {spartaMatrix && (
                                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Adjusted Sparta Matrix Variables</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <div className="font-semibold text-emerald-400 mb-2 border-b border-gray-700 pb-1">Home</div>
                                                <div className="space-y-1 text-xs font-mono text-gray-300">
                                                    <div className="flex justify-between"><span>xG_base:</span> <span>{spartaMatrix.home.xG_base.toFixed(2)}</span></div>
                                                    <div className="flex justify-between"><span>field_tilt:</span> <span>{spartaMatrix.home.field_tilt.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>save_pct:</span> <span>{spartaMatrix.home.save_pct.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>ppda:</span> <span>{spartaMatrix.home.ppda.toFixed(1)}</span></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-emerald-400 mb-2 border-b border-gray-700 pb-1">Away</div>
                                                <div className="space-y-1 text-xs font-mono text-gray-300">
                                                    <div className="flex justify-between"><span>xG_base:</span> <span>{spartaMatrix.away.xG_base.toFixed(2)}</span></div>
                                                    <div className="flex justify-between"><span>field_tilt:</span> <span>{spartaMatrix.away.field_tilt.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>save_pct:</span> <span>{spartaMatrix.away.save_pct.toFixed(1)}%</span></div>
                                                    <div className="flex justify-between"><span>ppda:</span> <span>{spartaMatrix.away.ppda.toFixed(1)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-center mt-6">
                                    <button 
                                        onClick={resetSparta}
                                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-bold transition-colors border border-gray-700"
                                    >
                                        Analyze Another Match
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
