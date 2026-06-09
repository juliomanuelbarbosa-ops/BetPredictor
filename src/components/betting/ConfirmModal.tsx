import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import { formatCurrency, convertOdds } from '../../lib/utils';

import { OddsFormat } from '../../stores/settingsStore';

interface ConfirmModalProps {
    showConfirmModal: boolean;
    setShowConfirmModal: (show: boolean) => void;
    selections: any[];
    isAccumulator: boolean;
    stake: number;
    currency: string;
    oddsFormat: OddsFormat;
    calculateTotalOdds: () => number;
    confirmBet: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    showConfirmModal,
    setShowConfirmModal,
    selections,
    isAccumulator,
    stake,
    currency,
    oddsFormat,
    calculateTotalOdds,
    confirmBet
}) => {
    return (
        <AnimatePresence>
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmModal(false)}
                        className="absolute inset-0 glass-panel backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-black border border-white/10 p-8 rounded-[3rem] max-w-md w-full relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                    <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">Confirm Bet</h3>
                        <button onClick={() => setShowConfirmModal(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {selections.map((s, i) => (
                                <div key={i} className="p-4 rounded-2xl glass-panel border border-white/5 shadow-inner">
                                    <p className="text-[9px] font-mono text-stratos-accent uppercase tracking-[0.2em] mb-1 font-bold">{s.match.league}</p>
                                    <p className="text-sm font-bold text-white tracking-tight">{s.match.home} vs {s.match.away}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{s.market}</span>
                                        <span className="text-xs font-black text-blue-400">{convertOdds(s.market === 'HOME' ? s.match.oddsH : s.market === 'DRAW' ? s.match.oddsD : s.match.oddsA, oddsFormat)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-3xl bg-stratos-accent/10 border border-stratos-accent/20 relative overflow-hidden group/confirm shadow-[0_0_30px_rgba(23,241,209,0.1)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-stratos-accent/0 via-stratos-accent/5 to-stratos-accent/0 -translate-x-full group-hover/confirm:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <span className="text-[10px] font-mono text-stratos-accent/70 uppercase tracking-widest font-bold">Type</span>
                                <span className="text-xs font-black text-white uppercase tracking-widest">{isAccumulator ? 'Accumulator' : selections.length > 1 ? 'Single Bets' : 'Single Bet'}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <span className="text-[10px] font-mono text-stratos-accent/70 uppercase tracking-widest font-bold">Total Odds</span>
                                <span className="text-xs font-black text-white font-mono">{calculateTotalOdds().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <span className="text-[10px] font-mono text-stratos-accent/70 uppercase tracking-widest font-bold">Total Stake</span>
                                <span className="text-xl font-black text-white font-mono">{formatCurrency(stake, currency)}</span>
                            </div>
                            <div className="w-full h-px bg-stratos-accent/20 mb-4 relative z-10"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-mono text-stratos-accent/70 uppercase tracking-widest font-bold">Potential Return</span>
                                <span className="text-2xl font-black text-stratos-accent font-mono drop-shadow-[0_0_10px_rgba(23,241,209,0.2)]">
                                    {formatCurrency(stake * calculateTotalOdds(), currency)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBet}
                                className="flex-[2] py-4 rounded-2xl bg-stratos-accent hover:bg-stratos-accent text-black font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(23,241,209,0.3)] hover:shadow-[0_0_40px_rgba(23,241,209,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" /> Confirm Bet
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
};
