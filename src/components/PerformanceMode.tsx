import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart, History, Zap, ShieldCheck, Activity, Brain, Download, Lightbulb, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis, BarChart, Bar } from 'recharts';
import { analyzePatterns } from '../lib/inference';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore';
import { formatCurrency } from '../lib/utils';
import { useUserStore } from '../stores/userStore';
import { useForecastStore } from '../stores/forecastStore';
import { useUIStore } from '../stores/uiStore';


export const PerformanceMode = React.memo(function PerformanceMode() {
    const { user, bankroll, currency } = useUserStore();
    const { forecasts, clearHistory } = useForecastStore();
    const { showToast } = useUIStore();
    const [bankrollHistory, setBankrollHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'bankroll_history'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    name: d.timestamp?.toDate()?.toLocaleDateString([], { month: 'short', day: 'numeric' }) || 'Just now',
                    value: d.amount,
                    timestamp: d.timestamp?.toDate()
                };
            });
            setBankrollHistory(history);
        }, (error) => {
            console.error("Error fetching bankroll history:", error);
        });

        return () => unsubscribe();
    }, []);
    
    const handleExport = () => {
        if (forecasts.length === 0) {
            showToast("No forecasts to export", "error");
            return;
        }
        
        const headers = ['Date', 'Match', 'League', 'Forecast', 'Confidence', 'Stake', 'Result', 'Profit'];
        const csvContent = [
            headers.join(','),
            ...forecasts.map(p => {
                const date = new Date(p.game.commence_time).toLocaleDateString();
                const match = `${p.game.home} vs ${p.game.away}`;
                const profit = p.profit !== undefined ? p.profit : (p.actual === 'WON' ? (p.stake || 0) : p.actual === 'LOST' ? -(p.stake || 0) : 0);
                return `"${date}","${match}","${p.game.league}","${p.bestBet}",${p.confidence},${p.stake || 0},"${p.actual || 'PENDING'}",${profit}`;
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sparta_performance_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Performance data exported successfully", "success");
    };
    
    const { avgConfidence, totalStake, realizedProfit, winRate, resolvedCount, winProbDist, roi, yieldRate, leagueStats, confidenceAccuracyData, profitByConf, maxDrawdown, currentStreak, streakType, profitFactor } = useMemo(() => {
        if (forecasts.length === 0) {
            return {
                avgConfidence: 74,
                totalStake: 0,
                realizedProfit: 0,
                winRate: 0,
                resolvedCount: 0,
                winProbDist: [40, 65, 30, 85, 45, 90, 55, 70, 35, 60],
                roi: 12.4,
                yieldRate: 8.2,
                leagueStats: [],
                confidenceAccuracyData: [
                    { confidence: 60, accuracy: 55 },
                    { confidence: 70, accuracy: 68 },
                    { confidence: 80, accuracy: 75 },
                    { confidence: 90, accuracy: 88 }
                ],
                maxDrawdown: 4.2,
                currentStreak: 0,
                streakType: null as 'WON' | 'LOST' | null,
                profitFactor: 1.5
            };
        }

        const avgConf = forecasts.reduce((acc, p) => acc + p.confidence, 0) / forecasts.length;
        const tStake = forecasts.reduce((acc, p) => acc + (p.stake || 0), 0);
        
        let rProfit = 0;
        let resolvedCount = 0;
        let wonCount = 0;
        let resolvedStake = 0;
        const leagueMap: Record<string, { won: number, total: number }> = {};
        const confBuckets: Record<number, { won: number, total: number }> = {};

        let maxDrawdown = 0;
        let peak = bankroll;
        let currentBankroll = bankroll;

        let currentStreak = 0;
        let streakType: 'WON' | 'LOST' | null = null;

        // Calculate streak (forecasts are newest first)
        for (let i = 0; i < forecasts.length; i++) {
            const p = forecasts[i];
            if (p.actual === 'WON' || p.actual === 'LOST') {
                if (streakType === null) {
                    streakType = p.actual;
                    currentStreak = 1;
                } else if (streakType === p.actual) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        let grossProfit = 0;
        let grossLoss = 0;

        forecasts.forEach(p => {
            if (p.actual === 'WON' || p.actual === 'LOST') {
                const profit = p.profit !== undefined ? p.profit : (p.actual === 'WON' ? (p.stake || 0) : -(p.stake || 0));
                rProfit += profit;
                if (profit > 0) {
                    grossProfit += profit;
                } else if (profit < 0) {
                    grossLoss += Math.abs(profit);
                }
                
                resolvedCount++;
                resolvedStake += (p.stake || 0);
                if (p.actual === 'WON') wonCount++;

                currentBankroll += profit;
                if (currentBankroll > peak) {
                    peak = currentBankroll;
                }
                const drawdown = ((peak - currentBankroll) / peak) * 100;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }

                const league = p.game.league || 'Other';
                if (!leagueMap[league]) leagueMap[league] = { won: 0, total: 0 };
                leagueMap[league].total++;
                if (p.actual === 'WON') leagueMap[league].won++;

                const bucket = Math.floor(p.confidence / 10) * 10;
                if (!confBuckets[bucket]) confBuckets[bucket] = { won: 0, total: 0 };
                confBuckets[bucket].total++;
                if (p.actual === 'WON') confBuckets[bucket].won++;
            }
        });

        const winRate = resolvedCount > 0 ? (wonCount / resolvedCount) * 100 : 0;
        const roi = resolvedStake > 0 ? (rProfit / resolvedStake) * 100 : 0;
        const yieldRate = resolvedStake > 0 ? (rProfit / resolvedStake) * 100 : 0;

        const dist = new Array(10).fill(0);
        forecasts.forEach(p => {
            const bucket = Math.min(Math.floor(p.confidence / 10), 9);
            dist[bucket]++;
        });
        const maxDist = Math.max(...dist, 1);
        const normalizedDist = dist.map(d => (d / maxDist) * 100);

        const sortedLeagues = Object.entries(leagueMap)
            .map(([name, stats]) => ({ name, winRate: (stats.won / stats.total) * 100, total: stats.total }))
            .sort((a, b) => b.winRate - a.winRate)
            .slice(0, 3);

        const confAccData = Object.entries(confBuckets)
            .map(([conf, stats]) => ({ confidence: parseInt(conf), accuracy: (stats.won / stats.total) * 100 }))
            .sort((a, b) => a.confidence - b.confidence);

        const profitByConf = Object.entries(confBuckets)
            .map(([conf, stats]) => {
                const bucketForecasts = forecasts.filter(p => Math.floor(p.confidence / 10) * 10 === parseInt(conf));
                const profit = bucketForecasts.reduce((acc, p) => acc + (p.profit || 0), 0);
                return { confidence: `${conf}%`, profit };
            })
            .sort((a, b) => parseInt(a.confidence) - parseInt(b.confidence));
            
        const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;

        return {
            avgConfidence: Math.round(avgConf),
            totalStake: tStake,
            realizedProfit: rProfit,
            winRate: Math.round(winRate),
            resolvedCount,
            winProbDist: normalizedDist.some(d => d > 0) ? normalizedDist : [40, 65, 30, 85, 45, 90, 55, 70, 35, 60],
            roi,
            yieldRate,
            leagueStats: sortedLeagues,
            confidenceAccuracyData: confAccData.length > 0 ? confAccData : [
                { confidence: 60, accuracy: 55 },
                { confidence: 70, accuracy: 68 },
                { confidence: 80, accuracy: 75 },
                { confidence: 90, accuracy: 88 }
            ],
            profitByConf: profitByConf.length > 0 ? profitByConf : [
                { confidence: '60%', profit: 120 },
                { confidence: '70%', profit: 450 },
                { confidence: '80%', profit: 890 },
                { confidence: '90%', profit: 1200 }
            ],
            maxDrawdown,
            currentStreak,
            streakType,
            profitFactor
        };
    }, [forecasts, bankroll]);

    const chartData = useMemo(() => {
        if (bankrollHistory.length > 0) {
            return bankrollHistory;
        }

        if (forecasts.length === 0) {
            return [
                { name: 'Mon', value: bankroll * 0.85 },
                { name: 'Tue', value: bankroll * 0.92 },
                { name: 'Wed', value: bankroll * 0.88 },
                { name: 'Thu', value: bankroll * 1.05 },
                { name: 'Fri', value: bankroll * 0.98 },
                { name: 'Sat', value: bankroll * 1.15 },
                { name: 'Sun', value: bankroll },
            ];
        }

        const resolved = [...forecasts].filter(p => p.actual === 'WON' || p.actual === 'LOST').reverse();
        
        if (resolved.length === 0) {
            return [{ name: 'Start', value: bankroll }];
        }

        let currentBankroll = bankroll - resolved.reduce((acc, p) => acc + (p.profit || 0), 0);
        const data = [{ name: 'Start', value: currentBankroll }];

        resolved.forEach((p, i) => {
            currentBankroll += (p.profit || 0);
            data.push({ name: `Bet ${i + 1}`, value: currentBankroll });
        });

        return data;
    }, [forecasts, bankroll]);

    const kellyChartData = useMemo(() => {
        const data = [];
        // Assume average odds of 2.0 (decimal) -> b = 1
        const b = 1;
        for (let p = 0.40; p <= 0.80; p += 0.02) {
            // f* = p - (1-p)/b
            const f = Math.max(0, p - (1 - p) / b);
            data.push({
                probability: Math.round(p * 100),
                kellyFraction: Number((f * 100).toFixed(1)),
                halfKelly: Number(((f / 2) * 100).toFixed(1))
            });
        }
        return data;
    }, []);

    const patterns = useMemo(() => analyzePatterns(forecasts), [forecasts]);

        const stats = [
        { label: 'Avg. Confidence', value: `${avgConfidence}%`, icon: Target, color: 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]', bg: 'bg-stratos-accent/10 border-stratos-accent/20' },
        { label: 'Realized Profit', value: `${realizedProfit >= 0 ? '+' : ''}${formatCurrency(Math.abs(realizedProfit), currency)}`, icon: TrendingUp, color: realizedProfit >= 0 ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]', bg: realizedProfit >= 0 ? 'bg-stratos-accent/10 border-stratos-accent/20' : 'bg-rose-500/10 border-rose-500/20' },
        { label: 'Win Rate', value: `${winRate}%`, icon: ShieldCheck, color: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]', bg: 'bg-amber-500/10 border-amber-500/20' },
        { label: 'ROI / Yield', value: `${roi.toFixed(1)}%`, icon: BarChart3, color: 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
        { label: 'Max Drawdown', value: `${maxDrawdown.toFixed(1)}%`, icon: TrendingDown, color: 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]', bg: 'bg-rose-500/10 border-rose-500/20' },
        { label: 'Current Streak', value: `${currentStreak}${streakType === 'WON' ? 'W' : streakType === 'LOST' ? 'L' : ''}`, icon: Activity, color: streakType === 'WON' ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : streakType === 'LOST' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-stratos-muted', bg: streakType === 'WON' ? 'bg-stratos-accent/10 border-stratos-accent/20' : streakType === 'LOST' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-stratos-muted/10 border-stratos-border/20' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-700 relative z-10">
            {/* Performance Mode Header */}
            <div className="flex items-center justify-between glass-panel border border-stratos-border/50 p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 tech-grid opacity-30"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-stratos-accent/5 blur-[80px] pointer-events-none rounded-full"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-stratos-accent/10 flex items-center justify-center border border-stratos-accent/30 shadow-[inset_0_0_15px_rgba(23,241,209,0.1)]">
                        <Activity className="w-6 h-6 text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white tracking-[0.1em] uppercase">PERFORMANCE ANALYTICS</h1>
                        <p className="text-[10px] text-stratos-muted font-mono uppercase tracking-[0.2em] mt-1 font-bold">Track your betting history and ROI</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 relative z-10">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-stratos-border text-[10px] font-mono text-white hover:border-stratos-accent/50 hover:bg-stratos-accent/10 transition-colors uppercase tracking-widest font-bold shadow-inner"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button 
                        onClick={async () => {
                            if (user && window.confirm('Are you sure you want to clear your betting history?')) {
                                clearHistory(user.uid);
                                const q = query(collection(db, 'bankroll_history'), where('userId', '==', user.uid));
                                const querySnapshot = await getDocs(q);
                                querySnapshot.forEach(async (docSnap) => {
                                    await deleteDoc(docSnap.ref);
                                });
                                showToast("History cleared successfully", "success");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors uppercase tracking-widest font-bold shadow-inner"
                    >
                        <History className="w-4 h-4" />
                        Clear History
                    </button>
                </div>
            </div>

            {/* TOP STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-8 rounded-3xl border border-stratos-border/50 flex flex-col gap-6 relative overflow-hidden group/stat hover:border-stratos-accent/30 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(23,241,209,0.1)] hover:-translate-y-1 backdrop-blur-md h-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/stat:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg.split(' ')[0]} blur-[50px] -mr-16 -mt-16 transition-all duration-700 group-hover/stat:scale-150 group-hover/stat:opacity-70 opacity-30`}></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border shadow-inner`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-3xl font-mono font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">{stat.label}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Activity className={`w-3 h-3 ${stat.color.split(' ')[0]} animate-pulse`} />
                                <span className="text-[8px] text-stratos-muted font-mono uppercase tracking-[0.2em] font-bold">Live Algorithmic Tracking</span>
                            </div>
                        </div>
                    </motion.div>
                    
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total ROI', value: `${roi.toFixed(1)}%`, icon: TrendingUp, color: roi >= 0 ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]', bg: roi >= 0 ? 'bg-stratos-accent/10 border-stratos-accent/20' : 'bg-rose-500/10 border-rose-500/20' },
                    { label: 'Yield Rate', value: `${yieldRate.toFixed(1)}%`, icon: Zap, color: yieldRate >= 0 ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]', bg: yieldRate >= 0 ? 'bg-stratos-accent/10 border-stratos-accent/20' : 'bg-rose-500/10 border-rose-500/20' },
                    { label: 'Max Drawdown', value: `${maxDrawdown.toFixed(1)}%`, icon: TrendingDown, color: 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]', bg: 'bg-rose-500/10 border-rose-500/20' },
                    { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2), icon: BarChart3, color: 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]', bg: 'bg-stratos-accent/10 border-stratos-accent/20' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-3xl border border-stratos-border/50 shadow-inner flex items-center gap-4 group hover:border-stratos-accent/30 hover:bg-stratos-accent/5 transition-all h-full"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center border group-hover:scale-110 transition-transform shadow-inner`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">{stat.label}</p>
                            <p className={`text-xl font-display font-bold ${stat.color} mt-1`}>{stat.value}</p>
                        </div>
                    </motion.div>
                    
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MAIN CHART AREA */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-8 rounded-[2rem] border border-stratos-border/50 h-[450px] flex flex-col relative overflow-hidden group/chart1 hover:border-stratos-accent/30 transition-all duration-500 shadow-xl backdrop-blur-md"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/chart1:animate-[shimmer_3s_infinite] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-full tech-grid opacity-30 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/chart1:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-white font-display font-bold text-lg flex items-center gap-3 tracking-[0.1em] uppercase">
                                    <TrendingUp className="w-5 h-5 text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]" />
                                    Bankroll Performance
                                </h3>
                                <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mt-1 font-bold">Quantitative equity curve analysis</p>
                            </div>
                            <div className="flex gap-2">
                                {['1D', '1W', '1M', 'ALL'].map(t => (
                                    <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${t === '1W' ? 'bg-stratos-accent/20 text-stratos-accent border border-stratos-accent/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#17f1d1" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#17f1d1" stopOpacity={0.05}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#ffffff40" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        dy={10}
                                        fontFamily="JetBrains Mono"
                                    />
                                    <YAxis 
                                        stroke="#ffffff40" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => formatCurrency(val, currency)}
                                        fontFamily="JetBrains Mono"
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', fontSize: '12px', fontFamily: 'JetBrains Mono', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#17f1d1', fontWeight: 'bold' }}
                                        cursor={{ stroke: '#17f1d1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#17f1d1" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                        animationDuration={2000}
                                        activeDot={{ r: 6, fill: '#17f1d1', stroke: '#000', strokeWidth: 2 }}
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(23,241,209,0.5))' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 h-[300px] flex flex-col relative overflow-hidden group/chart2 hover:border-stratos-accent/30 transition-all duration-500 shadow-xl backdrop-blur-md"
                            >
                                <div className="absolute inset-0 tech-grid opacity-30"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/chart2:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/chart2:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest opacity-80 flex items-center gap-2 relative z-10">
                                    <Brain className="w-4 h-4 text-stratos-accent" />
                                    Profit by Confidence
                                </h4>
                                <div className="flex-1 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={profitByConf}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="confidence" stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} />
                                            <YAxis stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} tickFormatter={(val) => formatCurrency(val, currency)} />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(23,241,209,0.05)' }}
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(23,241,209,0.2)', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono', backdropFilter: 'blur(10px)' }}
                                            />
                                            <Bar dataKey="profit" fill="#17F1D1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 flex flex-col relative overflow-hidden group/chart3 hover:border-stratos-accent/30 transition-all duration-500 shadow-xl backdrop-blur-md"
                        >
                            <div className="absolute inset-0 tech-grid opacity-30"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/chart3:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/chart3:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest opacity-80 flex items-center gap-2 relative z-10">
                                <PieChart className="w-4 h-4 text-stratos-accent" />
                                League Dominance
                            </h4>
                            <div className="space-y-5 flex-1 flex flex-col justify-center relative z-10">
                                {leagueStats.length > 0 ? leagueStats.map((l, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">{l.name}</span>
                                            <span className="text-[10px] font-mono text-stratos-accent font-bold">{Math.round(l.winRate)}% WR</span>
                                        </div>
                                        <div className="w-full h-1.5 glass-panel shadow-inner rounded-full overflow-hidden border border-stratos-border/30">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${l.winRate}%` }}
                                                transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                                                className="h-full bg-stratos-accent shadow-[0_0_10px_rgba(23,241,209,0.5)]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold text-center py-10">No league data available yet.</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 h-[300px] flex flex-col relative overflow-hidden group/chart4 hover:border-stratos-accent/30 transition-all duration-500 shadow-xl backdrop-blur-md"
                        >
                            <div className="absolute inset-0 tech-grid opacity-30"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/chart4:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/chart4:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest opacity-80 flex items-center gap-2 relative z-10">
                                <Target className="w-4 h-4 text-stratos-accent" />
                                Kelly Criterion
                            </h4>
                            <div className="flex-1 w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={kellyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="probability" stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                        <YAxis stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(23,241,209,0.2)', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono', backdropFilter: 'blur(10px)' }}
                                            itemStyle={{ color: '#17F1D1' }}
                                        />
                                        <Line type="monotone" dataKey="kellyFraction" stroke="#17F1D1" strokeWidth={2} dot={false} name="Full Kelly" style={{ filter: 'drop-shadow(0 0 4px rgba(23,241,209,0.5))' }} />
                                        <Line type="monotone" dataKey="halfKelly" stroke="#3b82f6" strokeWidth={2} dot={false} name="Half Kelly" strokeDasharray="5 5" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>



                    {/* PATTERN RECOGNITION SECTION */}
                    <AnimatePresence>
                        {patterns.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 px-2">
                                    <Brain className="w-5 h-5 text-stratos-accent" />
                                    <h3 className="text-white font-display font-bold text-lg tracking-[0.1em] uppercase">Algorithmic Pattern Recognition</h3>
                                    <span className="text-[10px] font-mono text-stratos-accent uppercase tracking-widest bg-stratos-accent/10 px-2 py-1 rounded-md border border-stratos-accent/30 shadow-[inset_0_0_10px_rgba(23,241,209,0.1)]">Quantitative Inference Active</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {patterns.map((pattern, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="glass-panel p-6 rounded-3xl border border-stratos-border/50 relative overflow-hidden group/pattern hover:border-stratos-accent/30 hover:bg-stratos-accent/5 transition-all duration-500 shadow-inner"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/pattern:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl border shadow-inner ${pattern.winRate > 60 ? 'bg-stratos-accent/10 text-stratos-accent border-stratos-accent/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                                                        {pattern.winRate > 60 ? <Zap className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm tracking-tight">{pattern.key}</h4>
                                                        <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">{pattern.type.replace('_', ' ')} Analysis</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-lg font-mono font-black ${pattern.winRate > 60 ? 'text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}>{Math.round(pattern.winRate)}%</span>
                                                    <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Accuracy</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-stratos-muted font-mono leading-relaxed relative z-10 mb-4 glass-panel p-3 rounded-xl border border-stratos-border/30">
                                                {pattern.description}
                                            </p>
                                            <div className="flex items-center gap-4 relative z-10 glass-panel p-3 rounded-xl border border-stratos-border/30 shadow-inner">
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Sample Size</span>
                                                    <span className="text-xs font-mono text-white font-bold">{pattern.total} Matches</span>
                                                </div>
                                                <div className="w-[1px] h-8 bg-stratos-border/50"></div>
                                                <div className="flex flex-col flex-1 text-right">
                                                    <span className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Net Profit</span>
                                                    <span className={`text-xs font-mono font-bold ${pattern.profit >= 0 ? 'text-stratos-accent' : 'text-rose-400'}`}>
                                                        {pattern.profit >= 0 ? '+' : ''}{formatCurrency(Math.abs(pattern.profit), currency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SIDEBAR: ACTIVITY & LOGS */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-panel p-8 rounded-[2rem] border border-stratos-border/50 relative overflow-hidden group/log hover:border-stratos-accent/30 transition-all duration-500 shadow-xl backdrop-blur-md"
                    >
                        <div className="absolute inset-0 tech-grid opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/log:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/log:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-white font-display font-bold text-lg flex items-center gap-3 tracking-[0.1em] uppercase">
                                <History className="w-5 h-5 text-stratos-accent drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]" />
                                Execution Ledger
                            </h3>
                            <button 
                                aria-label="Export performance data to CSV"
                                onClick={handleExport}
                                disabled={forecasts.length === 0}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel border border-stratos-border text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-stratos-muted hover:text-stratos-accent hover:border-stratos-accent/50 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-3 h-3" />
                                Export
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            <AnimatePresence>
                            {forecasts.map((pred, idx) => (
                                <motion.div 
                                    key={pred.id || idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-5 rounded-2xl glass-panel border border-stratos-border/50 space-y-3 hover:border-stratos-accent/30 transition-colors shadow-inner"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-stratos-muted tracking-[0.2em] uppercase font-bold">{new Date(pred.game.commence_time).toLocaleDateString()}</span>
                                        {pred.actual === 'WON' ? (
                                            <span className="text-[9px] font-mono font-bold text-stratos-accent bg-stratos-accent/10 px-2 py-1 rounded border border-stratos-accent/20 tracking-[0.2em]">SUCCESS</span>
                                        ) : pred.actual === 'LOST' ? (
                                            <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/20 tracking-[0.2em]">FAILED</span>
                                        ) : (
                                            <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-400/10 px-2 py-1 rounded border border-sky-400/20 tracking-[0.2em]">PENDING</span>
                                        )}
                                    </div>
                                    {pred.isAccumulator ? (
                                        <p className="text-sm text-white font-bold leading-tight tracking-tight">{pred.game.home} <span className="text-stratos-muted font-normal italic text-xs mx-1">ACCUMULATOR</span></p>
                                    ) : (
                                        <p className="text-sm text-white font-bold leading-tight tracking-tight">{pred.game.home} <span className="text-stratos-muted font-normal italic text-xs mx-1">vs</span> {pred.game.away}</p>
                                    )}
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-stratos-accent font-bold bg-stratos-accent/10 px-2 py-0.5 rounded border border-stratos-accent/20 tracking-wider">
                                            {pred.isAccumulator ? 'ACCUMULATOR' : pred.bestBet}
                                        </span>
                                        <div className="flex gap-3 text-stratos-muted font-bold tracking-widest">
                                            <span className="text-stratos-accent/80">{pred.confidence}% C</span>
                                            {pred.modelUncertainty !== undefined && (
                                                <span className="text-stratos-muted/80">{pred.modelUncertainty}% U</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            {forecasts.length === 0 && (
                                <div className="text-center py-20 glass-panel rounded-2xl border border-stratos-border/50 shadow-inner">
                                    <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center mx-auto border border-stratos-border relative z-10 mb-4 hover:border-stratos-accent/50 transition-colors">
                                        <Activity className="w-6 h-6 text-stratos-muted animate-pulse" />
                                    </div>
                                    <p className="text-stratos-muted text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Awaiting Data Ingestion</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-panel p-8 rounded-[2rem] border border-stratos-accent/20 shadow-[inset_0_0_20px_rgba(23,241,209,0.05),0_0_20px_rgba(23,241,209,0.1)] relative overflow-hidden group/core backdrop-blur-md"
                    >
                        <div className="absolute inset-0 tech-grid opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/10 to-transparent -translate-x-full group-hover/core:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-stratos-accent animate-pulse shadow-[0_0_10px_rgba(23,241,209,0.8)]"></div>
                            <span className="text-[10px] font-mono text-stratos-accent uppercase tracking-[0.2em] font-bold">SPARTA Core Active</span>
                        </div>
                        <p className="text-[10px] text-stratos-muted font-mono leading-relaxed mb-6 relative z-10 uppercase tracking-widest font-bold glass-panel p-4 rounded-xl border border-stratos-border/50 shadow-inner">
                            Neural network ensemble currently processing historical match vectors. Real-time calibration active.
                        </p>
                        {clearHistory && (
                            <button 
                                aria-label="Purge all system data and history"
                                onClick={async () => {
                                    if (user && window.confirm('Are you sure you want to purge all system data and history? This cannot be undone.')) {
                                        clearHistory(user.uid);
                                        const q = query(collection(db, 'bankroll_history'), where('userId', '==', user.uid));
                                        const querySnapshot = await getDocs(q);
                                        querySnapshot.forEach(async (docSnap) => {
                                            await deleteDoc(docSnap.ref);
                                        });
                                        showToast("System history purged", "success");
                                    }
                                }}
                                className="w-full py-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:border-rose-500/50 relative z-10 shadow-inner"
                            >
                                Purge System Data
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
});

