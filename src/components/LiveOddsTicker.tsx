import React, { useMemo } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';
import { useSettingsStore } from '../stores/settingsStore';
import { convertOdds } from '../lib/utils';

export const LiveOddsTicker = () => {
    const { upcomingMatches } = useMatchStore();
    const { oddsFormat } = useSettingsStore();
    
    // Generate random trend data once per match to avoid flickering on re-renders
    const tickerMatches = useMemo(() => {
        return upcomingMatches.slice(0, 10).map(m => ({
            ...m,
            trendIsUp: Math.random() > 0.5,
            trendValue: `0.0${Math.floor(Math.random() * 9) + 1}`
        }));
    }, [upcomingMatches]);

    if (!tickerMatches || tickerMatches.length === 0) {
        return null; // Don't render empty ticker
    }

    return (
        <div className="w-full glass-panel border-y border-white/5 py-4 overflow-hidden relative z-[90] mb-8 shadow-inner bg-black/40">
            <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none mix-blend-screen"></div>
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap gap-12 items-center hover:[animation-play-state:paused]">
                {tickerMatches.concat(tickerMatches).map((m, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-default">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em]">{m.league}</span>
                            <span className="text-[11px] font-bold text-white group-hover:text-stratos-accent transition-colors tracking-tight">{m.home} vs {m.away}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-black/30 px-3 py-1.5 rounded-lg border border-stratos-border/50 shadow-inner group-hover:border-stratos-accent/30 transition-colors">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-stratos-muted uppercase">1</span>
                                <span className="text-[11px] font-mono text-stratos-accent font-bold drop-shadow-[0_0_5px_rgba(23,241,209,0.3)]">{convertOdds(m.oddsH, oddsFormat)}</span>
                            </div>
                            <span className="text-[10px] font-mono text-stratos-muted/30">|</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-stratos-muted uppercase">X</span>
                                <span className="text-[11px] font-mono text-gray-400 font-bold">{convertOdds(m.oddsD, oddsFormat)}</span>
                            </div>
                            <span className="text-[10px] font-mono text-stratos-muted/30">|</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-stratos-muted uppercase">2</span>
                                <span className="text-[11px] font-mono text-blue-500 font-bold drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">{convertOdds(m.oddsA, oddsFormat)}</span>
                            </div>
                        </div>
                        {m.trendIsUp ? (
                            <div className="flex items-center gap-1 text-stratos-accent bg-stratos-accent/10 px-2 py-1 rounded border border-stratos-accent/20">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-[9px] font-mono font-bold tracking-widest">+{m.trendValue}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                <ChevronDown className="w-3 h-3" />
                                <span className="text-[9px] font-mono font-bold tracking-widest">-{m.trendValue}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
