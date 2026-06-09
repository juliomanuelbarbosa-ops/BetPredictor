import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { TrendingUp, Clock } from 'lucide-react';

interface OddsChartProps {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
}

export const OddsChart: React.FC<OddsChartProps> = ({ matchId, homeTeam, awayTeam }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId) return;

        const q = query(
            collection(db, 'odds_history'),
            where('matchId', '==', matchId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    time: d.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
                    Home: d.oddsH,
                    Draw: d.oddsD,
                    Away: d.oddsA,
                    fullTimestamp: d.timestamp?.toDate()
                };
            });
            setData(history);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [matchId]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center glass-panel rounded-3xl border border-white/5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (data.length < 2) {
        return (
            <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-3xl border border-white/5 text-center p-6">
                <Clock className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Waiting for more odds snapshots...</p>
                <p className="text-[10px] text-gray-600 mt-1">Polling active every 30 minutes</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-display font-bold text-white tracking-tight uppercase">Odds Movement</h4>
            </div>
            
            <div className="h-64 w-full glass-panel p-4 rounded-3xl border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            stroke="#666" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="#666" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ fontSize: '10px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="Home" stroke="#3b82f6" strokeWidth={2} dot={false} name={homeTeam} />
                        <Line type="monotone" dataKey="Draw" stroke="#9ca3af" strokeWidth={2} dot={false} name="Draw" />
                        <Line type="monotone" dataKey="Away" stroke="#ef4444" strokeWidth={2} dot={false} name={awayTeam} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
