import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from 'lucide-react';
import { convertOdds } from '../../lib/utils';

import { OddsFormat } from '../../stores/settingsStore';

interface MatchListProps {
    upcomingMatches: any[];
    isLoading: boolean;
    selections: any[];
    oddsFormat: OddsFormat;
    toggleSelection: (match: any, market: 'HOME' | 'DRAW' | 'AWAY') => void;
    setShowMatchDetails: (match: any) => void;
}

export const MatchList: React.FC<MatchListProps> = ({
    upcomingMatches,
    isLoading,
    selections,
    oddsFormat,
    toggleSelection,
    setShowMatchDetails
}) => {
    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading && upcomingMatches.length === 0 && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-3xl border border-white/5 glass-panel animate-pulse">
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-24 h-6 bg-white/5 rounded-lg"></div>
                                <div className="w-32 h-4 bg-white/5 rounded-md"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-24 bg-white/5 rounded-2xl"></div>
                                <div className="h-24 bg-white/5 rounded-2xl"></div>
                                <div className="h-24 bg-white/5 rounded-2xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <AnimatePresence>
                {upcomingMatches.map((match, idx) => (
                    <motion.div 
                        key={match.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setShowMatchDetails(match)}
                        className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group/match ${
                            selections.some(s => s.match.id === match.id) 
                                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]' 
                                : 'glass-panel border-white/5 hover:border-white/20 hover:glass-panel'
                        }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/match:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        {selections.some(s => s.match.id === match.id) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
                        )}
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
                                    {match.league}
                                </span>
                                {match.isMock && (
                                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                        Mock Data
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                                {new Date(match.commence_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center relative z-10">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelection(match, 'HOME');
                                }}
                                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                                    selections.some(s => s.match.id === match.id && s.market === 'HOME')
                                        ? 'bg-stratos-accent/20 border-stratos-accent/50 shadow-[0_0_15px_rgba(23,241,209,0.3)]'
                                        : 'glass-panel border-white/5 hover:border-white/20'
                                }`}
                            >
                                <span className="text-sm font-display font-black text-white mb-2 tracking-tight">{match.home}</span>
                                <div className="flex gap-1 mb-3">
                                    {['W', 'D', 'W', 'L', 'W'].map((r, i) => (
                                        <span key={i} className={`w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold ${r === 'W' ? 'bg-stratos-accent text-black shadow-[0_0_5px_rgba(23,241,209,0.5)]' : r === 'D' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>{r}</span>
                                    ))}
                                </div>
                                <span className={`text-xl font-black ${selections.some(s => s.match.id === match.id && s.market === 'HOME') ? 'text-stratos-accent' : 'text-blue-400'} drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]`}>
                                    {convertOdds(match.oddsH || 0, oddsFormat)}
                                </span>
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelection(match, 'DRAW');
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                                    selections.some(s => s.match.id === match.id && s.market === 'DRAW')
                                        ? 'bg-stratos-accent/20 border-stratos-accent/50 shadow-[0_0_15px_rgba(23,241,209,0.3)]'
                                        : 'glass-panel border-white/5 hover:border-white/20'
                                }`}
                            >
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 font-bold">Draw</span>
                                <span className={`text-xl font-black ${selections.some(s => s.match.id === match.id && s.market === 'DRAW') ? 'text-stratos-accent' : 'text-gray-400'}`}>
                                    {convertOdds(match.oddsD || 0, oddsFormat)}
                                </span>
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelection(match, 'AWAY');
                                }}
                                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                                    selections.some(s => s.match.id === match.id && s.market === 'AWAY')
                                        ? 'bg-stratos-accent/20 border-stratos-accent/50 shadow-[0_0_15px_rgba(23,241,209,0.3)]'
                                        : 'glass-panel border-white/5 hover:border-white/20'
                                }`}
                            >
                                <span className="text-sm font-display font-black text-white mb-2 tracking-tight">{match.away}</span>
                                <div className="flex gap-1 mb-3">
                                    {['L', 'W', 'D', 'W', 'L'].map((r, i) => (
                                        <span key={i} className={`w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold ${r === 'W' ? 'bg-stratos-accent text-black shadow-[0_0_5px_rgba(23,241,209,0.5)]' : r === 'D' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>{r}</span>
                                    ))}
                                </div>
                                <span className={`text-xl font-black ${selections.some(s => s.match.id === match.id && s.market === 'AWAY') ? 'text-stratos-accent' : 'text-blue-400'} drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]`}>
                                    {convertOdds(match.oddsA || 0, oddsFormat)}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {!isLoading && upcomingMatches.length === 0 && (
                <div className="text-center py-20 px-6 border border-stratos-border/50 rounded-3xl glass-panel relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-stratos-accent/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-stratos-bg/40 to-transparent pointer-events-none"></div>
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-stratos-border/50 flex flex-col items-center justify-center mb-6 animate-[spin_10s_linear_infinite] relative">
                            <div className="absolute inset-2 rounded-full border-2 border-stratos-accent/20 animate-[spin_5s_linear_infinite_reverse]"></div>
                            <Calendar className="w-8 h-8 text-stratos-accent opacity-80 animate-[spin_10s_linear_infinite_reverse] drop-shadow-[0_0_10px_rgba(23,241,209,0.5)]" />
                        </div>
                        <p className="text-sm font-mono text-white uppercase tracking-[0.2em] relative z-10 font-bold mb-3 drop-shadow-md">No Open Markets</p>
                        <p className="text-[10px] font-mono text-stratos-muted relative z-10 max-w-[200px] leading-relaxed uppercase tracking-widest">Our quants are indexing new data streams. Stand by.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
