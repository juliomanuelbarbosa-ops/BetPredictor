import React, { useState } from 'react';
import { Brain, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';

import { SpartaLogo } from './SpartaLogo';
import { formatCurrency, convertOdds } from '../lib/utils';
import { useUserStore } from '../stores/userStore';
import { useForecastStore } from '../stores/forecastStore';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';

interface ForecastCardProps {
    pred: any;
    index: number;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ pred, index }) => {
    const { currency, resolveForecast: resolveBankroll, updateBankroll } = useUserStore();
    const { resolveForecast: resolveForecastInStore, removeForecast, updateForecast } = useForecastStore();
    const { showToast } = useUIStore();
    const { oddsFormat } = useSettingsStore();

    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    const copyForecast = (pred: any) => {
        const text = `SPARTA PREDICTION: ${pred.isAccumulator ? pred.game.home + ' ACCUMULATOR' : pred.game.home + ' vs ' + pred.game.away}\n` +
            `Best Bet: ${pred.isAccumulator ? 'ACCUMULATOR' : pred.bestBet}\n` +
            `Confidence: ${pred.confidence}%\n` +
            `Odds: ${pred.isAccumulator ? convertOdds(pred.game.oddsH, oddsFormat) : convertOdds(pred.game.oddsH, oddsFormat) + ' / ' + convertOdds(pred.game.oddsD, oddsFormat) + ' / ' + convertOdds(pred.game.oddsA, oddsFormat)}`;
        navigator.clipboard.writeText(text);
        showToast("Forecast copied to clipboard", "success");
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-panel border border-stratos-border rounded-[2.5rem] p-8 relative overflow-hidden group/pred hover:border-stratos-accent/50 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(23,241,209,0.15)] shadow-xl"
        >
            {/* SCANLINE DECORATION */}
            <div className="absolute inset-0 tech-grid opacity-10 mix-blend-screen pointer-events-none z-0"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stratos-accent/50 to-transparent opacity-0 group-hover/pred:opacity-100 transition-opacity duration-500 z-10"></div>
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-stratos-accent/50 to-transparent opacity-0 group-hover/pred:opacity-100 transition-opacity duration-500 z-10"></div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/pred:animate-[shimmer_2s_infinite] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-stratos-accent/0 via-stratos-accent/50 to-stratos-accent/0 opacity-0 group-hover/pred:opacity-100 transition-opacity"></div>
            <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover/pred:opacity-10 transition-all duration-700 transform group-hover/pred:scale-110 group-hover/pred:rotate-12">
                <SpartaLogo className="w-64 h-64 text-stratos-accent" />
            </div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-stratos-accent/70 uppercase tracking-[0.2em]">{pred.game.league}</span>
                        <span className="w-1 h-1 rounded-full bg-stratos-accent/30"></span>
                        <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">ID: {pred.id}</span>
                    </div>
                    {pred.isAccumulator ? (
                        <h3 className="text-2xl font-display font-bold text-white tracking-[0.1em] uppercase leading-tight">{pred.game.home} <br/><span className="text-stratos-accent/50 font-mono text-sm mx-1 italic font-normal tracking-[0.2em]">ACCUMULATOR</span></h3>
                    ) : (
                        <h3 className="text-2xl font-display font-bold text-white tracking-[0.1em] uppercase leading-tight">{pred.game.home} <br/><span className="text-stratos-accent/50 font-mono text-sm mx-1 italic font-normal tracking-[0.2em]">vs</span> {pred.game.away}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Confidence</div>
                        <div className="h-1.5 w-24 glass-panel rounded-full overflow-hidden">
                            <div className="h-full bg-stratos-accent" style={{ width: `${pred.confidence}%` }}></div>
                        </div>
                        <div className="text-xs font-black text-white flex items-center gap-1 font-mono">
                            {pred.confidence}%
                            {pred.confidenceHistory && pred.confidenceHistory.length > 1 && (
                                <span className={`text-[10px] ${pred.confidence > pred.confidenceHistory[0].confidence ? 'text-stratos-accent' : 'text-red-400'}`}>
                                    {pred.confidence > pred.confidenceHistory[0].confidence ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                        
                        {pred.modelUncertainty !== undefined && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-stratos-border mx-2"></span>
                                <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Uncertainty</div>
                                <div className="text-xs font-black text-white">{pred.modelUncertainty}%</div>
                            </>
                        )}
                    </div>
                    {pred.tags && pred.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {pred.tags.map((tag: string) => (
                                <span key={tag} className="text-[8px] font-mono bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/20 px-2 py-0.5 rounded uppercase font-bold tracking-[0.2em] shadow-[inset_0_2px_8px_rgba(23,241,209,0.1)]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {pred.isAccumulator ? (
                        <div className="flex gap-2 mt-4 font-mono text-[10px] text-stratos-muted tracking-[0.2em]">
                            <span className="glass-panel border border-stratos-border px-2 py-1 rounded-lg shadow-inner">TOTAL ODDS: <span className="text-white font-bold">{convertOdds(pred.game.oddsH || 1, oddsFormat)}</span></span>
                        </div>
                    ) : (
                        <div className="flex gap-2 mt-4 font-mono text-[10px] text-stratos-muted tracking-[0.2em]">
                            <span className="glass-panel border border-stratos-border px-2 py-1 rounded-lg shadow-inner">H: <span className="text-white font-bold">{convertOdds(pred.game.oddsH || 1, oddsFormat)}</span></span>
                            <span className="glass-panel border border-stratos-border px-2 py-1 rounded-lg shadow-inner">D: <span className="text-white font-bold">{convertOdds(pred.game.oddsD || 1, oddsFormat)}</span></span>
                            <span className="glass-panel border border-stratos-border px-2 py-1 rounded-lg shadow-inner">A: <span className="text-white font-bold">{convertOdds(pred.game.oddsA || 1, oddsFormat)}</span></span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setEditingNotes(pred.id);
                                setNoteText(pred.notes || "");
                            }}
                            className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all hover:scale-110 active:scale-95"
                            title="Add Notes"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                            onClick={() => copyForecast(pred)}
                            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-110 active:scale-95"
                            title="Copy Forecast"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button 
                            onClick={() => removeForecast(pred.id)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all hover:scale-110 active:scale-95"
                            title="Delete Forecast"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div className="text-right flex flex-col items-end glass-panel p-6 rounded-[2rem] border border-stratos-border shadow-inner relative overflow-hidden group/conf">
                        <div className="absolute inset-0 bg-stratos-accent/5 opacity-0 group-hover/conf:opacity-100 transition-opacity"></div>
                        <div className="text-5xl font-black text-stratos-accent tracking-[0.1em] drop-shadow-[0_0_20px_rgba(23,241,209,0.4)] relative z-10">{pred.confidence}%</div>
                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.3em] mt-2 relative z-10">Conviction EV</div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {pred.notes && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 mb-4 shadow-inner">
                        <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest mb-1 font-bold">Personal Notes</p>
                        <p className="text-xs text-stratos-muted italic">"{pred.notes}"</p>
                    </div>
                )}

                {editingNotes === pred.id && (
                    <div className="glass-panel border border-stratos-border rounded-3xl p-6 mb-6 animate-in slide-in-from-top duration-300 shadow-xl">
                        <textarea 
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your tactical notes here..."
                            className="w-full bg-stratos-bg border border-stratos-border rounded-xl p-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-stratos-accent/50 min-h-[100px] shadow-inner font-mono"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button 
                                onClick={() => setEditingNotes(null)}
                                className="px-4 py-2 text-xs text-stratos-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    updateForecast(pred.id, { notes: noteText });
                                    setEditingNotes(null);
                                    showToast("Notes saved", "success");
                                }}
                                className="px-4 py-2 bg-stratos-accent/20 text-stratos-accent border border-stratos-accent/30 rounded-lg text-xs font-bold hover:bg-stratos-accent/30 transition-all font-mono tracking-widest uppercase"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>
                )}

                <div className="glass-panel rounded-3xl p-8 border border-stratos-border shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)] relative overflow-hidden group/bet">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/bet:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stratos-accent/50 group-hover/bet:bg-stratos-accent transition-colors"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-2xl border border-stratos-border shadow-inner relative group/vig">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover/vig:opacity-100 transition-opacity"></div>
                    <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-1">De-Vigged Win Prob</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-yellow-500 font-mono drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                            {((1 / (pred.game.oddsH || 1)) * 100 * 0.94).toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-2xl border border-stratos-border shadow-inner relative group/kelly">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover/kelly:opacity-100 transition-opacity"></div>
                    <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-1">Fractional Kelly (0.25x)</p>
                    <div className="flex gap-1">
                        <span className="text-xl font-bold text-purple-400 font-mono drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] border-b-2 border-purple-400/50">
                            {formatCurrency(pred.stake, currency)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 relative z-10 px-2 mt-4 border-t border-stratos-border/50 pt-4">
                <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Consensus Market Position</span>
                <span className="font-black text-xl text-stratos-accent tracking-[0.1em] uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    {pred.isAccumulator ? 'ACCUMULATOR' : pred.bestBet}
                 </span>
            </div>
                    {pred.predScore && (
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Predicted Score</span>
                            <span className="font-mono font-black text-2xl text-white tracking-[0.1em]">{pred.predScore}</span>
                        </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-stratos-border relative z-10">
                        <div className="flex justify-between text-[10px] font-mono text-stratos-muted mb-3 uppercase tracking-[0.2em] font-bold">
                            <span>H: {(pred.probs[0] * 100).toFixed(1)}%</span>
                            <span>D: {(pred.probs[1] * 100).toFixed(1)}%</span>
                            <span>A: {(pred.probs[2] * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-stratos-bg rounded-full flex overflow-hidden shadow-inner">
                            <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${pred.probs[0] * 100}%` }}></div>
                            <div className="h-full bg-stratos-muted" style={{ width: `${pred.probs[1] * 100}%` }}></div>
                            <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${pred.probs[2] * 100}%` }}></div>
                        </div>
                    </div>

                    {pred.votes && (
                        <div className="mt-6 pt-6 border-t border-stratos-border relative z-10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em]">Ensemble Vote Breakdown</span>
                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase tracking-[0.2em] ${pred.disagreement > 0.4 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-stratos-accent/10 border-stratos-accent/30 text-stratos-accent'}`}>
                                    {pred.disagreement > 0.4 ? '⚠️ High Disagreement' : '💎 High Conviction'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="bg-stratos-bg p-2.5 rounded-xl border border-stratos-border text-center">
                                    <span className="text-[9px] text-stratos-muted block mb-1 font-mono uppercase tracking-[0.2em]">Home</span>
                                    <span className="text-sm font-black text-white">{pred.votes[0]}/3</span>
                                </div>
                                <div className="bg-stratos-bg p-2.5 rounded-xl border border-stratos-border text-center">
                                    <span className="text-[9px] text-stratos-muted block mb-1 font-mono uppercase tracking-[0.2em]">Draw</span>
                                    <span className="text-sm font-black text-white">{pred.votes[1]}/3</span>
                                </div>
                                <div className="bg-stratos-bg p-2.5 rounded-xl border border-stratos-border text-center">
                                    <span className="text-[9px] text-stratos-muted block mb-1 font-mono uppercase tracking-[0.2em]">Away</span>
                                    <span className="text-sm font-black text-white">{pred.votes[2]}/3</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {pred.valueText && (
                        <div className="mt-6 text-[10px] font-mono font-black text-stratos-accent bg-stratos-accent/10 border border-stratos-accent/30 inline-block px-5 py-2.5 rounded-xl shadow-[inset_0_2px_10px_rgba(23,241,209,0.1)] uppercase tracking-[0.2em] relative z-10 w-full text-center">
                            {pred.valueText}
                        </div>
                    )}
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-stratos-border relative group/insight overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/insight:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] flex items-center gap-2 font-bold group-hover/insight:text-stratos-accent transition-colors">
                            <Brain className="w-4 h-4 text-stratos-accent" />
                            Tactical Insight
                        </div>
                        <div className="text-[8px] font-mono text-stratos-accent border border-stratos-accent/30 bg-stratos-accent/10 px-2 py-0.5 rounded uppercase tracking-[0.2em] font-bold shadow-[inset_0_2px_10px_rgba(23,241,209,0.1)]">
                            {pred.bytezAnalysis.provider || 'SPARTA_CORE'}
                        </div>
                    </div>
                    <p className="text-sm text-stratos-muted leading-relaxed font-medium italic relative z-10 font-mono tracking-tight group-hover/insight:text-white transition-colors">"{pred.bytezAnalysis.report}"</p>
                    <div className="mt-6 pt-4 border-t border-stratos-border/50 flex justify-between items-center relative z-10">
                        <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Optimal Market <span className="opacity-50 tracking-widest">({pred.bytezAnalysis.category})</span></span>
                        <span className="text-xs font-mono font-bold text-stratos-accent uppercase tracking-[0.2em]">{pred.bytezAnalysis.market}</span>
                    </div>
                </div>

                {pred.osAnalysis && (
                    <div className="glass-panel rounded-2xl p-6 border border-stratos-border relative group/os overflow-hidden mt-4 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover/os:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] flex items-center gap-2 font-bold group-hover/os:text-blue-400 transition-colors">
                                <Brain className="w-4 h-4 text-blue-400" />
                                OS-ANALYST
                            </div>
                            <div className="text-[8px] font-mono text-blue-400 border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em] font-bold shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]">
                                OPEN SOURCE MODELS
                            </div>
                        </div>
                        <p className="text-sm text-stratos-muted leading-relaxed font-medium italic relative z-10 font-mono tracking-tight group-hover/os:text-white transition-colors">"{pred.osAnalysis.data.summary}"</p>
                        <div className="mt-6 pt-4 border-t border-stratos-border/50 flex justify-between items-center relative z-10">
                            <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Methodology <span className="opacity-50 tracking-widest">({pred.osAnalysis.data.methodology})</span></span>
                            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-[0.2em]">{pred.osAnalysis.data.forecast}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 px-4">
                    <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.3em]">Calculated EV Stake</div>
                    <div className="font-black text-3xl text-white tracking-[0.1em] font-mono">
                        {formatCurrency(pred.stake, currency)}
                    </div>
                </div>
                
                {pred.actual === null ? (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-stratos-border">
                        <button 
                            onClick={() => {
                                const odds = (pred.isAccumulator ? pred.game.oddsH : (pred.bestBet === 'HOME WIN' ? pred.game.oddsH : pred.bestBet === 'DRAW' ? pred.game.oddsD : pred.game.oddsA)) || 1;
                                resolveForecastInStore(pred.id, 'WON');
                                resolveBankroll(true, pred.stake, odds);
                            }}
                            className="flex-1 bg-stratos-accent/10 hover:bg-stratos-accent border border-stratos-accent/30 hover:border-stratos-accent text-stratos-accent hover:text-stratos-bg py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] font-mono hover:shadow-[0_0_20px_rgba(23,241,209,0.3)]"
                        >
                            Mark Won
                        </button>
                        <button 
                            onClick={() => {
                                const odds = (pred.isAccumulator ? pred.game.oddsH : (pred.bestBet === 'HOME WIN' ? pred.game.oddsH : pred.bestBet === 'DRAW' ? pred.game.oddsD : pred.game.oddsA)) || 1;
                                resolveForecastInStore(pred.id, 'LOST');
                                resolveBankroll(false, pred.stake, odds);
                            }}
                            className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] font-mono"
                        >
                            Mark Lost
                        </button>
                        <button 
                            onClick={() => {
                                resolveForecastInStore(pred.id, 'VOID');
                                updateBankroll(prev => prev + pred.stake);
                            }}
                            className="flex-1 bg-stratos-muted/10 hover:bg-stratos-muted border border-stratos-muted/30 hover:border-stratos-muted text-stratos-muted hover:text-black py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] font-mono"
                        >
                            Mark Void
                        </button>
                    </div>
                ) : (
                    <div className={`mt-6 pt-6 border-t border-stratos-border text-center text-[10px] font-black tracking-[0.4em] uppercase font-mono ${pred.actual === 'WON' ? 'text-stratos-accent' : pred.actual === 'LOST' ? 'text-red-500' : 'text-stratos-muted'}`}>
                        <span className="opacity-50 mr-2">Status:</span> {pred.actual}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
