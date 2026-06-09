import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { DollarSign, X, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, convertOdds, CURRENCIES } from '../../lib/utils';

import { OddsFormat } from '../../stores/settingsStore';
import { MetacognitiveReport } from '../../lib/metacognition';
import { TimingAdvice } from '../../lib/betTimingEngine';

interface BetSlipProps {
    selections: any[];
    stake: number;
    setStake: (stake: number) => void;
    isAccumulator: boolean;
    setIsAccumulator: (isAccumulator: boolean) => void;
    bankroll: number;
    currency: string;
    oddsFormat: OddsFormat;
    kellyFraction: number;
    setKellyFraction: (fraction: number) => void;
    calculateTotalOdds: () => number;
    calculateTotalProbability: () => number;
    calculateKellyStake: (prob: number, odds: number, fraction: number, uncertainty: number, bankroll: number) => number;
    handlePlaceBet: () => void;
    removeSelection: (matchId: string) => void;
    clearSlip: () => void;
    activeMatchId: string | null;
    setActiveMatchId: (id: string | null) => void;
    uncertaintyReport: MetacognitiveReport | null;
    timingAdvice: TimingAdvice | null;
}

export const BetSlip: React.FC<BetSlipProps> = ({
    selections,
    stake,
    setStake,
    isAccumulator,
    setIsAccumulator,
    bankroll,
    currency,
    oddsFormat,
    kellyFraction,
    setKellyFraction,
    calculateTotalOdds,
    calculateTotalProbability,
    calculateKellyStake,
    removeSelection,
    clearSlip,
    handlePlaceBet,
    activeMatchId,
    setActiveMatchId
}) => {
    return (
        <motion.div 
            key="slip"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group/slip overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/slip:animate-[shimmer_2.5s_infinite] pointer-events-none"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/20 shadow-inner">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold text-white tracking-tight">Bet Slip</h3>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Bankroll: {formatCurrency(bankroll, currency)}</p>
                    </div>
                </div>
                {selections.length > 0 && (
                    <button
                        onClick={clearSlip}
                        className="text-[10px] font-mono text-gray-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                    >
                        Clear
                    </button>
                )}
            </div>

            {selections.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl border border-white/5 shadow-inner">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <TrendingUp className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] font-bold">Select a match to bet</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selections.map((s, i) => (
                            <motion.div 
                                key={s.match.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setActiveMatchId(s.match.id)}
                                className={`p-4 rounded-2xl border relative group/selection cursor-pointer transition-all ${
                                    activeMatchId === s.match.id || (!activeMatchId && i === selections.length - 1)
                                        ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                        : 'glass-panel border-white/5 hover:border-white/20'
                                }`}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeSelection(s.match.id); }}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/selection:opacity-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <p className="text-[9px] font-mono text-stratos-accent uppercase tracking-widest mb-1">{s.match.league}</p>
                                <p className="text-xs font-bold text-white mb-2">{s.match.home} vs {s.match.away}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{s.market}</span>
                                    <span className="text-sm font-black text-blue-400">{convertOdds(s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA, oddsFormat)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {selections.length > 1 && (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">Accumulator</span>
                            </div>
                            <button 
                                onClick={() => setIsAccumulator(!isAccumulator)}
                                className={`w-12 h-6 rounded-full transition-all relative ${isAccumulator ? 'bg-blue-500' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAccumulator ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    )}

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Stake Amount</p>
                            <p className="text-[10px] font-mono text-stratos-accent bg-stratos-accent/10 px-2 py-0.5 rounded border border-stratos-accent/20 shadow-inner">Max: {formatCurrency(bankroll, currency)}</p>
                        </div>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <span className="text-stratos-accent font-mono text-xl font-black">{CURRENCIES.find(c => c.code === currency)?.symbol || '$'}</span>
                            </div>
                            <input 
                                type="number" 
                                min="0"
                                max={bankroll}
                                step="0.01"
                                value={stake}
                                onChange={(e) => setStake(Number(e.target.value))}
                                className="w-full glass-panel border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-stratos-accent/50 focus:ring-1 focus:ring-stratos-accent/50 transition-all font-mono text-3xl font-black shadow-inner group-hover/input:border-white/20"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {[0.25, 0.5, 1].map(frac => (
                                <button 
                                    key={frac}
                                    onClick={() => setKellyFraction(frac)}
                                    className={`py-2.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest transition-all border ${kellyFraction === frac ? 'bg-stratos-accent/10 text-stratos-accent border-stratos-accent/40 shadow-[0_0_15px_rgba(23,241,209,0.1)]' : 'glass-panel text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'}`}
                                >
                                    {frac === 1 ? 'Full Kelly' : frac === 0.5 ? 'Half Kelly' : '1/4 Kelly'}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                            {[0.1, 0.25, 0.5].map(pct => (
                                <button
                                    key={pct}
                                    aria-label={`Set stake to ${pct * 100}% of bankroll`}
                                    onClick={() => setStake(Number((bankroll * pct).toFixed(2)))}
                                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-[10px] font-mono text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-bold shadow-inner"
                                >
                                    {pct * 100}%
                                </button>
                            ))}
                            <button
                                aria-label="Set stake to maximum bankroll"
                                onClick={() => setStake(bankroll)}
                                className="py-2.5 rounded-xl bg-stratos-accent/10 hover:bg-stratos-accent/20 border border-stratos-accent/30 text-[10px] font-mono text-stratos-accent hover:text-stratos-accent transition-colors uppercase tracking-widest font-black shadow-[0_0_15px_rgba(23,241,209,0.1)]"
                            >
                                MAX
                            </button>
                        </div>
                    </motion.div>

                    {/* KELLY CRITERION FOR SELECTIONS */}
                    {selections.length > 0 && (
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-stratos-accent/5 border border-stratos-accent/20 p-6 rounded-[2rem] space-y-4 relative overflow-hidden shadow-[0_0_30px_rgba(23,241,209,0.05)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-2 rounded-xl bg-stratos-accent/10 border border-stratos-accent/20 shadow-inner">
                                    <Activity className="w-4 h-4 text-stratos-accent" />
                                </div>
                                <span className="text-xs font-display font-black text-white tracking-widest uppercase">Kelly Criterion</span>
                            </div>
                            
                            <div className="space-y-4 relative z-10 glass-panel p-4 rounded-2xl border border-white/5 shadow-inner">
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Calculated Edge</span>
                                    <span className="text-sm font-black text-stratos-accent font-mono">
                                        {(() => {
                                            const odds = calculateTotalOdds();
                                            const prob = calculateTotalProbability();
                                            const edge = (prob * odds - 1) / (odds - 1);
                                            return (edge * 100).toFixed(2);
                                        })()}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Recommended Stake</span>
                                    <span className="text-sm font-black text-stratos-accent font-mono">
                                        {formatCurrency((() => {
                                            const odds = calculateTotalOdds();
                                            const prob = calculateTotalProbability();
                                            // Use average uncertainty for simplicity or just a default
                                            const uncertainty = selections.reduce((acc, s) => acc + (s.match.uncertainty || 0.1), 0) / selections.length;
                                            return calculateKellyStake(prob * 100, odds, kellyFraction, uncertainty, bankroll);
                                        })(), currency)}
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    const odds = calculateTotalOdds();
                                    const prob = calculateTotalProbability();
                                    const uncertainty = selections.reduce((acc, s) => acc + (s.match.uncertainty || 0.1), 0) / selections.length;
                                    setStake(Number(calculateKellyStake(prob * 100, odds, kellyFraction, uncertainty, bankroll).toFixed(2)));
                                }}
                                className="w-full py-4 mt-2 bg-stratos-accent/10 hover:bg-stratos-accent/20 border border-stratos-accent/30 rounded-2xl text-[10px] font-mono font-black text-stratos-accent uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(23,241,209,0.1)] hover:shadow-[0_0_25px_rgba(23,241,209,0.2)] hover:scale-[1.02] relative z-10"
                            >
                                Apply Recommended Stake
                            </button>
                        </motion.div>
                        
                    )}

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">Total Odds</span>
                            <span className="text-xl font-black text-white tracking-tight">{calculateTotalOdds().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">Potential Return</span>
                            <span className="text-2xl font-black text-stratos-accent tracking-tight">{formatCurrency(stake * calculateTotalOdds(), currency)}</span>
                        </div>

                        <button 
                            onClick={handlePlaceBet}
                            className="w-full py-5 rounded-2xl bg-stratos-accent hover:bg-stratos-accent text-black font-display font-black text-lg uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(23,241,209,0.3)] hover:shadow-[0_0_50px_rgba(23,241,209,0.5)] active:scale-[0.98]"
                        >
                            Place {isAccumulator ? 'Accumulator' : selections.length > 1 ? 'Single Bets' : 'Bet'}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
