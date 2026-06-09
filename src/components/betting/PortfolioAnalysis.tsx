import React from 'react';
import { motion } from 'motion/react';
import { Activity, Info } from 'lucide-react';
import { formatCurrency, convertOdds } from '../../lib/utils';
import { PortfolioOptimiserResult } from '../../lib/portfolioOptimiser';

import { OddsFormat } from '../../stores/settingsStore';

interface PortfolioAnalysisProps {
    portfolioResult: PortfolioOptimiserResult | null;
    currency: string;
    oddsFormat: OddsFormat;
}

export const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({
    portfolioResult,
    currency,
    oddsFormat
}) => {
    return (
        <motion.div 
            key="portfolio"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        >
            <h3 className="text-xl font-display font-bold text-white tracking-tight mb-6 flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-400" />
                Daily Portfolio
            </h3>
            
            {!portfolioResult || portfolioResult.bets.length === 0 ? (
                <div className="text-center py-20 px-6 border border-stratos-border/50 rounded-3xl glass-panel relative overflow-hidden group/empty shadow-2xl">
                    <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-stratos-bg/40 to-transparent pointer-events-none"></div>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-stratos-border/50 flex flex-col items-center justify-center mb-6 animate-[spin_12s_linear_infinite] relative">
                            <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 animate-[spin_6s_linear_infinite_reverse]"></div>
                            <Activity className="w-6 h-6 text-purple-400 opacity-80 animate-[spin_12s_linear_infinite_reverse] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        </div>
                        <p className="text-sm font-mono text-white uppercase tracking-[0.2em] relative z-10 font-bold mb-2 drop-shadow-md">No Active Portfolio</p>
                        <p className="text-[10px] font-mono text-stratos-muted relative z-10 max-w-[200px] leading-relaxed uppercase tracking-widest">Add bets to your slip to initiate portfolio covariance analysis.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 relative overflow-hidden group/summary shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
                        <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            Portfolio Summary
                        </p>
                        <p className="text-3xl font-black text-white mb-2 tracking-tight relative z-10">{portfolioResult.bets.length} <span className="text-sm font-normal text-gray-400 tracking-normal">Active Bets</span></p>
                        <p className="text-xs font-mono text-gray-400 leading-relaxed relative z-10">{portfolioResult.insight}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl glass-panel border border-white/5 relative overflow-hidden group/stat shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2 relative z-10">Total Exposure</p>
                            <p className="text-2xl font-black text-white tracking-tight relative z-10">{(portfolioResult.totalExposure * 100).toFixed(1)}%</p>
                            <p className="text-[10px] font-mono text-red-400 mt-2 relative z-10 bg-red-500/10 inline-block px-2 py-1 rounded border border-red-500/20 shadow-inner">Max Loss: {formatCurrency(portfolioResult.maxLoss, currency)}</p>
                        </div>
                        <div className="p-5 rounded-3xl glass-panel border border-white/5 relative overflow-hidden group/stat shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2 relative z-10">Portfolio EV</p>
                            <p className="text-2xl font-black text-stratos-accent tracking-tight relative z-10 drop-shadow-[0_0_10px_rgba(23,241,209,0.2)]">+{formatCurrency(portfolioResult.portfolioEV, currency)}</p>
                            <p className="text-[10px] font-mono text-stratos-accent/50 mt-2 relative z-10 uppercase tracking-widest">Expected Return</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                            Correlation-Adjusted Stakes
                        </p>
                        <div className="space-y-2">
                            {portfolioResult.bets.map((b, i) => (
                                <div key={i} className="p-5 rounded-2xl glass-panel border border-white/5 flex justify-between items-center hover:bg-white/5 transition-colors group/bet shadow-inner">
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1 tracking-tight">{b.bet.match}</p>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{b.bet.selection} <span className="text-gray-600 mx-1">@</span> <span className="text-blue-400 font-bold">{convertOdds(b.bet.odds, oddsFormat)}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white tracking-tight mb-1">{formatCurrency(b.recommendedStake, currency)}</p>
                                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Adj. Kelly: <span className="text-stratos-accent font-bold">{(b.adjustedKelly * 100).toFixed(1)}%</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
