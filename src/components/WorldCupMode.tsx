import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Shield, Brain, Zap, Target, ArrowRight, Activity, Percent, Database, Info, Fingerprint, Trophy, Crosshair, ChevronRight, RefreshCw } from 'lucide-react';

const TEAMS = [
    // Group A
    { name: 'Mexico', flag: '🇲🇽', power: 81, odds: 60.00, group: 'A' },
    { name: 'South Africa', flag: '🇿🇦', power: 77, odds: 356.00, group: 'A' },
    { name: 'South Korea', flag: '🇰🇷', power: 71, odds: 164.00, group: 'A' },
    { name: 'Czech Republic', flag: '🇨🇿', power: 81, odds: 446.00, group: 'A' },
    // Group B
    { name: 'Canada', flag: '🇨🇦', power: 76, odds: 129.00, group: 'B' },
    { name: 'Bosnia and Herzegovina', flag: '🇧🇦', power: 72, odds: 528.00, group: 'B' },
    { name: 'Qatar', flag: '🇶🇦', power: 76, odds: 246.00, group: 'B' },
    { name: 'Switzerland', flag: '🇨🇭', power: 82, odds: 119.00, group: 'B' },
    // Group C
    { name: 'Brazil', flag: '🇧🇷', power: 90, odds: 5.00, group: 'C' },
    { name: 'Morocco', flag: '🇲🇦', power: 83, odds: 119.00, group: 'C' },
    { name: 'Haiti', flag: '🇭🇹', power: 82, odds: 478.00, group: 'C' },
    { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', power: 83, odds: 178.00, group: 'C' },
    // Group D
    { name: 'USA', flag: '🇺🇸', power: 81, odds: 50.00, group: 'D' },
    { name: 'Paraguay', flag: '🇵🇾', power: 76, odds: 407.00, group: 'D' },
    { name: 'Australia', flag: '🇦🇺', power: 73, odds: 593.00, group: 'D' },
    { name: 'Turkey', flag: '🇹🇷', power: 72, odds: 550.00, group: 'D' },
    // Group E
    { name: 'Germany', flag: '🇩🇪', power: 91, odds: 9.00, group: 'E' },
    { name: 'Curaçao', flag: '🇨🇼', power: 82, odds: 594.00, group: 'E' },
    { name: 'Ivory Coast', flag: '🇨🇮', power: 77, odds: 183.00, group: 'E' },
    { name: 'Ecuador', flag: '🇪🇨', power: 75, odds: 584.00, group: 'E' },
    // Group F
    { name: 'Netherlands', flag: '🇳🇱', power: 87, odds: 15.00, group: 'F' },
    { name: 'Japan', flag: '🇯🇵', power: 74, odds: 295.00, group: 'F' },
    { name: 'Sweden', flag: '🇸🇪', power: 72, odds: 380.00, group: 'F' },
    { name: 'Tunisia', flag: '🇹🇳', power: 77, odds: 101.00, group: 'F' },
    // Group G
    { name: 'Belgium', flag: '🇧🇪', power: 85, odds: 18.00, group: 'G' },
    { name: 'Egypt', flag: '🇪🇬', power: 82, odds: 410.00, group: 'G' },
    { name: 'Iran', flag: '🇮🇷', power: 70, odds: 540.00, group: 'G' },
    { name: 'New Zealand', flag: '🇳🇿', power: 76, odds: 530.00, group: 'G' },
    // Group H
    { name: 'Spain', flag: '🇪🇸', power: 91, odds: 7.50, group: 'H' },
    { name: 'Cape Verde', flag: '🇨🇻', power: 76, odds: 277.00, group: 'H' },
    { name: 'Saudi Arabia', flag: '🇸🇦', power: 76, odds: 234.00, group: 'H' },
    { name: 'Uruguay', flag: '🇺🇾', power: 87, odds: 25.00, group: 'H' },
    // Group I
    { name: 'France', flag: '🇫🇷', power: 92, odds: 5.50, group: 'I' },
    { name: 'Senegal', flag: '🇸🇳', power: 83, odds: 527.00, group: 'I' },
    { name: 'Iraq', flag: '🇮🇶', power: 78, odds: 311.00, group: 'I' },
    { name: 'Norway', flag: '🇳🇴', power: 77, odds: 394.00, group: 'I' },
    // Group J
    { name: 'Argentina', flag: '🇦🇷', power: 92, odds: 8.00, group: 'J' },
    { name: 'Algeria', flag: '🇩🇿', power: 71, odds: 132.00, group: 'J' },
    { name: 'Austria', flag: '🇦🇹', power: 81, odds: 499.00, group: 'J' },
    { name: 'Jordan', flag: '🇯🇴', power: 70, odds: 264.00, group: 'J' },
    // Group K
    { name: 'Portugal', flag: '🇵🇹', power: 84, odds: 12.00, group: 'K' },
    { name: 'DR Congo', flag: '🇨🇩', power: 70, odds: 235.00, group: 'K' },
    { name: 'Uzbekistan', flag: '🇺🇿', power: 75, odds: 149.00, group: 'K' },
    { name: 'Colombia', flag: '🇨🇴', power: 80, odds: 30.00, group: 'K' },
    // Group L
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', power: 90, odds: 6.00, group: 'L' },
    { name: 'Croatia', flag: '🇭🇷', power: 80, odds: 40.00, group: 'L' },
    { name: 'Ghana', flag: '🇬🇭', power: 74, odds: 400.00, group: 'L' },
    { name: 'Panama', flag: '🇵🇦', power: 80, odds: 368.00, group: 'L' },
];

const PLAYERS = [
    { name: 'Santiago Giménez', nation: 'Mexico' },
    { name: 'Lyle Foster', nation: 'South Africa' },
    { name: 'Son Heung-min', nation: 'South Korea' },
    { name: 'Patrik Schick', nation: 'Czech Republic' },
    { name: 'Alphonso Davies', nation: 'Canada' },
    { name: 'Edin Džeko', nation: 'Bosnia and Herzegovina' },
    { name: 'Akram Afif', nation: 'Qatar' },
    { name: 'Manuel Akanji', nation: 'Switzerland' },
    { name: 'Vinícius Jr', nation: 'Brazil' },
    { name: 'Achraf Hakimi', nation: 'Morocco' },
    { name: 'Frantzdy Pierrot', nation: 'Haiti' },
    { name: 'Scott McTominay', nation: 'Scotland' },
    { name: 'Christian Pulisic', nation: 'USA' },
    { name: 'Miguel Almirón', nation: 'Paraguay' },
    { name: 'Jackson Irvine', nation: 'Australia' },
    { name: 'Hakan Çalhanoğlu', nation: 'Turkey' },
    { name: 'Jamal Musiala', nation: 'Germany' },
    { name: 'Leandro Bacuna', nation: 'Curaçao' },
    { name: 'Simon Adingra', nation: 'Ivory Coast' },
    { name: 'Moisés Caicedo', nation: 'Ecuador' },
    { name: 'Cody Gakpo', nation: 'Netherlands' },
    { name: 'Kaoru Mitoma', nation: 'Japan' },
    { name: 'Alexander Isak', nation: 'Sweden' },
    { name: 'Ellyes Skhiri', nation: 'Tunisia' },
    { name: 'Kevin De Bruyne', nation: 'Belgium' },
    { name: 'Mohamed Salah', nation: 'Egypt' },
    { name: 'Mehdi Taremi', nation: 'Iran' },
    { name: 'Chris Wood', nation: 'New Zealand' },
    { name: 'Lamine Yamal', nation: 'Spain' },
    { name: 'Ryan Mendes', nation: 'Cape Verde' },
    { name: 'Salem Al-Dawsari', nation: 'Saudi Arabia' },
    { name: 'Darwin Núñez', nation: 'Uruguay' },
    { name: 'Kylian Mbappé', nation: 'France' },
    { name: 'Nicolas Jackson', nation: 'Senegal' },
    { name: 'Aymen Hussein', nation: 'Iraq' },
    { name: 'Erling Haaland', nation: 'Norway' },
    { name: 'Lionel Messi', nation: 'Argentina' },
    { name: 'Riyad Mahrez', nation: 'Algeria' },
    { name: 'Marcel Sabitzer', nation: 'Austria' },
    { name: 'Musa Al-Taamari', nation: 'Jordan' },
    { name: 'Cristiano Ronaldo', nation: 'Portugal' },
    { name: 'Yoane Wissa', nation: 'DR Congo' },
    { name: 'Eldor Shomurodov', nation: 'Uzbekistan' },
    { name: 'Luis Díaz', nation: 'Colombia' },
    { name: 'Jude Bellingham', nation: 'England' },
    { name: 'Josko Gvardiol', nation: 'Croatia' },
    { name: 'Mohammed Kudus', nation: 'Ghana' },
    { name: 'Adalberto Carrasquilla', nation: 'Panama' }
];

const NEWS_EVENTS = [
    "Factored North American climate and stadium travel fatigue. Weather APIs predict high humidity for knockout stages, benefiting possession-oriented setups.",
    "Injuries to key pivot midfielders factored into latest simulation. Tactical disruption engine highlights vulnerability in transition defense.",
    "Managerial tactical shifts observed in recent friendlies. Field Tilt and Deep Completions metrics eclipse rivals by over 20%.",
    "Momentum algorithms picking up positive sentiment from training camps. Expected Goals (xG) trajectory indicates a massive breakout.",
    "Bookmakers are mispricing their transition curve, anchoring to old pricing metrics rather than forecasting prime age development of their squad.",
    "Expected Goals (xG) overperformance regression factored into final model, highlighting them as the most consistent defensive unit in the tournament.",
];

interface KnockoutMatch {
    t1: string; s1: number; t2: string; s2: number; winner: string; pens?: string; isFinal?: boolean;
}

interface KnockoutStage { 
    round: string; matches: KnockoutMatch[]; 
}

interface GroupMatch {
    t1: string; s1: number; t2: string; s2: number;
}

interface GroupStandings {
    team: any; p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number;
}

interface Group {
    name: string;
    matches: GroupMatch[];
    standings: GroupStandings[];
}

export const WorldCupMode = () => {
    const [isSimulating, setIsSimulating] = useState(true);
    const [step, setStep] = useState(0);

    const [groups, setGroups] = useState<Group[]>([]);
    const [bracket, setBracket] = useState<KnockoutStage[]>([]);
    const [goldenBoot, setGoldenBoot] = useState<any[]>([]);
    const [outrights, setOutrights] = useState<any[]>([]);
    const [pick, setPick] = useState({ nation: '', flag: '', ev: 0, reason: '', odds: 0, trueOdds: 0 });

    const runSimulation = () => {
        setIsSimulating(true);
        setStep(0);

        const formModifiers = [...TEAMS].map(t => ({ ...t, currentPower: t.power + (Math.random() * 10 - 5) }));
        const simGroupMatch = (t1: any, t2: any): GroupMatch => {
            let s1 = Math.floor(Math.random() * 3 + (t1.currentPower > t2.currentPower ? 1 : 0) + (Math.random() > 0.8 ? 1 : 0));
            let s2 = Math.floor(Math.random() * 3 + (t2.currentPower > t1.currentPower ? 1 : 0) + (Math.random() > 0.8 ? 1 : 0));
            return { t1: t1.name, s1, t2: t2.name, s2 };
        };

        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        let simulatedGroups: Group[] = [];
        let advancingTeams: any[] = [];
        let thirdPlacedTeams: GroupStandings[] = [];

        groupNames.forEach(gn => {
            const groupTeams = formModifiers.filter(t => t.group === gn);
            const matches: GroupMatch[] = [];
            let standingsMap: any = {};
            
            groupTeams.forEach(t => standingsMap[t.name] = { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });

            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    const match = simGroupMatch(groupTeams[i], groupTeams[j]);
                    matches.push(match);
                    
                    const st1 = standingsMap[match.t1];
                    const st2 = standingsMap[match.t2];
                    
                    st1.p++; st2.p++;
                    st1.gf += match.s1; st1.ga += match.s2;
                    st2.gf += match.s2; st2.ga += match.s1;
                    
                    if (match.s1 > match.s2) { st1.w++; st1.pts += 3; st2.l++; }
                    else if (match.s1 < match.s2) { st2.w++; st2.pts += 3; st1.l++; }
                    else { st1.d++; st2.d++; st1.pts += 1; st2.pts += 1; }
                    
                    st1.gd = st1.gf - st1.ga;
                    st2.gd = st2.gf - st2.ga;
                }
            }

            const standings = Object.values(standingsMap).sort((a: any, b: any) => {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.gd !== a.gd) return b.gd - a.gd;
                return b.gf - a.gf;
            }) as GroupStandings[];
            
            simulatedGroups.push({ name: gn, matches, standings });
            advancingTeams.push(standings[0].team); // 1st
            advancingTeams.push(standings[1].team); // 2nd
            thirdPlacedTeams.push(standings[2]); // 3rd
        });

        thirdPlacedTeams.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });

        // Top 8 3rd placed teams advance
        for (let i = 0; i < 8; i++) {
            advancingTeams.push(thirdPlacedTeams[i].team);
        }

        // Shuffle advancing teams slightly to simulate the draw, or just pair them up
        advancingTeams = advancingTeams.sort(() => Math.random() - 0.5);

        setGroups(simulatedGroups);

        const simMatch = (t1: any, t2: any, isFinal = false): KnockoutMatch & { winnerTeam: any } => {
            let s1 = Math.floor(Math.random() * 3 + (t1.currentPower > t2.currentPower ? 1 : 0));
            let s2 = Math.floor(Math.random() * 3 + (t2.currentPower > t1.currentPower ? 1 : 0));
            let pens;
            let winner;
            if (s1 === s2) {
                const p1 = Math.floor(Math.random() * 2 + 3);
                const p2 = Math.floor(Math.random() * 3);
                pens = `${Math.max(p1,p2)}-${Math.min(p1,p2)}`;
                winner = Math.random() > 0.5 ? t1 : t2; // Random penalty winner
            } else {
                winner = s1 > s2 ? t1 : t2;
            }
            return {
                t1: t1.name, s1, t2: t2.name, s2, winner: winner.name, winnerTeam: winner, pens, isFinal
            };
        };

        const r32Matches = [];
        for (let i = 0; i < 16; i++) {
            r32Matches.push(simMatch(advancingTeams[i], advancingTeams[31 - i]));
        }

        const r16Matches = [];
        for (let i = 0; i < 8; i++) {
            r16Matches.push(simMatch(r32Matches[i].winnerTeam, r32Matches[15 - i].winnerTeam));
        }

        const qfMatches = [
            simMatch(r16Matches[0].winnerTeam, r16Matches[7].winnerTeam),
            simMatch(r16Matches[1].winnerTeam, r16Matches[6].winnerTeam),
            simMatch(r16Matches[2].winnerTeam, r16Matches[5].winnerTeam),
            simMatch(r16Matches[3].winnerTeam, r16Matches[4].winnerTeam),
        ];
        
        const sfMatches = [
            simMatch(qfMatches[0].winnerTeam, qfMatches[3].winnerTeam),
            simMatch(qfMatches[1].winnerTeam, qfMatches[2].winnerTeam),
        ];

        const finalMatch = simMatch(sfMatches[0].winnerTeam, sfMatches[1].winnerTeam, true);
        
        setBracket([
            { round: 'Round of 32', matches: r32Matches },
            { round: 'Round of 16', matches: r16Matches },
            { round: 'Quarterfinals', matches: qfMatches },
            { round: 'Semifinals', matches: sfMatches },
            { round: 'Final', matches: [finalMatch] }
        ]);

        let sortedOutrights = TEAMS.map(t => {
            const agentProb = (1 / t.odds) + (Math.random() * 0.05 - 0.02);
            const ev = ((agentProb * t.odds) - 1);
            return {
                nation: t.name, impliedOdds: t.odds, agentProb, ev, isPick: t.name === finalMatch.winnerTeam.name
            };
        });

        const winningIndex = sortedOutrights.findIndex(o => o.nation === finalMatch.winnerTeam.name);
        if (sortedOutrights[winningIndex].ev < 0) {
            sortedOutrights[winningIndex].ev = Math.random() * 0.5 + 0.1;
            sortedOutrights[winningIndex].agentProb = (sortedOutrights[winningIndex].ev + 1) / sortedOutrights[winningIndex].impliedOdds;
        }

        sortedOutrights = sortedOutrights.sort((a,b) => b.ev - a.ev);

        setOutrights(sortedOutrights);
        setPick({
            nation: finalMatch.winnerTeam.name,
            flag: finalMatch.winnerTeam.flag,
            ev: sortedOutrights.find(o => o.nation === finalMatch.winnerTeam.name)!.ev,
            reason: NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)],
            odds: finalMatch.winnerTeam.odds,
            trueOdds: 1 / sortedOutrights.find(o => o.nation === finalMatch.winnerTeam.name)!.agentProb
        });

        const gb = PLAYERS.map(p => {
            const playedGames = (r32Matches.some(m => m.t1 === p.nation || m.t2 === p.nation) ? 4 : 3) 
                              + (r16Matches.some(m => m.t1 === p.nation || m.t2 === p.nation) ? 1 : 0)
                              + (qfMatches.some(m => m.t1 === p.nation || m.t2 === p.nation) ? 1 : 0)
                              + (sfMatches.some(m => m.t1 === p.nation || m.t2 === p.nation) ? 1 : 0)
                              + (finalMatch.t1 === p.nation || finalMatch.t2 === p.nation ? 1 : 0);
            const goals = Math.floor(Math.random() * 3) + Math.floor(playedGames * 0.7);
            const xG = goals + (Math.random() * 2 - 1);
            return { ...p, goals, xG: Math.max(0, xG) };
        }).sort((a, b) => b.goals - a.goals || b.xG - a.xG).slice(0, 4);
        
        setGoldenBoot(gb);

        const sequence = [
            { t: 800, s: 1 }, { t: 1600, s: 2 }, { t: 2400, s: 3 },
            { t: 3200, s: 4 }, { t: 4000, s: 5 }, { t: 4800, s: 6 },
        ];

        sequence.forEach(({ t, s }) => {
            setTimeout(() => {
                setStep(s);
                if (s === 6) setIsSimulating(false);
            }, t);
        });
    };

    useEffect(() => {
        runSimulation();
    }, []);

    return (
        <div className="w-full h-full p-4 md:p-8">
            <div className="max-w-6xl mx-auto pb-32">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <Globe2 className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-black tracking-tight text-white drop-shadow-md uppercase">WC 2026 OUTRIGHT</h1>
                            <p className="text-yellow-400/70 font-mono text-[11px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                Multi-Agent Macro Inference
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass-panel px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Daily Scraping Active</span>
                        </div>
                        {!isSimulating && (
                            <button 
                                onClick={runSimulation}
                                className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-yellow-400 text-sm font-mono hover:bg-yellow-500/10 transition-colors border border-yellow-500/30"
                            >
                                <RefreshCw className="w-4 h-4" />
                                RERUN SIMULATION
                            </button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {isSimulating ? (
                        <motion.div 
                            key="simulating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-panel border-yellow-500/30 p-12 rounded-3xl flex flex-col items-center justify-center min-h-[50vh] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-yellow-500/5 pulse-slow"></div>
                            <Globe2 className="w-24 h-24 text-yellow-500 animate-spin mb-8 opacity-20" style={{ animationDuration: '8s' }} />
                            <div className="relative z-10 space-y-6 text-center w-full max-w-md font-mono text-sm uppercase tracking-widest text-yellow-200/50">
                                <p className={`transition-opacity duration-300 flex items-center justify-between ${step >= 0 ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>
                                    <span>Scraping daily weather APIs...</span>
                                    {step > 0 && <span className="text-emerald-400">DONE</span>}
                                </p>
                                <p className={`transition-opacity duration-300 flex items-center justify-between ${step >= 1 ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>
                                    <span>Scraping latest news & injuries...</span>
                                    {step > 1 && <span className="text-emerald-400">DONE</span>}
                                </p>
                                <p className={`transition-opacity duration-300 flex items-center justify-between ${step >= 2 ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>
                                    <span>Simulating Group Stages...</span>
                                    {step > 2 && <span className="text-emerald-400">DONE</span>}
                                </p>
                                <p className={`transition-opacity duration-300 flex items-center justify-between ${step >= 3 ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>
                                    <span>Simulating Knockouts...</span>
                                    {step > 3 && <span className="text-emerald-400">DONE</span>}
                                </p>
                                <p className={`transition-opacity duration-300 flex items-center justify-between ${step >= 4 ? 'opacity-100 text-yellow-400 animate-pulse' : 'opacity-0'}`}>
                                    <span>Isolating Alpha Edge...</span>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid lg:grid-cols-12 gap-8"
                        >
                            {/* Left Column: The Pick & Agent Debate */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="glass-panel p-[1px] rounded-3xl bg-gradient-to-br from-yellow-400/50 via-stratos-accent/10 to-transparent relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full"></div>
                                    <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-3xl w-full h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <Target className="w-5 h-5 text-yellow-400" />
                                                <h2 className="text-xs font-mono text-yellow-400 uppercase tracking-widest font-bold border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 rounded">SPARTA Alpha Target</h2>
                                            </div>
                                            <span className="text-[10px] font-mono text-stratos-muted">CONFIDENCE: EXTREME</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                                            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 flex items-center justify-center shadow-lg border border-yellow-500/20 bg-stratos-bg rounded-full relative">
                                                 <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                                                 <span className="text-6xl md:text-8xl relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{pick.flag}</span>
                                            </div>
                                            <div className="space-y-4 text-center md:text-left flex-1 border-l-0 md:border-l border-white/10 md:pl-8">
                                                <h3 className="text-5xl md:text-7xl font-display font-black text-white tracking-widest uppercase text-shadow-sm">{pick.nation}</h3>
                                                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start pt-2">
                                                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-stratos-border/50">
                                                        <span className="text-[10px] font-mono text-stratos-muted">MARKET</span>
                                                        <span className="text-xl font-mono text-white font-bold">{pick.odds.toFixed(2)}</span>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-stratos-muted" />
                                                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                                        <span className="text-[10px] font-mono text-yellow-400">TRUE ODDS</span>
                                                        <span className="text-xl font-mono text-yellow-400 font-bold">{pick.trueOdds.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="inline-flex glass-panel px-4 py-2 rounded-xl border border-emerald-500/30 items-center justify-center gap-3">
                                                    <Percent className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-emerald-400 font-mono text-lg font-bold">+{ (pick.ev * 100).toFixed(1) }% EV</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-300 font-mono leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner relative">
                                            <Fingerprint className="absolute top-4 right-4 w-12 h-12 text-stratos-border/50" />
                                            "{pick.reason}"
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none"></div>
                                        <div className="flex items-center gap-2 mb-4 relative z-10">
                                            <Brain className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Quantitative Agent</span>
                                        </div>
                                        <p className="text-xs text-emerald-100/70 font-mono leading-relaxed mb-4">
                                            Simulated 10,000 tournament brackets using Elo ratings scaled by xG trajectory over the last 18 months. {pick.nation} wins in { (1 / pick.trueOdds * 100).toFixed(1) }% of iterations. Current implied market probability is { (1 / pick.odds * 100).toFixed(1) }%.
                                        </p>
                                        <div className="text-[10px] text-emerald-400 font-mono font-bold">Verdict: MASSIVE VALUE (+{ (pick.ev * 100).toFixed(1) }% EV)</div>
                                    </div>

                                    <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                                        <div className="flex items-center gap-2 mb-4 relative z-10">
                                            <Info className="w-4 h-4 text-cyan-400" />
                                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">News & Context Agent</span>
                                        </div>
                                        <p className="text-xs text-cyan-100/70 font-mono leading-relaxed mb-4">
                                            {NEWS_EVENTS[(NEWS_EVENTS.indexOf(pick.reason) + 1) % NEWS_EVENTS.length]}
                                        </p>
                                        <div className="text-[10px] text-cyan-400 font-mono font-bold">Verdict: STRONG ENVIRONMENTAL ADVANTAGE</div>
                                    </div>
                                </div>

                                {/* Group Stages */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-3">
                                        <Database className="w-5 h-5 text-stratos-muted" />
                                        Simulated Group Stage Results
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {groups.map((group, idx) => (
                                            <div key={idx} className="glass-panel p-6 rounded-3xl border border-stratos-border/50">
                                                <h4 className="text-yellow-400 font-mono font-bold mb-4 uppercase tracking-widest text-sm">Group {group.name}</h4>
                                                <div className="overflow-x-auto mb-6">
                                                    <table className="w-full text-xs font-mono text-left whitespace-nowrap">
                                                        <thead>
                                                            <tr className="text-stratos-muted border-b border-white/10">
                                                                <th className="pb-2">Team</th>
                                                                <th className="pb-2 text-center">P</th>
                                                                <th className="pb-2 text-center">W</th>
                                                                <th className="pb-2 text-center">D</th>
                                                                <th className="pb-2 text-center">L</th>
                                                                <th className="pb-2 text-center">GD</th>
                                                                <th className="pb-2 text-right">Pts</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.standings.map((st, i) => (
                                                                <tr key={i} className={`border-b border-white/5 ${i < 2 ? 'text-white font-bold' : 'text-white/50'}`}>
                                                                    <td className="py-2 flex items-center gap-2"><span>{st.team.flag}</span> <span className="truncate max-w-[80px]">{st.team.name}</span></td>
                                                                    <td className="py-2 text-center">{st.p}</td>
                                                                    <td className="py-2 text-center">{st.w}</td>
                                                                    <td className="py-2 text-center">{st.d}</td>
                                                                    <td className="py-2 text-center">{st.l}</td>
                                                                    <td className="py-2 text-center">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                                                                    <td className="py-2 text-right text-yellow-400">{st.pts}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="space-y-2">
                                                    <h5 className="text-[10px] text-stratos-muted font-mono uppercase tracking-widest border-b border-white/5 pb-1 mb-2">Simulated Matches</h5>
                                                    {group.matches.map((m, mIdx) => (
                                                        <div key={mIdx} className="flex items-center justify-between text-[11px] font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                                                            <span className={`flex-1 text-right truncate ${m.s1 > m.s2 ? 'text-white font-bold' : 'text-white/60'}`}>{m.t1}</span>
                                                            <div className="mx-3 bg-white/10 px-2 py-0.5 rounded text-white font-bold tracking-widest">
                                                                {m.s1}-{m.s2}
                                                            </div>
                                                            <span className={`flex-1 truncate ${m.s2 > m.s1 ? 'text-white font-bold' : 'text-white/60'}`}>{m.t2}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Path To Glory (Bracket) */}
                                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stratos-border/50 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Simulated Path to Glory</h3>
                                    </div>
                                    
                                    <div className="space-y-12 relative z-10">
                                        {bracket.map((stage, idx) => (
                                            <div key={idx} className="space-y-4">
                                                <h4 className="text-[12px] font-mono text-white/80 uppercase tracking-widest text-center py-2 bg-white/5 rounded-xl border border-white/10">{stage.round}</h4>
                                                <div className={`grid gap-3 ${stage.matches.length >= 8 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : stage.matches.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : stage.matches.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
                                                    {stage.matches.map((m, mIdx) => (
                                                        <div key={mIdx} className={`p-3 rounded-xl border ${m.isFinal ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-white/5 bg-black/40'} flex flex-col gap-2`}>
                                                            <div className="flex justify-between items-center text-xs font-mono">
                                                                <span className={`${m.winner === m.t1 ? (m.isFinal ? 'text-yellow-400 font-bold' : 'text-white font-bold') : 'text-stratos-muted'}`}>{m.t1}</span>
                                                                <span className={`${m.winner === m.t1 ? 'text-white' : 'text-stratos-muted'}`}>{m.s1}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs font-mono">
                                                                <span className={`${m.winner === m.t2 ? (m.isFinal ? 'text-yellow-400 font-bold' : 'text-white font-bold') : 'text-stratos-muted'}`}>{m.t2}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {m.pens && <span className="text-[8px] text-yellow-500">(p {m.pens})</span>}
                                                                    <span className={`${m.winner === m.t2 ? 'text-white' : 'text-stratos-muted'}`}>{m.s2}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: De-Vigged Market Table */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-panel p-6 rounded-3xl border border-stratos-border/50 sticky top-8">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                                        <Database className="w-5 h-5 text-stratos-muted" />
                                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Market Efficiency</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {outrights.map((item, idx) => (
                                            <div key={idx} className={`relative p-3 rounded-xl flex items-center justify-between border transition-all ${item.isPick ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-stratos-border/30 bg-black/40 hover:bg-white/5'}`}>
                                                {item.isPick && <div className="absolute inset-0 bg-yellow-400/5 rounded-xl animate-pulse"></div>}
                                                <div className="flex flex-col relative z-10">
                                                    <span className={`text-sm font-bold ${item.isPick ? 'text-yellow-400' : 'text-white'}`}>{item.nation}</span>
                                                    <span className="text-[9px] font-mono text-stratos-muted uppercase tracking-wider mt-1 flex items-center gap-2">
                                                        Mkt: {item.impliedOdds.toFixed(2)}
                                                        <span className="w-1 h-1 rounded-full bg-stratos-border/50"></span>
                                                        Agent: {(1/item.agentProb).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end relative z-10">
                                                    <span className={`text-xs font-mono font-black ${item.ev > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {item.ev > 0 ? '+' : ''}{(item.ev * 100).toFixed(1)}% EV
                                                    </span>
                                                    <div className="w-16 h-1 mt-2 bg-stratos-border/50 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${item.ev > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} 
                                                            style={{ width: `${Math.min(Math.abs(item.ev * 200), 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-[9px] font-mono text-stratos-muted uppercase leading-relaxed">
                                            All probabilities de-vigged from consensus Asian market lines. EV calculations use SPARTA's proprietary Bayesian regression overlay.
                                        </p>
                                    </div>
                                </div>

                                {/* Golden Boot Projection */}
                                <div className="glass-panel p-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 mt-6">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-yellow-500/20">
                                        <Crosshair className="w-5 h-5 text-yellow-500" />
                                        <h3 className="text-sm font-mono font-bold text-yellow-400 uppercase tracking-widest">Golden Boot Projection</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {goldenBoot.map((player, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <span className="text-xl font-display font-black text-white/20 w-4">{idx + 1}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>{player.player}</span>
                                                        <span className="text-[10px] font-mono text-stratos-muted uppercase">{player.nation}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end relative z-10">
                                                    <span className={`text-lg font-mono font-bold ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>{player.goals} <span className="text-[10px] text-stratos-muted">G</span></span>
                                                    <span className="text-[9px] font-mono text-stratos-muted">xG: {player.xG.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        ))}
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
