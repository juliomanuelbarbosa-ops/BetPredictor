import React, { useState, useEffect, useRef } from 'react';
import { Brain, CloudLightning, CheckCircle, Copy, RefreshCw, Calendar, LayoutGrid, Activity, ShieldCheck, Bot } from 'lucide-react';
import { calculateStake } from './lib/utils';
import { getWeather, getRealOdds, getBetStackData, getBizzoPrediction, getGameForecast, getBytezAnalysis, getPlayerMetrics, getAdvancedMetrics, getUpcomingGames, getActiveServicesCount } from './api/footballApi';
import { predictWithModel, createAndTrainModel } from './lib/ai';
import { initializeSpartaMatrix, runMonteCarlo } from './lib/spartaSim';
import { footballData } from './api/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './store/queryClient';
import { SpartaMode } from './components/SpartaMode';
import { UpcomingMode } from './components/UpcomingMode';
import { SettingsMode } from './components/SettingsMode';
import { PerformanceMode } from './components/PerformanceMode';
import { IntelligenceMode } from './components/IntelligenceMode';
import { SpartaLogo } from './components/SpartaLogo';

const leagueMap: Record<string, { oddsKey: string }> = {
    "premier league": {oddsKey: "soccer_epl"},
    "bundesliga": {oddsKey: "soccer_germany_bundesliga"},
    "la liga": {oddsKey: "soccer_spain_la_liga"},
    "serie a": {oddsKey: "soccer_italy_serie_a"},
    "ligue 1": {oddsKey: "soccer_france_ligue_one"},
    "champions league": {oddsKey: "soccer_uefa_champions_league"}
};

const cityMap: Record<string, string> = {
    "Arsenal": "London", "Manchester City": "Manchester", "Liverpool": "Liverpool",
    "Bayern Munich": "Munich", "Borussia Dortmund": "Dortmund",
    "Real Madrid": "Madrid", "Barcelona": "Barcelona",
    "Juventus": "Turin", "Inter Milan": "Milan",
    "PSG": "Paris", "Lyon": "Lyon"
};

