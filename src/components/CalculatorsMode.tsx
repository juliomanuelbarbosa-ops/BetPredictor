import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import { Calculator, Percent, ArrowRightLeft, Target, TrendingUp, BarChart3, LineChart, Coins, Zap } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useUserStore } from '../stores/userStore';

export const CalculatorsMode = () => {
    const { bankroll, currency } = useUserStore();
    const [activeTab, setActiveTab] = useState<'KELLY' | 'ARBITRAGE' | 'EV' | 'IMPLIED' | 'CONVERTER'>('KELLY');

    // State for Kelly Criterion
    const [kOdds, setKOdds] = useState<number>(2.0);
    const [kProb, setKProb] = useState<number>(55);
    const [kFraction, setKFraction] = useState<number>(1);

    // State for Arbitrage
    const [aOdds1, setAOdds1] = useState<number>(2.1);
    const [aOdds2, setAOdds2] = useState<number>(2.1);
    const [aTotalStake, setATotalStake] = useState<number>(1000);

    // State for Expected Value
    const [eOdds, setEOdds] = useState<number>(2.5);
    const [eProb, setEProb] = useState<number>(45);
    const [eStake, setEStake] = useState<number>(100);

    // State for Implied Probability
    const [iOdds, setIOdds] = useState<number>(1.95);

    // State for Converter
    const [cDecimal, setCDecimal] = useState<number>(2.0);
    const [cAmerican, setCAmerican] = useState<number>(100);
    const [cFractional, setCFractional] = useState<string>("1/1");

    const handleDecimalChange = (val: number) => {
        setCDecimal(val);
        if (val >= 2) setCAmerican(Math.round((val - 1) * 100));
        else if (val > 1) setCAmerican(Math.round(-100 / (val - 1)));
        
        // Simple fractional approx
        const dec = val - 1;
        setCFractional(`${Math.round(dec * 100)}/100`);
    };

    const handleAmericanChange = (val: number) => {
        setCAmerican(val);
        let dec = 0;
        if (val > 0) dec = (val / 100) + 1;
        else if (val < 0) dec = (100 / Math.abs(val)) + 1;
        setCDecimal(dec);
        setCFractional(`${Math.round((dec - 1) * 100)}/100`);
    };

    // Calculations
    // Kelly
    const kB = kOdds - 1;
    const kP = kProb / 100;
    const kQ = 1 - kP;
    const kellyPct = Math.max(0, (((kP * kB) - kQ) / kB) * kFraction * 100);
    const kellyStake = (kellyPct / 100) * bankroll;
    const kEV = (kP * kOdds) - 1;

    // Arbitrage
    const aImp1 = 1 / aOdds1;
    const aImp2 = 1 / aOdds2;
    const aMargin = (aImp1 + aImp2) * 100;
    const isArbitrage = aMargin < 100;
    const aStake1 = isArbitrage ? (aTotalStake * aImp1) / (aMargin / 100) : 0;
    const aStake2 = isArbitrage ? (aTotalStake * aImp2) / (aMargin / 100) : 0;
    const aProfit = isArbitrage ? (aTotalStake / (aMargin / 100)) - aTotalStake : 0;
    const aRoi = isArbitrage ? (aProfit / aTotalStake) * 100 : 0;

    // Expected Value
    const eWin = (eOdds - 1) * eStake;
    const eLoss = eStake;
    const eP = eProb / 100;
    const evAmt = (eWin * eP) - (eLoss * (1 - eP));
    const evPct = (evAmt / eStake) * 100;

    // Implied
    const impliedProb = (1 / iOdds) * 100;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="mb-12 cursor-default">
                <h1 className="text-4xl font-mono uppercase tracking-[0.2em] text-white flex items-center gap-4 group">
                    <Calculator className="w-10 h-10 text-stratos-accent group-hover:scale-110 transition-transform duration-500" />
                    Pro <span className="text-stratos-accent">Calculators</span>
                </h1>
                <p className="text-stratos-muted mt-2 font-mono text-[10px] uppercase tracking-widest">
                    Mathematical precision • Risk management • Edge quantification
                </p>
            </header>

            <div className="flex flex-wrap gap-4 border-b border-stratos-border/50 pb-4">
                {[
                    { id: 'KELLY', label: 'Kelly Criterion', icon: Target },
                    { id: 'EV', label: 'Expected Value', icon: TrendingUp },
                    { id: 'ARBITRAGE', label: 'Arbitrage Scanner', icon: ArrowRightLeft },
                    { id: 'IMPLIED', label: 'Implied Prob', icon: Percent },
                    { id: 'CONVERTER', label: 'Odds Converter', icon: Zap },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest font-black transition-all duration-300 ${
                            activeTab === tab.id 
                            ? 'bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/50 shadow-[0_0_15px_rgba(23,241,209,0.2)]' 
                            : 'glass-panel text-stratos-muted border border-stratos-border hover:border-stratos-accent/30 hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'KELLY' && (
                        <motion.div
                            key="kelly"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-3">
                                    <Target className="text-stratos-accent" />
                                    Kelly Criterion
                                </h2>
                                <p className="text-stratos-muted text-xs mb-8">Optimal bet sizing mathematical formula to maximize bankroll growth over time.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Decimal Odds</label>
                                        <input 
                                            type="number" 
                                            value={kOdds} 
                                            onChange={e => setKOdds(Number(e.target.value))} 
                                            step="0.01" min="1.01"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">True Win Probability (%)</label>
                                        <input 
                                            type="number" 
                                            value={kProb} 
                                            onChange={e => setKProb(Number(e.target.value))} 
                                            step="1" min="0" max="100"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Kelly Multiplier (Fraction)</label>
                                        <select 
                                            value={kFraction} 
                                            onChange={e => setKFraction(Number(e.target.value))}
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono outline-none"
                                        >
                                            <option value={1}>Full Kelly (Aggressive)</option>
                                            <option value={0.5}>Half Kelly (Moderate)</option>
                                            <option value={0.25}>Quarter Kelly (Conservative)</option>
                                            <option value={0.1}>Eighth Kelly (Very Conservative)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            

                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <div className="text-center space-y-8">
                                    <div>
                                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-2">Suggested Stake</div>
                                        <div className={`text-6xl font-black ${kellyPct > 0 ? 'text-stratos-accent drop-shadow-[0_0_15px_rgba(23,241,209,0.5)]' : 'text-rose-500 max-w-[80%] mx-auto text-4xl'}`}>
                                            {kellyPct > 0 ? formatCurrency(Math.floor(kellyStake), currency) : 'DO NOT BET'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">Bankroll %</div>
                                            <div className="text-xl text-white font-bold">{kellyPct.toFixed(2)}%</div>
                                        </div>
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">Expected ROI</div>
                                            <div className={`text-xl font-bold ${kEV > 0 ? 'text-stratos-accent' : 'text-rose-500'}`}>
                                                {(kEV * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    {kEV <= 0 && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
                                            Negative Expected Value. The odds do not compensate for the risk.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                        </motion.div>
                    )}

                    {activeTab === 'EV' && (
                        <motion.div
                            key="ev"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-3">
                                    <TrendingUp className="text-stratos-accent" />
                                    Expected Value (EV)
                                </h2>
                                <p className="text-stratos-muted text-xs mb-8">Calculate the long-term mathematical expected profit or loss of a bet.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Decimal Odds</label>
                                        <input 
                                            type="number" 
                                            value={eOdds} 
                                            onChange={e => setEOdds(Number(e.target.value))} 
                                            step="0.01" min="1.01"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">True Win Probability (%)</label>
                                        <input 
                                            type="number" 
                                            value={eProb} 
                                            onChange={e => setEProb(Number(e.target.value))} 
                                            step="1" min="0" max="100"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Stake Amount</label>
                                        <input 
                                            type="number" 
                                            value={eStake} 
                                            onChange={e => setEStake(Number(e.target.value))} 
                                            step="1" min="1"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                            

                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <div className="text-center space-y-8">
                                    <div>
                                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-2">Expected Value</div>
                                        <div className={`text-6xl font-black ${evAmt > 0 ? 'text-stratos-accent drop-shadow-[0_0_15px_rgba(23,241,209,0.5)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}>
                                            {evAmt > 0 ? '+' : ''}{formatCurrency(evAmt, currency)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">EV ROI %</div>
                                            <div className={`text-xl font-bold ${evPct > 0 ? 'text-stratos-accent' : 'text-rose-500'}`}>
                                                {evPct > 0 ? '+' : ''}{evPct.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">Implied Odds Prob.</div>
                                            <div className="text-xl text-white font-bold">{((1/eOdds)*100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </motion.div>
                    )}

                    {activeTab === 'ARBITRAGE' && (
                        <motion.div
                            key="arbitrage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-3">
                                    <ArrowRightLeft className="text-stratos-accent" />
                                    Arbitrage Calculator
                                </h2>
                                <p className="text-stratos-muted text-xs mb-8">Calculate guaranteed profit by betting on all possible outcomes across different bookmakers.</p>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Outcome 1 Odds</label>
                                            <input 
                                                type="number" 
                                                value={aOdds1} 
                                                onChange={e => setAOdds1(Number(e.target.value))} 
                                                step="0.01" min="1.01"
                                                className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Outcome 2 Odds</label>
                                            <input 
                                                type="number" 
                                                value={aOdds2} 
                                                onChange={e => setAOdds2(Number(e.target.value))} 
                                                step="0.01" min="1.01"
                                                className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Total Stake (All bets combined)</label>
                                        <input 
                                            type="number" 
                                            value={aTotalStake} 
                                            onChange={e => setATotalStake(Number(e.target.value))} 
                                            step="10" min="1"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                            

                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <div className="text-center space-y-8">
                                    <div>
                                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-2">Guaranteed Profit</div>
                                        <div className={`text-6xl font-black ${isArbitrage ? 'text-stratos-accent drop-shadow-[0_0_15px_rgba(23,241,209,0.5)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] text-4xl'}`}>
                                            {isArbitrage ? `+${formatCurrency(aProfit, currency)}` : 'NO ARBITRAGE'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className={`p-4 rounded-xl border ${isArbitrage ? 'bg-stratos-accent/10 border-stratos-accent/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Bet 1 Stake</div>
                                            <div className="text-xl text-white font-bold">{formatCurrency(aStake1, currency)}</div>
                                            <div className="text-xs text-stratos-muted mt-1">Pays: {formatCurrency(aStake1 * aOdds1, currency)}</div>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${isArbitrage ? 'bg-stratos-accent/10 border-stratos-accent/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Bet 2 Stake</div>
                                            <div className="text-xl text-white font-bold">{formatCurrency(aStake2, currency)}</div>
                                            <div className="text-xs text-stratos-muted mt-1">Pays: {formatCurrency(aStake2 * aOdds2, currency)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">Arbitrage ROI</div>
                                            <div className={`text-xl font-bold ${isArbitrage ? 'text-stratos-accent' : 'text-rose-500'}`}>
                                                {aRoi.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl">
                                            <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-1">Market Margin</div>
                                            <div className={`text-xl font-bold ${isArbitrage ? 'text-stratos-accent' : 'text-rose-500'}`}>
                                                {aMargin.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </motion.div>
                    )}

                    {activeTab === 'IMPLIED' && (
                        <motion.div
                            key="implied"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-3">
                                    <Percent className="text-stratos-accent" />
                                    Implied Probability
                                </h2>
                                <p className="text-stratos-muted text-xs mb-8">Convert bookmaker odds into their implied percentage probability of winning without margin factored in.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Decimal Odds</label>
                                        <input 
                                            type="number" 
                                            value={iOdds} 
                                            onChange={e => setIOdds(Number(e.target.value))} 
                                            step="0.01" min="1.01"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono text-2xl font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                            

                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center h-full">
                                <div className="text-center space-y-8">
                                    <div>
                                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-2">Implied Probability</div>
                                        <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                            {impliedProb.toFixed(1)}%
                                        </div>
                                        <p className="text-stratos-muted text-[10px] font-mono mt-4">
                                            If your true calculated probability is higher than {impliedProb.toFixed(1)}%, this is a Value Bet (+EV).
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                        </motion.div>
                    )}

                    {activeTab === 'CONVERTER' && (
                        <motion.div
                            key="converter"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm h-full shadow-[0_0_30px_rgba(23,241,209,0.05)] border-t-stratos-accent/20">
                                <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-3">
                                    <Zap className="text-stratos-accent" />
                                    Odds Converter
                                </h2>
                                <p className="text-stratos-muted text-xs mb-8">Convert between Decimal, American, and Fractional odds, and view the implied probability.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Decimal Odds (European)</label>
                                        <input 
                                            type="number" 
                                            value={cDecimal} 
                                            onChange={e => handleDecimalChange(Number(e.target.value))} 
                                            step="0.01" min="1.01"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono text-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">American Odds (US)</label>
                                        <input 
                                            type="number" 
                                            value={cAmerican} 
                                            onChange={e => handleAmericanChange(Number(e.target.value))} 
                                            step="1"
                                            className="w-full glass-panel border border-stratos-border rounded-xl p-3 text-white font-mono text-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-stratos-muted uppercase tracking-widest mb-2">Fractional Odds (UK)</label>
                                        <input 
                                            type="text" 
                                            disabled
                                            value={cFractional} 
                                            className="w-full glass-panel border border-stratos-border/50 rounded-xl p-3 text-stratos-muted font-mono text-xl"
                                        />
                                        <p className="text-[9px] text-stratos-muted mt-2 font-mono">(Approximate fraction shown)</p>
                                    </div>
                                </div>
                            </div>
                            

                            
                            <div className="glass-panel border border-stratos-border p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center h-full">
                                <div className="text-center space-y-8">
                                    <div>
                                        <div className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-2">Implied Probability</div>
                                        <div className="text-6xl font-black text-stratos-accent drop-shadow-[0_0_15px_rgba(23,241,209,0.3)]">
                                            {cDecimal > 0 ? ((1 / cDecimal) * 100).toFixed(2) : 0}%
                                        </div>
                                    </div>
                                    <div className="glass-panel border border-stratos-border/50 p-4 rounded-xl text-left">
                                        <p className="text-stratos-muted text-[10px] font-mono leading-relaxed">
                                            <strong className="text-white">American:</strong> If positive (+150), it shows profit on a $100 bet. If negative (-150), it shows amount needed to win $100.
                                            <br /><br />
                                            <strong className="text-white">Decimal:</strong> Shows total return (profit + stake) for every $1 wagered.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
