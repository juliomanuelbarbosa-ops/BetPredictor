import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart, History, Zap, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformanceModeProps {
    predictions: any[];
    bankroll: number;
}

export const PerformanceMode: React.FC<PerformanceModeProps> = ({ predictions, bankroll }) => {
    
    const { avgConfidence, totalStake, realizedProfit, winRate, resolvedCount, winProbDist, roi, yieldRate, leagueStats } = useMemo(() => {
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
                leagueStats: []
            };
        }

        const avgConf = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
        const tStake = predictions.reduce((acc, p) => acc + (p.stake || 0), 0);
        
        let rProfit = 0;
        let resolvedCount = 0;
        let wonCount = 0;
        let resolvedStake = 0;
        const leagueMap: Record<string, { won: number, total: number }> = {};

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
            }
        });

        const winRate = resolvedCount > 0 ? (wonCount / resolvedCount) * 100 : 0;
        const roi = resolvedStake > 0 ? (rProfit / resolvedStake) * 100 : 0;
        const yieldRate = resolvedStake > 0 ? (rProfit / resolvedStake) * 100 : 0; // Yield is often same as ROI in sports betting context

        // Create a distribution of confidence scores (10 buckets)
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

        return {
            avgConfidence: Math.round(avgConf),
            totalStake: tStake,
            realizedProfit: rProfit,
            winRate: Math.round(winRate),
            resolvedCount,
            winProbDist: normalizedDist.some(d => d > 0) ? normalizedDist : [40, 65, 30, 85, 45, 90, 55, 70, 35, 60],
            roi,
            yieldRate,
            leagueStats: sortedLeagues
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
        { label: 'Avg. Confidence', value: `${avgConfidence}%`, icon: Target, color: 'text-blue-400' },
        { label: 'Realized Profit', value: `${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}`, icon: TrendingUp, color: realizedProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
        { label: 'ROI / Yield', value: `${roi.toFixed(1)}%`, icon: BarChart3, color: 'text-purple-400' },
        { label: 'Win Rate', value: `${winRate}%`, icon: ShieldCheck, color: 'text-yellow-400' },
    ];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: STATS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                            <PieChart className="w-5 h-5 text-emerald-400" />
                            Performance Metrics
                            {predictions.length === 0 && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 ml-auto">SIMULATED</span>}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                                    </div>
                                    <span className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                            <History className="w-5 h-5 text-blue-400" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {predictions.slice(0, 5).map((pred, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-xs text-white font-bold">{pred.game.home} vs {pred.game.away}</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{pred.bestBet} @ {pred.confidence}%</p>
                                    </div>
                                    <div className="text-right">
                                        {pred.actual === 'WON' ? (
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">WON</span>
                                        ) : pred.actual === 'LOST' ? (
                                            <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">LOST</span>
                                        ) : (
                                            <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">ANALYZED</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {predictions.length === 0 && (
                                <p className="text-center text-gray-600 text-xs py-10 font-mono tracking-widest">NO RECENT DATA</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CHARTS */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-white font-bold text-lg flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Bankroll Projection
                            </h3>
                            <div className="flex gap-2">
                                {['1D', '1W', '1M', 'ALL'].map(t => (
                                    <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${t === '1W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full">
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
                                    />
                                    <YAxis 
                                        stroke="#ffffff20" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ color: '#10b981' }}
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
                        <div className="glass-panel p-8 rounded-3xl border border-white/5">
                            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Confidence Distribution</h4>
                            <div className="h-32 flex items-end gap-1">
                                {winProbDist.map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm relative group">
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-1000 ease-out"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {i * 10}% - {(i + 1) * 10}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
                            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Top Leagues</h4>
                            <div className="space-y-3">
                                {leagueStats.length > 0 ? leagueStats.map((l, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">{l.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${l.winRate}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-mono text-emerald-400 font-bold">{Math.round(l.winRate)}%</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-mono text-gray-600 italic">No league data available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
