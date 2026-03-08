import React, { useState, useMemo } from 'react';
import { CloudLightning, Brain, RefreshCw, Calendar, Play, Search, Filter } from 'lucide-react';
import { SpartaLogo } from './SpartaLogo';

interface UpcomingModeProps {
    isLoading: boolean;
    loadingStep: string;
    upcomingMatches: any[];
    fetchUpcoming: () => void;
    analyzeMatch: (match: any) => void;
    predictions: any[];
    resolvePrediction: (id: string, won: boolean) => void;
    deletePrediction: (id: string) => void;
    copyPrediction: (pred: any) => void;
    simulateInSparta: (match: any) => void;
}

export function UpcomingMode({
    isLoading,
    loadingStep,
    upcomingMatches,
    fetchUpcoming,
    analyzeMatch,
    predictions,
    resolvePrediction,
    deletePrediction,
    copyPrediction,
    simulateInSparta
}: UpcomingModeProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLeague, setSelectedLeague] = useState("All Leagues");

    const leagues = useMemo(() => {
        const unique = Array.from(new Set(upcomingMatches.map(m => m.league)));
        return ["All Leagues", ...unique];
    }, [upcomingMatches]);

    const filteredMatches = useMemo(() => {
        return upcomingMatches.filter(m => {
            const matchesSearch = m.home.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                m.away.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLeague = selectedLeague === "All Leagues" || m.league === selectedLeague;
            return matchesSearch && matchesLeague;
        });
    }, [upcomingMatches, searchQuery, selectedLeague]);

    return (
        <section className="mt-12 animate-in fade-in duration-700 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Matches</h2>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Next 24 Hours</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-none md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                        <input 
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                        />
                    </div>

                    {/* League Filter */}
                    <div className="relative flex-1 md:flex-none md:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                        <select 
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer shadow-inner"
                        >
                            {leagues.map(l => <option key={l} value={l} className="bg-black text-white">{l}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button 
                        onClick={fetchUpcoming}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-wait hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline tracking-widest uppercase text-xs">Refresh</span>
                    </button>
                </div>
            </div>

            {isLoading && upcomingMatches.length === 0 ? (
                <div className="glass-panel rounded-[3rem] p-24 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                    <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] relative z-10"></div>
                    <p className="text-sm font-mono text-emerald-400 font-bold animate-pulse tracking-[0.3em] uppercase relative z-10">{loadingStep}</p>
                </div>
            ) : (
                <div className="grid gap-8 mb-16">
                    {filteredMatches.length === 0 && (
                        <div className="glass-panel rounded-[3rem] p-24 text-center border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-6 relative z-10" />
                            <p className="text-gray-400 font-mono tracking-widest uppercase mb-6 text-sm relative z-10">
                                {upcomingMatches.length === 0 ? "No matches found" : "No matches match your filters"}
                            </p>
                            {upcomingMatches.length === 0 && (
                                <button onClick={fetchUpcoming} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase tracking-widest text-xs border-b border-emerald-500/30 pb-1 relative z-10">Click to refresh</button>
                            )}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredMatches.map((match) => {
                            const isAnalyzed = predictions.some(p => p.game.id === match.id);
                            return (
                                <div key={match.id} className="glass-panel rounded-3xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    <div className="flex flex-col gap-8 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{match.league}</div>
                                                    {match.isMock && (
                                                        <span className="text-[8px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-md uppercase tracking-widest">Demo Data</span>
                                                    )}
                                                    {new Date(match.commence_time).getTime() - Date.now() < 3600000 && new Date(match.commence_time).getTime() > Date.now() && (
                                                        <span className="text-[8px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                                            Starting Soon
                                                        </span>
                                                    )}
                                                    {new Date(match.commence_time).getTime() <= Date.now() && new Date(match.commence_time).getTime() > Date.now() - 7200000 && (
                                                        <span className="text-[8px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                            LIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter">
                                                    {match.home} <span className="text-emerald-500/40 text-sm font-mono italic font-normal">vs</span> {match.away}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2 font-mono tracking-widest uppercase">
                                                    {new Date(match.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span className="mx-2 text-white/10">|</span> {new Date(match.commence_time).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => simulateInSparta(match)}
                                                    className="p-4 rounded-2xl transition-all duration-300 bg-black/60 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 group/btn relative overflow-hidden shadow-inner"
                                                    title="Simulate in Sparta"
                                                >
                                                    <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                                    <SpartaLogo className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => analyzeMatch(match)}
                                                    disabled={isLoading || isAnalyzed}
                                                    className={`p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group/btn shadow-inner ${isAnalyzed ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30' : 'bg-black/60 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30'}`}
                                                    title="Generate AI Prediction"
                                                >
                                                    {!isAnalyzed && <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>}
                                                    {isAnalyzed ? <CloudLightning className="w-5 h-5 relative z-10" /> : <Play className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                            {/* Form Indicators */}
                                            <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Team Form (L5)</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex gap-1.5">
                                                        {match.homeForm?.map((res: string, idx: number) => (
                                                            <div key={idx} className={`w-2.5 h-2.5 rounded-full shadow-inner ${res === 'W' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : res === 'D' ? 'bg-gray-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} title={`Home: ${res}`}></div>
                                                        ))}
                                                    </div>
                                                    <div className="w-[1px] h-4 bg-white/10"></div>
                                                    <div className="flex gap-1.5">
                                                        {match.awayForm?.map((res: string, idx: number) => (
                                                            <div key={idx} className={`w-2.5 h-2.5 rounded-full shadow-inner ${res === 'W' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : res === 'D' ? 'bg-gray-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} title={`Away: ${res}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* H2H Stats */}
                                            <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">H2H History</p>
                                                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                                                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{match.h2h?.homeWins}W</span>
                                                    <span className="text-gray-500 bg-white/5 px-2 py-1 rounded-md">{match.h2h?.draws}D</span>
                                                    <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{match.h2h?.awayWins}W</span>
                                                </div>
                                            </div>

                                            {/* Odds Grid */}
                                            <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Market Odds</p>
                                                <div className="flex gap-2 font-mono text-xs">
                                                    <div className="flex-1 bg-black/60 px-2 py-1.5 rounded-lg border border-white/5 text-center shadow-inner">
                                                        <span className="text-gray-500 mr-1.5">H</span>
                                                        <span className="text-white font-bold">{match.oddsH?.toFixed(2) || '-'}</span>
                                                    </div>
                                                    <div className="flex-1 bg-black/60 px-2 py-1.5 rounded-lg border border-white/5 text-center shadow-inner">
                                                        <span className="text-gray-500 mr-1.5">D</span>
                                                        <span className="text-white font-bold">{match.oddsD?.toFixed(2) || '-'}</span>
                                                    </div>
                                                    <div className="flex-1 bg-black/60 px-2 py-1.5 rounded-lg border border-white/5 text-center shadow-inner">
                                                        <span className="text-gray-500 mr-1.5">A</span>
                                                        <span className="text-white font-bold">{match.oddsA?.toFixed(2) || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
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
                    
                    <div className="grid gap-8 md:grid-cols-2" id="predictions-grid">
                        {predictions.map((pred, i) => (
                            <div key={i} className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)]">
                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-12">
                                    <SpartaLogo className="w-64 h-64 text-emerald-500" />
                                </div>
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-[0.2em]">{pred.game.league}</span>
                                            <span className="w-1 h-1 rounded-full bg-emerald-500/30"></span>
                                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">ID: {pred.id}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tighter leading-tight">{pred.game.home} <br/><span className="text-emerald-500/50 font-mono text-sm mx-1 italic font-normal">vs</span> {pred.game.away}</h3>
                                        <div className="flex gap-2 mt-4 font-mono text-[10px] text-gray-500">
                                            <span className="bg-black/50 border border-white/5 px-2 py-1 rounded-lg">H: <span className="text-white font-bold">{pred.game.oddsH || '-'}</span></span>
                                            <span className="bg-black/50 border border-white/5 px-2 py-1 rounded-lg">D: <span className="text-white font-bold">{pred.game.oddsD || '-'}</span></span>
                                            <span className="bg-black/50 border border-white/5 px-2 py-1 rounded-lg">A: <span className="text-white font-bold">{pred.game.oddsA || '-'}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyPrediction(pred)}
                                                className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-110 active:scale-95"
                                                title="Copy Prediction"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                            <button 
                                                onClick={() => deletePrediction(pred.id)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all hover:scale-110 active:scale-95"
                                                title="Delete Prediction"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                        <div className="text-right flex flex-col items-end bg-black/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                                            <div className="text-5xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">{pred.confidence}%</div>
                                            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em] mt-2">Confidence</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="bg-black/40 rounded-3xl p-8 border border-white/5 shadow-inner relative overflow-hidden group/bet">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500/50 group-hover/bet:bg-emerald-500 transition-colors"></div>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Recommended Bet</span>
                                            <span className="font-black text-xl text-emerald-400 tracking-wider uppercase">{pred.bestBet}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Predicted Score</span>
                                            <span className="font-mono font-black text-2xl text-white tracking-tighter">{pred.predScore}</span>
                                        </div>
                                        
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <div className="flex justify-between text-[10px] font-mono text-gray-600 mb-3 uppercase tracking-tighter">
                                                <span>H: {(pred.probs[0] * 100).toFixed(1)}%</span>
                                                <span>D: {(pred.probs[1] * 100).toFixed(1)}%</span>
                                                <span>A: {(pred.probs[2] * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full flex overflow-hidden shadow-inner">
                                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${pred.probs[0] * 100}%` }}></div>
                                                <div className="h-full bg-gray-600" style={{ width: `${pred.probs[1] * 100}%` }}></div>
                                                <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${pred.probs[2] * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {pred.valueText && (
                                            <div className="mt-6 text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 inline-block px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)] uppercase tracking-widest">
                                                {pred.valueText}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative group/insight">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Brain className="w-3.5 h-3.5 text-emerald-500" />
                                                Tactical Insight
                                            </div>
                                            <div className="text-[8px] font-mono text-emerald-500/70 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                {pred.bytezAnalysis.provider || 'STRATOS_CORE'}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed font-medium italic">"{pred.bytezAnalysis.report}"</p>
                                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Optimal Market <span className="text-gray-800">({pred.bytezAnalysis.category})</span></span>
                                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">{pred.bytezAnalysis.market}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 px-4">
                                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">Suggested Stake</div>
                                        <div className="font-black text-3xl text-white tracking-tighter"><span className="text-emerald-500 text-xl mr-1">$</span>{pred.stake}</div>
                                    </div>
                                    
                                    {pred.actual === null ? (
                                        <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                                            <button 
                                                onClick={() => resolvePrediction(pred.id, true)}
                                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Mark Won
                                            </button>
                                            <button 
                                                onClick={() => resolvePrediction(pred.id, false)}
                                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Mark Lost
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`mt-6 pt-6 border-t border-white/5 text-center text-[10px] font-black tracking-[0.4em] uppercase ${pred.actual === 'WON' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            <span className="opacity-50 mr-2">Status:</span> {pred.actual}
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
