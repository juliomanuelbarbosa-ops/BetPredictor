import React from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Info } from 'lucide-react';
import { formatCurrency, convertOdds } from '../../lib/utils';
import { fireWinningConfetti } from '../../lib/confetti';

import { OddsFormat } from '../../stores/settingsStore';

interface BetHistoryProps {
    forecasts: any[];
    currency: string;
    oddsFormat: OddsFormat;
    handleResolveLeg: (betId: string, legIndex: number, status: string) => void;
    resolveForecastInStore: (id: string, status: 'WON' | 'LOST' | 'VOID') => void;
    resolveBankroll: (won: boolean, stake: number, odds: number) => void;
    updateBankroll: (updater: (prev: number) => number) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

export const BetHistory: React.FC<BetHistoryProps> = ({
    forecasts,
    currency,
    oddsFormat,
    handleResolveLeg,
    resolveForecastInStore,
    resolveBankroll,
    updateBankroll,
    showToast
}) => {
    return (
        <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        >
            <h3 className="text-xl font-display font-bold text-white tracking-tight mb-6 flex items-center gap-3">
                <HistoryIcon className="w-6 h-6 text-stratos-accent" />
                Bet History
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {forecasts.filter(p => p.isManual || p.isAccumulator).length === 0 ? (
                    <div className="text-center py-20 px-6 border border-stratos-border/50 rounded-3xl glass-panel relative overflow-hidden group/empty shadow-2xl">
                        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-stratos-accent/5 rounded-full blur-[80px] z-0 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="absolute inset-0 bg-gradient-to-b from-stratos-bg/40 to-transparent pointer-events-none"></div>
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-stratos-border/50 flex flex-col items-center justify-center mb-6 animate-[spin_12s_linear_infinite] relative">
                                <div className="absolute inset-2 rounded-full border-2 border-stratos-accent/20 animate-[spin_6s_linear_infinite_reverse]"></div>
                                <HistoryIcon className="w-6 h-6 text-stratos-accent opacity-80 animate-[spin_12s_linear_infinite_reverse] drop-shadow-[0_0_10px_rgba(23,241,209,0.5)]" />
                            </div>
                            <p className="text-sm font-mono text-white uppercase tracking-[0.2em] relative z-10 font-bold mb-2 drop-shadow-md">No Open Trades</p>
                            <p className="text-[10px] font-mono text-stratos-muted relative z-10 max-w-[200px] leading-relaxed uppercase tracking-widest">Execute positions in the terminal to track portfolio history.</p>
                        </div>
                    </div>
                ) : (
                    forecasts.filter(p => p.isManual || p.isAccumulator).map((bet, idx) => (
                        <div key={bet.id || idx} className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3 relative overflow-hidden group/history hover:bg-white/5 transition-colors shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/history:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">{new Date(bet.game.commence_time).toLocaleDateString()}</span>
                                {bet.actual === 'WON' ? (
                                    <span className="text-[9px] font-mono text-stratos-accent bg-stratos-accent/10 px-2 py-1 rounded border border-stratos-accent/20 shadow-[0_0_10px_rgba(23,241,209,0.1)] tracking-widest font-bold">WON</span>
                                ) : bet.actual === 'LOST' ? (
                                    <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] tracking-widest font-bold">LOST</span>
                                ) : (
                                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] tracking-widest font-bold">PENDING</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight relative z-10">
                                {bet.isAccumulator ? (
                                    `${bet.accumulatorLegs?.length || 0} FOLD ACCUMULATOR`
                                ) : (
                                    <>{bet.game.home} <span className="text-gray-600 font-normal mx-1">v</span> {bet.game.away}</>
                                )}
                            </p>
                            
                            {bet.isAccumulator && bet.accumulatorLegs && (
                                <div className="space-y-1 mt-2 relative z-10">
                                    {bet.accumulatorLegs.map((leg: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 glass-panel p-1.5 rounded border border-white/5">
                                            <div className="flex justify-between items-center text-[9px] font-mono">
                                                <span className="text-gray-400 truncate max-w-[120px]">{leg.home} v {leg.away}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-purple-400 font-bold">{leg.market}</span>
                                                    <span className="text-white">@{convertOdds(leg.odds, oddsFormat)}</span>
                                                </div>
                                            </div>
                                            {bet.actual === null && leg.actual == null && (
                                                <div className="flex gap-1 mt-1">
                                                    <button onClick={() => handleResolveLeg(bet.id, i, 'WON')} className="flex-1 py-1 rounded bg-stratos-accent/10 hover:bg-stratos-accent/20 text-stratos-accent text-[8px] font-bold uppercase">W</button>
                                                    <button onClick={() => handleResolveLeg(bet.id, i, 'LOST')} className="flex-1 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[8px] font-bold uppercase">L</button>
                                                    <button onClick={() => handleResolveLeg(bet.id, i, 'VOID')} className="flex-1 py-1 rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 text-[8px] font-bold uppercase">V</button>
                                                </div>
                                            )}
                                            {leg.actual !== null && (
                                                <div className={`text-[8px] font-bold uppercase tracking-widest text-right ${leg.actual === 'WON' ? 'text-stratos-accent' : leg.actual === 'LOST' ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {leg.actual}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] font-mono relative z-10 pt-2 border-t border-white/5">
                                <span className="text-gray-400 uppercase tracking-widest font-bold">{bet.isAccumulator ? 'ACCUMULATOR' : bet.bestBet}</span>
                                <span className="text-white font-black tracking-tight text-sm drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{formatCurrency(bet.stake, currency)}</span>
                            </div>
                            {bet.actual === null && (
                                <div className="flex gap-2 mt-3 relative z-10">
                                    <button 
                                        onClick={() => {
                                            const odds = bet.isAccumulator ? bet.game.oddsH : (bet.bestBet === 'HOME WIN' ? bet.game.oddsH : bet.bestBet === 'DRAW' ? bet.game.oddsD : bet.game.oddsA) || 1;
                                            resolveForecastInStore(bet.id, 'WON');
                                            resolveBankroll(true, bet.stake, odds);
                                            fireWinningConfetti();
                                            showToast("Bet marked as WON", "success");
                                        }}
                                        className="flex-1 py-2 rounded-xl bg-stratos-accent/10 hover:bg-stratos-accent/20 border border-stratos-accent/20 text-stratos-accent text-[8px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Won
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const odds = bet.isAccumulator ? bet.game.oddsH : (bet.bestBet === 'HOME WIN' ? bet.game.oddsH : bet.bestBet === 'DRAW' ? bet.game.oddsD : bet.game.oddsA) || 1;
                                            resolveForecastInStore(bet.id, 'LOST');
                                            resolveBankroll(false, bet.stake, odds);
                                            showToast("Bet marked as LOST", "error");
                                        }}
                                        className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Lost
                                    </button>
                                    <button 
                                        onClick={() => {
                                            resolveForecastInStore(bet.id, 'VOID');
                                            updateBankroll(prev => prev + bet.stake);
                                            showToast("Bet marked as VOID", "success");
                                        }}
                                        className="flex-1 py-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 text-gray-400 text-[8px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Void
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};
