import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';
import { convertOdds } from '../../lib/utils';
import { OddsChart } from '../OddsChart';

import { OddsFormat } from '../../stores/settingsStore';

interface MatchDetailsModalProps {
    showMatchDetails: any;
    setShowMatchDetails: (match: any | null) => void;
    matchDetailsData: any;
    isLoadingDetails: boolean;
    selections: any[];
    oddsFormat: OddsFormat;
    toggleSelection: (match: any, market: 'HOME' | 'DRAW' | 'AWAY') => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
    showMatchDetails,
    setShowMatchDetails,
    matchDetailsData,
    isLoadingDetails,
    selections,
    oddsFormat,
    toggleSelection
}) => {
    return (
        <AnimatePresence>
            {showMatchDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMatchDetails(null)}
                        className="absolute inset-0 glass-panel backdrop-blur-xl"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="glass-panel p-10 rounded-[4rem] max-w-4xl w-full relative z-10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden"
                    >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-stratos-accent/10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2 block">{showMatchDetails.league}</span>
                            <h3 className="text-4xl font-display font-black text-white tracking-tight uppercase leading-none">
                                {showMatchDetails.home} <span className="text-gray-700">vs</span> {showMatchDetails.away}
                            </h3>
                        </div>
                        <button onClick={() => setShowMatchDetails(null)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Form (H)', val: matchDetailsData?.homeFormResults?.join(' ') || 'W D W W L', color: 'text-stratos-accent', bg: 'bg-stratos-accent/10', border: 'border-stratos-accent/20' },
                                    { label: 'Form (A)', val: matchDetailsData?.awayFormResults?.join(' ') || 'L L D W D', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                    { label: 'H2H', val: matchDetailsData?.h2h ? `${matchDetailsData.h2h.homeWins}-${matchDetailsData.h2h.draws}-${matchDetailsData.h2h.awayWins}` : '3-1-1', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
                                ].map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-3xl ${stat.bg} border ${stat.border} flex flex-col items-center justify-center text-center shadow-inner`}>
                                        <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                        <p className={`text-sm font-black tracking-widest ${stat.color}`}>{isLoadingDetails ? '...' : stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-[2.5rem] glass-panel border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                                <h4 className="text-sm font-display font-bold text-white tracking-tight mb-8 flex items-center gap-3 relative z-10">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Advanced Metrics
                                </h4>
                                <div className="space-y-8 relative z-10">
                                    {[
                                        { label: 'Expected Goals (xG)', h: parseFloat(matchDetailsData?.homeAdv?.xG || '1.85'), a: parseFloat(matchDetailsData?.awayAdv?.xG || '1.24') },
                                        { label: 'Possession Avg', h: parseFloat(matchDetailsData?.homeAdv?.Field_Tilt?.replace('%','') || '54'), a: parseFloat(matchDetailsData?.awayAdv?.Field_Tilt?.replace('%','') || '46') },
                                        { label: 'Shots on Target', h: parseFloat(matchDetailsData?.homeAdv?.Shots_on_Target || '5.2'), a: parseFloat(matchDetailsData?.awayAdv?.Shots_on_Target || '3.8') }
                                    ].map((m, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-mono">
                                                <span className="text-gray-400 uppercase tracking-widest">{m.label}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-blue-400 font-bold">{isLoadingDetails ? '...' : m.h}</span>
                                                    <span className="text-gray-600">/</span>
                                                    <span className="text-red-400 font-bold">{isLoadingDetails ? '...' : m.a}</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                                                <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(m.h / (m.h + m.a)) * 100}%` }}></div>
                                                <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${(m.a / (m.h + m.a)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ODDS MOVEMENT TRACKER */}
                            <div className="p-8 rounded-[2.5rem] glass-panel border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    <OddsChart 
                                        matchId={showMatchDetails.id} 
                                        homeTeam={showMatchDetails.home} 
                                        awayTeam={showMatchDetails.away} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 rounded-[2.5rem] bg-stratos-accent/10 border border-stratos-accent/20 relative overflow-hidden shadow-[0_0_30px_rgba(23,241,209,0.1)]">
                                <div className="absolute inset-0 bg-gradient-to-b from-stratos-accent/10 to-transparent pointer-events-none"></div>
                                <p className="text-[10px] font-mono text-stratos-accent uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-stratos-accent animate-pulse"></span>
                                    Market Selection
                                </p>
                                <div className="grid grid-cols-1 gap-3 relative z-10">
                                    {[
                                        { label: 'Home Win', market: 'HOME' as const, odds: showMatchDetails.oddsH },
                                        { label: 'Draw', market: 'DRAW' as const, odds: showMatchDetails.oddsD },
                                        { label: 'Away Win', market: 'AWAY' as const, odds: showMatchDetails.oddsA }
                                    ].map((opt) => (
                                        <button
                                            key={opt.market}
                                            onClick={() => {
                                                toggleSelection(showMatchDetails, opt.market);
                                                setShowMatchDetails(null);
                                            }}
                                            className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                                                selections.some(s => s.match.id === showMatchDetails.id && s.market === opt.market)
                                                    ? 'bg-stratos-accent/20 border-stratos-accent/50 text-stratos-accent'
                                                    : 'glass-panel border-white/10 text-gray-400 hover:border-stratos-accent/30 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-widest">{opt.label}</span>
                                            <span className="text-sm font-black font-mono">{convertOdds(opt.odds || 0, oddsFormat)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Neural Forecast
                                </p>
                                <div className="space-y-5 relative z-10">
                                    <div className="flex justify-between items-center pb-4 border-b border-stratos-border/50">
                                        <span className="text-xs text-stratos-muted uppercase tracking-[0.2em]">Expected Winner</span>
                                        <span className="text-[13px] font-black text-stratos-accent tracking-widest bg-stratos-bg/80 px-2.5 py-1 rounded-md border border-stratos-border/50 shadow-[inset_0_0_10px_rgba(23,241,209,0.1)]">
                                            {isLoadingDetails ? '...' : (matchDetailsData?.quantForecast?.homeWinProb > (matchDetailsData?.quantForecast?.awayWinProb || 0) && matchDetailsData?.quantForecast?.homeWinProb > 35 ? 'HOME WIN' : (matchDetailsData?.quantForecast?.awayWinProb || 0) > 35 ? 'AWAY WIN' : 'DRAW')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-stratos-border/50">
                                        <span className="text-xs text-stratos-muted uppercase tracking-[0.2em]">Win Probability</span>
                                        <span className="text-sm font-black text-white font-mono">
                                            {isLoadingDetails ? '...' : `H:${matchDetailsData?.quantForecast?.homeWinProb || 33}% | A:${matchDetailsData?.quantForecast?.awayWinProb || 33}%`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-stratos-muted uppercase tracking-[0.2em]">Model xG (Projected)</span>
                                        <span className="text-sm font-black text-sky-400 font-mono">
                                            {isLoadingDetails ? '...' : `${matchDetailsData?.quantForecast?.expectedGoalsH || '1.10'} - ${matchDetailsData?.quantForecast?.expectedGoalsA || '0.90'}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
};
