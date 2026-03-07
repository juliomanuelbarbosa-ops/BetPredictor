import React from 'react';
import { CloudLightning, Brain, RefreshCw, Calendar, Play } from 'lucide-react';
import { SpartaLogo } from './SpartaLogo';

interface UpcomingModeProps {
    isLoading: boolean;
    loadingStep: string;
    upcomingMatches: any[];
    fetchUpcoming: () => void;
    analyzeMatch: (match: any) => void;
    predictions: any[];
    resolvePrediction: (id: string, won: boolean) => void;
}

export function UpcomingMode({
    isLoading,
    loadingStep,
    upcomingMatches,
    fetchUpcoming,
    analyzeMatch,
    predictions,
    resolvePrediction
}: UpcomingModeProps) {
    return (
        <section className="mt-12 animate-in fade-in duration-700 relative z-10">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Matches</h2>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Next 24 Hours</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {upcomingMatches.some(m => m.isMock) && (
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-yellow-500/80 uppercase tracking-widest">Demo Mode Active</span>
                        </div>
                    )}
                    <button 
                        onClick={fetchUpcoming}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </button>
                </div>
            </div>

            {isLoading && upcomingMatches.length === 0 ? (
                <div className="glass-panel rounded-[2rem] p-20 flex flex-col items-center justify-center border border-white/5">
                    <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]"></div>
                    <p className="text-xl font-mono text-emerald-400 font-bold animate-pulse tracking-widest uppercase">{loadingStep}</p>
                </div>
            ) : (
                <div className="grid gap-4 mb-16">
                    {upcomingMatches.length === 0 && !isLoading && (
                        <div className="glass-panel rounded-[2rem] p-20 text-center border border-white/5">
                            <p className="text-gray-500 font-mono tracking-widest uppercase mb-4">No matches found</p>
                            <button onClick={fetchUpcoming} className="text-emerald-400 font-bold hover:underline">Click to refresh</button>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {upcomingMatches.map((match) => {
                            const isAnalyzed = predictions.some(p => p.game.id === match.id);
                            return (
                                <div key={match.id} className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">{match.league}</div>
                                                {match.isMock && (
                                                    <span className="text-[8px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">Demo Data</span>
                                                )}
                                                {new Date(match.commence_time).getTime() - Date.now() < 3600000 && new Date(match.commence_time).getTime() > Date.now() && (
                                                    <span className="text-[8px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                                                        Starting Soon
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-lg font-bold text-white flex items-center gap-3">
                                                {match.home} <span className="text-gray-600 text-sm font-normal italic">vs</span> {match.away}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 font-mono">
                                                {new Date(match.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(match.commence_time).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2 font-mono text-[10px]">
                                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-gray-400">H: <span className="text-white">{match.oddsH?.toFixed(2) || '-'}</span></div>
                                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-gray-400">D: <span className="text-white">{match.oddsD?.toFixed(2) || '-'}</span></div>
                                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-gray-400">A: <span className="text-white">{match.oddsA?.toFixed(2) || '-'}</span></div>
                                            </div>
                                            <button 
                                                onClick={() => analyzeMatch(match)}
                                                disabled={isLoading || isAnalyzed}
                                                className={`p-3 rounded-xl transition-all duration-300 ${isAnalyzed ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-white/5 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30'}`}
                                            >
                                                {isAnalyzed ? <CloudLightning className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {predictions.length > 0 && (
                <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <CloudLightning className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">AI Predictions</h2>
                    </div>
                    
                    <div className="grid gap-8 md:grid-cols-2">
                        {predictions.map((pred, i) => (
                            <div key={i} className="glass-card rounded-[2rem] p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1">
                                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-12">
                                    <SpartaLogo className="w-64 h-64 text-emerald-500" />
                                </div>
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{pred.game.home} <br/><span className="text-emerald-500/50 font-mono text-sm mx-1 italic">vs</span> {pred.game.away}</h3>
                                        <div className="flex gap-3 mt-4 font-mono text-xs text-gray-400">
                                            <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg shadow-inner">H: <span className="text-white font-bold">{pred.game.oddsH || '-'}</span></span>
                                            <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg shadow-inner">D: <span className="text-white font-bold">{pred.game.oddsD || '-'}</span></span>
                                            <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg shadow-inner">A: <span className="text-white font-bold">{pred.game.oddsA || '-'}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <div className="text-4xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{pred.confidence}%</div>
                                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">Confidence</div>
                                    </div>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 shadow-inner relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50"></div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Recommended Bet</span>
                                            <span className="font-extrabold text-lg text-emerald-400 tracking-wide">{pred.bestBet}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Predicted Score</span>
                                            <span className="font-mono font-bold text-xl text-white">{pred.predScore}</span>
                                        </div>
                                        
                                        {/* Probability Bar */}
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1.5">
                                                <span>H: {(pred.probs[0] * 100).toFixed(1)}%</span>
                                                <span>D: {(pred.probs[1] * 100).toFixed(1)}%</span>
                                                <span>A: {(pred.probs[2] * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${pred.probs[0] * 100}%` }}></div>
                                                <div className="h-full bg-gray-500" style={{ width: `${pred.probs[1] * 100}%` }}></div>
                                                <div className="h-full bg-blue-500" style={{ width: `${pred.probs[2] * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {pred.valueText && (
                                            <div className="mt-5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 inline-block px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                {pred.valueText}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Tactical Insight
                                            </div>
                                            <div className="text-[9px] font-mono text-emerald-500/70 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                                                {pred.bytezAnalysis.provider || 'AI Model'}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{pred.bytezAnalysis.report}</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Top Market <span className="text-gray-600">({pred.bytezAnalysis.category})</span></span>
                                            <span className="text-sm font-bold text-emerald-400">{pred.bytezAnalysis.market}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 px-2">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">Suggested Stake</div>
                                        <div className="font-bold text-xl text-white">${pred.stake}</div>
                                    </div>
                                    
                                    {/* Resolution Buttons */}
                                    {pred.actual === null ? (
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                            <button 
                                                onClick={() => resolvePrediction(pred.id, true)}
                                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                                            >
                                                Mark Won
                                            </button>
                                            <button 
                                                onClick={() => resolvePrediction(pred.id, false)}
                                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                                            >
                                                Mark Lost
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`mt-4 pt-4 border-t border-white/5 text-center text-xs font-bold tracking-widest uppercase ${pred.actual === 'WON' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            RESULT: {pred.actual}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
