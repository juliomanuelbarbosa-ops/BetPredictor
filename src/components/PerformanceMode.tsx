import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformanceModeProps {
    predictions: any[];
    bankroll: number;
}

export const PerformanceMode: React.FC<PerformanceModeProps> = ({ predictions, bankroll }) => {
    // Mock historical data based on current bankroll for visualization
    const chartData = [
        { name: 'Mon', value: bankroll * 0.85 },
        { name: 'Tue', value: bankroll * 0.92 },
        { name: 'Wed', value: bankroll * 0.88 },
        { name: 'Thu', value: bankroll * 1.05 },
        { name: 'Fri', value: bankroll * 0.98 },
        { name: 'Sat', value: bankroll * 1.15 },
        { name: 'Sun', value: bankroll },
    ];

    const stats = [
        { label: 'Avg. Confidence', value: '74%', icon: Target, color: 'text-blue-400' },
        { label: 'Profit/Loss', value: '+$240', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'ROI', value: '12.4%', icon: BarChart3, color: 'text-purple-400' },
        { label: 'Max Drawdown', value: '4.2%', icon: TrendingDown, color: 'text-red-400' },
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
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">ANALYZED</span>
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
                                Bankroll Growth
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
                                        tickFormatter={(val) => `$${val}`}
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
                            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Win Probability Distribution</h4>
                            <div className="h-32 flex items-end gap-1">
                                {[40, 65, 30, 85, 45, 90, 55, 70, 35, 60].map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm relative group">
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-1000 ease-out"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                                    <span className="text-lg font-mono font-bold text-white">82</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">System Efficiency</h4>
                                    <p className="text-xs text-gray-500 mt-1">Optimal stake utilization detected.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
