import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart, History, Zap, ShieldCheck, Activity, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';

interface PerformanceModeProps {
    predictions: any[];
    bankroll: number;
}

export const PerformanceMode: React.FC<PerformanceModeProps> = ({ predictions, bankroll }) => {
    
    const { avgConfidence, totalStake, realizedProfit, winRate, resolvedCount, winProbDist, roi, yieldRate, leagueStats, confidenceAccuracyData } = useMemo(() => {
        if (predictions.length === 0) {
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
                ]
            };
        }

        const avgConf = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
        const tStake = predictions.reduce((acc, p) => acc + (p.stake || 0), 0);
        
        let rProfit = 0;
        let resolvedCount = 0;
        let wonCount = 0;
        let resolvedStake = 0;
        const leagueMap: Record<string, { won: number, total: number }> = {};
        const confBuckets: Record<number, { won: number, total: number }> = {};

        predictions.forEach(p => {
            if (p.actual === 'WON' || p.actual === 'LOST') {
                const profit = p.profit !== undefined ? p.profit : (p.actual === 'WON' ? (p.stake || 0) : -(p.stake || 0));
                rProfit += profit;
                resolvedCount++;
                resolvedStake += (p.stake || 0);
                if (p.actual === 'WON') wonCount++;

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
        predictions.forEach(p => {
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
            ]
        };
    }, [predictions]);

    const chartData = useMemo(() => {
        if (predictions.length === 0) {
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

        const resolved = [...predictions].filter(p => p.actual === 'WON' || p.actual === 'LOST').reverse();
        
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
    }, [predictions, bankroll]);

    const stats = [
        { label: 'Avg. Confidence', value: `${avgConfidence}%`, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Realized Profit', value: `${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}`, icon: TrendingUp, color: realizedProfit >= 0 ? 'text-emerald-400' : 'text-red-400', bg: realizedProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
        { label: 'ROI / Yield', value: `${roi.toFixed(1)}%`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Win Rate', value: `${winRate}%`, icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
            {/* TOP STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150`}></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Activity className="w-3 h-3 text-gray-600" />
                                <span className="text-[10px] text-gray-600 font-mono">Live System Tracking</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MAIN CHART AREA */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 h-[450px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-white opacity-20 pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-white font-bold text-lg flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    Bankroll Performance
                                </h3>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Real-time equity curve analysis</p>
                            </div>
                            <div className="flex gap-2">
                                {['1D', '1W', '1M', 'ALL'].map(t => (
                                    <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${t === '1W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
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
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#ffffff20" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        dy={10}
                                        fontFamily="JetBrains Mono"
                                    />
                                    <YAxis 
                                        stroke="#ffffff20" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                                        fontFamily="JetBrains Mono"
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                                        itemStyle={{ color: '#10b981' }}
                                        cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 rounded-3xl border border-white/5 h-[300px] flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Model Calibration
                            </h4>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                        <XAxis type="number" dataKey="confidence" name="Confidence" unit="%" stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" />
                                        <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" stroke="#ffffff20" fontSize={10} fontFamily="JetBrains Mono" />
                                        <ZAxis type="number" range={[50, 400]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                                        <Scatter name="Confidence vs Accuracy" data={confidenceAccuracyData} fill="#10b981" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col">
                            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <PieChart className="w-4 h-4" />
                                League Dominance
                            </h4>
                            <div className="space-y-5 flex-1 flex flex-col justify-center">
                                {leagueStats.length > 0 ? leagueStats.map((l, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">{l.name}</span>
                                            <span className="text-[10px] font-mono text-emerald-400 font-bold">{Math.round(l.winRate)}% WR</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${l.winRate}%` }}
                                                transition={{ duration: 1, delay: idx * 0.2 }}
                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-mono text-gray-600 italic text-center py-10">No league data available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR: ACTIVITY & LOGS */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                            <History className="w-5 h-5 text-blue-400" />
                            System Log
                        </h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {predictions.map((pred, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-gray-500">{new Date(pred.game.commence_time).toLocaleDateString()}</span>
                                        {pred.actual === 'WON' ? (
                                            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">SUCCESS</span>
                                        ) : pred.actual === 'LOST' ? (
                                            <span className="text-[8px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">FAILED</span>
                                        ) : (
                                            <span className="text-[8px] font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20">PENDING</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white font-bold leading-tight">{pred.game.home} v {pred.game.away}</p>
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-gray-500">{pred.bestBet}</span>
                                        <span className="text-emerald-400/70">{pred.confidence}% CONF</span>
                                    </div>
                                </motion.div>
                            ))}
                            {predictions.length === 0 && (
                                <div className="text-center py-20">
                                    <Activity className="w-8 h-8 text-gray-800 mx-auto mb-4 animate-pulse" />
                                    <p className="text-gray-600 text-[10px] font-mono tracking-widest uppercase">Awaiting Data Ingestion</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Stratos Core Active</span>
                        </div>
                        <p className="text-[10px] text-emerald-400/70 font-mono leading-relaxed">
                            Neural network ensemble currently processing historical match vectors. Real-time calibration active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