export default function App() {
    const [bankroll, setBankroll] = useState(1000);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [totalGames, setTotalGames] = useState(0);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const [phase, setPhase] = useState<'STRATOS' | 'COMBAT'>('STRATOS');
    const [matchInput, setMatchInput] = useState("");
    const [spartaMatrix, setSpartaMatrix] = useState<any>(null);
    const [stratosResult, setStratosResult] = useState<any>(null);
    const [combatResult, setCombatResult] = useState<any>(null);

    const runCombat = async () => {
        setIsLoading(true);
        setLoadingStep("Injecting real-time variables and running Combat simulation...");
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Modify spartaMatrix slightly to simulate real-time changes (e.g., lineups, late injuries)
            const adjustedMatrix = {
                ...spartaMatrix,
                home: { ...spartaMatrix.home, xG_base: spartaMatrix.home.xG_base * (1 + (Math.random() * 0.1 - 0.02)) },
                away: { ...spartaMatrix.away, xG_base: spartaMatrix.away.xG_base * (1 + (Math.random() * 0.1 - 0.05)) }
            };
            setSpartaMatrix(adjustedMatrix);
            const result = runMonteCarlo(adjustedMatrix, 10000);
            setCombatResult(result);
            setPhase('COMBAT');
            showToast("Combat Phase Complete.");
        } catch (err: any) {
            showToast("Error: " + err.message, 'error');
            setGlobalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resolvePrediction = (predId: string, won: boolean) => {
        savePredictions(prev => prev.map(p => {
            if (p.id === predId && p.actual === null) {
                let odds = 2.0;
                if (p.bestBet === "HOME WIN") odds = p.game.oddsH || 2.0;
                else if (p.bestBet === "DRAW") odds = p.game.oddsD || 3.0;
                else if (p.bestBet === "AWAY WIN") odds = p.game.oddsA || 3.0;

                const profit = won ? p.stake * (odds - 1) : -p.stake;
                saveBankroll(prevBankroll => prevBankroll + profit);
                
                setTotalCorrect(prev => {
                    const updated = prev + (won ? 1 : 0);
                    localStorage.setItem('totalCorrect', updated.toString());
                    return updated;
                });
                setTotalGames(prev => {
                    const updated = prev + 1;
                    localStorage.setItem('totalGames', updated.toString());
                    return updated;
                });
                
                return { ...p, actual: won ? 'WON' : 'LOST', profit };
            }
            return p;
        }));
        showToast(`Bet marked as ${won ? 'WON' : 'LOST'}`);
    };

    const deletePrediction = (predId: string) => {
        savePredictions(prev => {
            const pred = prev.find(p => p.id === predId);
            if (pred && pred.actual !== null) {
                saveBankroll(prevBankroll => prevBankroll - (pred.profit || 0));
                setTotalGames(prevGames => {
                    const updated = prevGames - 1;
                    localStorage.setItem('totalGames', updated.toString());
                    return updated;
                });
                if (pred.actual === 'WON') {
                    setTotalCorrect(prevCorrect => {
                        const updated = prevCorrect - 1;
                        localStorage.setItem('totalCorrect', updated.toString());
                        return updated;
                    });
                }
            }
            return prev.filter(p => p.id !== predId);
        });
        showToast("Prediction deleted");
    };

    const [mode, setMode] = useState<'SPARTA' | 'UPCOMING' | 'SETTINGS' | 'PERFORMANCE' | 'INTELLIGENCE'>('UPCOMING');
    const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);

    useEffect(() => {
        const handleError = (e: ErrorEvent) => {
            setGlobalError(e.message);
        };
        const handleRejection = (e: PromiseRejectionEvent) => {
            setGlobalError(e.reason?.message || "Promise rejected");
        };
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    useEffect(() => {
        const b = localStorage.getItem('bankroll');
        if (b) setBankroll(parseFloat(b));
        const tc = localStorage.getItem('totalCorrect');
        if (tc) setTotalCorrect(parseInt(tc));
        const tg = localStorage.getItem('totalGames');
        if (tg) setTotalGames(parseInt(tg));
        const preds = localStorage.getItem('predictions');
        if (preds) {
            try {
                setPredictions(JSON.parse(preds));
            } catch (e) {
                console.error("Failed to parse predictions from localStorage");
            }
        }
    }, []);

    const saveBankroll = (val: number | ((prev: number) => number)) => {
        if (typeof val === 'function') {
            setBankroll(prev => {
                const updated = val(prev);
                localStorage.setItem('bankroll', updated.toString());
                return updated;
            });
        } else {
            setBankroll(val);
            localStorage.setItem('bankroll', val.toString());
        }
    };

    const savePredictions = (newPredictions: any[] | ((prev: any[]) => any[])) => {
        if (typeof newPredictions === 'function') {
            setPredictions(prev => {
                const updated = newPredictions(prev);
                localStorage.setItem('predictions', JSON.stringify(updated));
                return updated;
            });
        } else {
            setPredictions(newPredictions);
            localStorage.setItem('predictions', JSON.stringify(newPredictions));
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const initializeStratos = async () => {
        if (!matchInput) {
            showToast("Please enter a match name.", 'error');
            return;
        }
        setIsLoading(true);
        setLoadingStep("Initializing Sparta 300-variable matrix...");
        setGlobalError(null);
        
        try {
            const parts = matchInput.split(' vs ');
            const home = parts[0]?.trim() || "Home";
            const away = parts[1]?.trim() || "Away";
            
            const matrix = await initializeSpartaMatrix(home, away);
            setSpartaMatrix(matrix);
            
            setLoadingStep("Running baseline 10,000-iteration Monte Carlo simulation...");
            
            // Simulate a short delay for UI
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const result = runMonteCarlo(matrix, 10000);
            setStratosResult(result);
            setPhase('STRATOS');
            showToast("Stratos Phase Complete.");
        } catch (err: any) {
            showToast("Error: " + err.message, 'error');
            setGlobalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUpcoming = async () => {
        setIsLoading(true);
        setLoadingStep("Fetching live and upcoming games for the next 24h...");
        setGlobalError(null);
        try {
            const matches = await getUpcomingGames();
            
            // Enhance matches with form and H2H data from local history
            const enhancedMatches = matches.map(m => {
                const homeForm = footballData.getTeamFormResults(m.home);
                const awayForm = footballData.getTeamFormResults(m.away);
                const h2h = footballData.getH2H(m.home, m.away);
                return { ...m, homeForm, awayForm, h2h };
            });

            setUpcomingMatches(enhancedMatches);
            showToast(`Found ${matches.length} matches!`);
        } catch (err: any) {
            showToast("Error: " + err.message, 'error');
            setGlobalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 'UPCOMING' && upcomingMatches.length === 0) {
            fetchUpcoming();
        }
    }, [mode]);

    const analyzeMatch = async (match: any) => {
        setIsLoading(true);
        setLoadingStep(`Analyzing ${match.home} vs ${match.away}...`);
        try {
            const city = cityMap[match.home] || "London";
            const weather = await getWeather(city);
            const odds = { avgH: match.oddsH, avgD: match.oddsD, avgA: match.oddsA };
            const betstack = await getBetStackData(match.league);
            
            setLoadingStep(`Generating tactical insight for ${match.home} vs ${match.away}...`);
            const bytezAnalysis = await getBytezAnalysis(match.home, match.away, weather, odds, betstack);

            const homeForm = footballData.getTeamForm(match.home);
            const awayForm = footballData.getTeamForm(match.away);
            const h2h = footballData.getH2H(match.home, match.away);
            
            const homePlayerMetrics = await getPlayerMetrics(match.home);
            const awayPlayerMetrics = await getPlayerMetrics(match.away);
            
            const homeAdv = await getAdvancedMetrics(match.home);
            const awayAdv = await getAdvancedMetrics(match.away);

            await createAndTrainModel((msg) => setLoadingStep(msg));

            const features = [
                match.oddsH || 2.5, 
                match.oddsD || 3.5, 
                match.oddsA || 3.5,
                homeForm.pts, awayForm.pts,
                homeForm.gs, awayForm.gs,
                homeForm.gc, awayForm.gc,
                homeForm.sot, awayForm.sot,
                h2h.homeWins, h2h.awayWins, h2h.draws,
                1, 
                homePlayerMetrics.keyPlayerForm,
                homePlayerMetrics.injuryImpact,
                homePlayerMetrics.disciplineImpact,
                awayPlayerMetrics.keyPlayerForm,
                awayPlayerMetrics.injuryImpact,
                awayPlayerMetrics.disciplineImpact,
                parseFloat(homeAdv.xG), parseFloat(awayAdv.xG),
                parseFloat(homeAdv.PPDA), parseFloat(awayAdv.PPDA),
                parseFloat(homeAdv.Field_Tilt), parseFloat(awayAdv.Field_Tilt),
                parseFloat(homeAdv.Clean_Sheet_Probability), parseFloat(awayAdv.Clean_Sheet_Probability),
                Number(homeAdv.Rest_Days), Number(awayAdv.Rest_Days)
            ];

            const probs = await predictWithModel(features);
            const bestIndex = probs.indexOf(Math.max(...probs));
            const labels = ["HOME WIN", "DRAW", "AWAY WIN"];
            const bestBet = labels[bestIndex];
            const confidence = Math.round(probs[bestIndex] * 100);

            const implied = 1 / (match.oddsH || 2.5);
            const edge = Math.round((probs[bestIndex] - implied) * 100);
            const valueText = edge > 3 ? `✅ +${edge}% EDGE` : "";

            const predScore = `${Math.round(1.3 + probs[0]*1.8)}-${Math.round(1.0 + probs[2]*1.6)}`;
            const stake = calculateStake(confidence, edge);

            const prediction = {
                id: Math.random().toString(36).substring(2, 9),
                game: match, probs, bestBet, confidence, edge, valueText, predScore, stake, features, actual: null, bytezAnalysis
            };

            savePredictions(prev => [prediction, ...prev]);
            showToast("Analysis complete!");
        } catch (err: any) {
            showToast("Error: " + err.message, 'error');
            setGlobalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyPrediction = (pred: any) => {
        const text = `
🎯 STRATOS.AI PREDICTION
⚽ ${pred.game.home} vs ${pred.game.away}
🏆 ${pred.game.league}
📈 Recommendation: ${pred.bestBet}
🔥 Confidence: ${pred.confidence}%
📊 Predicted Score: ${pred.predScore}
💰 Suggested Stake: $${pred.stake}
📝 Insight: ${pred.bytezAnalysis.report.substring(0, 100)}...
        `.trim();
        navigator.clipboard.writeText(text);
        showToast("Detailed prediction copied!");
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to permanently delete all predictions, bankroll, and history? This cannot be undone.")) {
            localStorage.removeItem('predictions');
            localStorage.removeItem('bankroll');
            localStorage.removeItem('totalCorrect');
            localStorage.removeItem('totalGames');
            setBankroll(1000);
            setTotalCorrect(0);
            setTotalGames(0);
            savePredictions([]);
            showToast("History cleared!");
        }
    };

    const successRate = totalGames > 0 ? Math.round((totalCorrect / totalGames) * 100) : 0;

    return (
        <QueryClientProvider client={queryClient}>
            <div className="bg-transparent text-gray-100 min-h-screen font-sans selection:bg-emerald-500/30 relative z-10">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    {globalError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-950/80 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-400 font-bold">!</span>
                        </div>
                        <div>
                            <strong className="font-mono text-sm tracking-wider uppercase text-red-400 block mb-0.5">System Error</strong>
                            <span className="text-sm">{globalError}</span>
                        </div>
                    </motion.div>
                )}
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 glass-panel rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-900 rounded-2xl flex items-center justify-center text-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-400/30 relative group">
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-500"></div>
                            <SpartaLogo className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white drop-shadow-lg">
                                STRATOS<span className="text-emerald-400">.AI</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                </span>
                                <p className="text-emerald-500/80 text-xs sm:text-sm font-mono tracking-widest uppercase font-semibold">
                                    System Online • v24.0.1
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto relative z-10">
                        <div className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 shadow-inner">
                            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Synergy</span>
                            <div className="text-lg font-mono font-bold text-emerald-400">
                                {Math.min(100, getActiveServicesCount() * 10)}<span className="text-emerald-500/50 text-sm ml-1">%</span>
                            </div>
                        </div>

                        <div className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 shadow-inner">
                            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Bankroll</span>
                            <div className="flex items-center">
                                <span className="text-emerald-500 font-mono mr-1.5 font-bold">$</span>
                                <input
                                    type="number"
                                    value={bankroll}
                                    step="10"
                                    min="100"
                                    className="bg-transparent font-mono text-2xl font-bold w-28 text-right focus:outline-none focus:text-emerald-400 transition-colors text-white"
                                    onChange={(e) => saveBankroll(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 shadow-inner">
                            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Win Rate</span>
                            <div className="text-3xl font-mono font-bold text-white">
                                {successRate}<span className="text-emerald-500 text-xl ml-1">%</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex justify-center mb-12 relative z-10">
                    <div className="glass-panel p-1.5 rounded-2xl flex gap-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                        
                        {[
                            { id: 'SPARTA', label: 'SPARTA LOGIC', icon: SpartaLogo },
                            { id: 'UPCOMING', label: 'LIVE & UPCOMING', icon: Calendar },
                            { id: 'INTELLIGENCE', label: 'AI AGENTS', icon: Bot },
                            { id: 'PERFORMANCE', label: 'PERFORMANCE', icon: Activity },
                            { id: 'SETTINGS', label: 'API SETTINGS', icon: ShieldCheck }
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => setMode(item.id as any)}
                                className={`relative z-10 px-6 py-3 rounded-xl font-bold text-[10px] tracking-[0.2em] transition-all duration-500 flex items-center gap-2 uppercase ${
                                    mode === item.id 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <item.icon className={`w-3.5 h-3.5 ${mode === item.id ? 'text-emerald-400' : 'text-gray-600'}`} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === 'SPARTA' && (
                            <SpartaMode 
                                phase={phase}
                                matchInput={matchInput}
                                setMatchInput={setMatchInput}
                                isLoading={isLoading}
                                loadingStep={loadingStep}
                                initializeStratos={initializeStratos}
                                stratosResult={stratosResult}
                                spartaMatrix={spartaMatrix}
                                combatResult={combatResult}
                                runCombat={runCombat}
                                resetSparta={() => {
                                    setPhase('STRATOS');
                                    setSpartaMatrix(null);
                                    setStratosResult(null);
                                    setCombatResult(null);
                                    setMatchInput("");
                                }}
                            />
                        )}
                        {mode === 'UPCOMING' && (
                            <UpcomingMode 
                                isLoading={isLoading}
                                loadingStep={loadingStep}
                                upcomingMatches={upcomingMatches}
                                fetchUpcoming={fetchUpcoming}
                                analyzeMatch={analyzeMatch}
                                predictions={predictions}
                                resolvePrediction={resolvePrediction}
                                deletePrediction={deletePrediction}
                                copyPrediction={copyPrediction}
                                simulateInSparta={(match) => {
                                    setMatchInput(`${match.home} vs ${match.away}`);
                                    setPhase('STRATOS');
                                    setSpartaMatrix(null);
                                    setStratosResult(null);
                                    setCombatResult(null);
                                    setMode('SPARTA');
                                }}
                            />
                        )}
                        {mode === 'SETTINGS' && <SettingsMode />}
                        {mode === 'PERFORMANCE' && <PerformanceMode predictions={predictions} bankroll={bankroll} />}
                        {mode === 'INTELLIGENCE' && <IntelligenceMode />}
                    </motion.div>
                </AnimatePresence>

                {/* FOOTER */}
                <footer className="mt-20 text-center text-xs text-gray-600 pb-12 font-mono flex flex-col items-center gap-4">
                    <button onClick={clearHistory} className="hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300 border border-white/5 rounded-lg px-6 py-2 tracking-widest uppercase">PURGE SYSTEM DATA</button>
                    <p className="tracking-widest opacity-50">STRATOS.AI // SPARTA PROTOCOL // T-MINUS 60M</p>
                </footer>
            </div>

            {/* TOAST */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className={`fixed bottom-8 right-8 backdrop-blur-xl border ${
                            toast.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-50' : 
                            toast.type === 'info' ? 'bg-blue-950/80 border-blue-500/30 text-blue-50' :
                            'bg-black/80 border-emerald-500/30 text-emerald-50'
                        } px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-mono text-sm`}
                    >
                        {toast.type === 'error' ? (
                            <ShieldCheck className="w-5 h-5 text-red-400" />
                        ) : toast.type === 'info' ? (
                            <Activity className="w-5 h-5 text-blue-400" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        )}
                        <span className="tracking-wide">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </QueryClientProvider>
    );
}
