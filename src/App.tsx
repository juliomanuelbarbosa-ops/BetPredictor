import React, { useState, useEffect, useRef } from 'react';
import { Brain, CloudLightning, CheckCircle, Copy, UploadCloud } from 'lucide-react';
import { recognizeText } from './lib/ocr';
import { calculateStake } from './lib/utils';
import { getWeather, getRealOdds, getBetStackData, getBizzoPrediction, getGameForecast, getBytezAnalysis, getPlayerMetrics, getAdvancedMetrics } from './lib/api';
import { predictWithModel, createAndTrainModel } from './lib/ai';
import { initializeSpartaMatrix, runMonteCarlo, applyCombatPenalties, analyzeLineupScreenshot } from './lib/spartaSim';
import { footballData } from './lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { SpartaMode } from './components/SpartaMode';
import { BatchMode } from './components/BatchMode';

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
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [phase, setPhase] = useState<'STRATOS' | 'COMBAT'>('STRATOS');
    const [matchInput, setMatchInput] = useState("");
    const [spartaMatrix, setSpartaMatrix] = useState<any>(null);
    const [stratosResult, setStratosResult] = useState<any>(null);
    const [combatResult, setCombatResult] = useState<any>(null);
    const [lineupAnalysis, setLineupAnalysis] = useState<any>(null);

    const [mode, setMode] = useState<'SPARTA' | 'BATCH'>('SPARTA');

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
    }, []);

    const saveBankroll = (val: number) => {
        setBankroll(val);
        localStorage.setItem('bankroll', val.toString());
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const initializeStratos = async () => {
        if (!matchInput) {
            showToast("Please enter a match name.");
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
            showToast("Stratos Phase Complete. Awaiting Lineup Screenshot.");
        } catch (err: any) {
            showToast("Error: " + err.message);
            setGlobalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const processLineupScreenshot = async (file: File) => {
        if (!spartaMatrix) {
            showToast("Please initialize Stratos phase first.");
            return;
        }
        
        setIsLoading(true);
        setLoadingStep("Extracting Starting XI from SofaScore/FlashScore...");
        setGlobalError(null);

        try {
            const analysis = await analyzeLineupScreenshot(file);
            setLineupAnalysis(analysis);
            
            setLoadingStep("Applying FM Penalty Logic for missing A-Tier players...");
            const updatedMatrix = applyCombatPenalties(spartaMatrix, analysis);
            setSpartaMatrix(updatedMatrix);
            
            setLoadingStep("Re-running 10,000-iteration simulation with Combat constraints...");
            // Simulate a short delay for UI
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const result = runMonteCarlo(updatedMatrix, 10000);
            setCombatResult(result);
            
            setPhase('COMBAT');
            showToast("Combat Phase Complete! Final predictions ready.");
        } catch (err: any) {
            showToast("Error: " + err.message);
            setGlobalError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        if (mode === 'SPARTA' && spartaMatrix) {
            await processLineupScreenshot(file);
        } else if (mode === 'BATCH') {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setIsLoading(true);
        setLoadingStep("Extracting matches from screenshot...");
        setPredictions([]);
        setGlobalError(null);

        try {
            const games = await recognizeText(file);
            
            if (!games || games.length === 0) {
                throw new Error("No matches found in image.");
            }

            let league = 'soccer_epl';
            const firstGameText = (games[0].home + " " + games[0].away).toLowerCase();
            for (let k in leagueMap) {
                if (firstGameText.includes(k)) {
                    league = leagueMap[k].oddsKey;
                    break;
                }
            }

            const newPredictions = [];
            
            // Ensure historical data is loaded before processing
            await createAndTrainModel((msg) => setLoadingStep(msg));

            for (let i = 0; i < games.length; i++) {
                const game = games[i];
                setLoadingStep(`Analyzing match ${i + 1} of ${games.length}: ${game.home} vs ${game.away}...`);
                const city = cityMap[game.home] || "London";
                const weather = await getWeather(city);
                const odds = await getRealOdds(game.home, game.away, league);
                const betstack = await getBetStackData(league);
                const bizzo = await getBizzoPrediction(game.home, game.away);
                const forecast = await getGameForecast();
                
                setLoadingStep(`Generating tactical insight for ${game.home} vs ${game.away}...`);
                const bytezAnalysis = await getBytezAnalysis(game.home, game.away, weather, odds, betstack);

                // Fetch real historical form and H2H data
                const homeForm = footballData.getTeamForm(game.home);
                const awayForm = footballData.getTeamForm(game.away);
                const h2h = footballData.getH2H(game.home, game.away);
                
                // Fetch player metrics
                const homePlayerMetrics = await getPlayerMetrics(game.home);
                const awayPlayerMetrics = await getPlayerMetrics(game.away);
                
                // Fetch advanced metrics
                const homeAdv = await getAdvancedMetrics(game.home);
                const awayAdv = await getAdvancedMetrics(game.away);

                const features = [
                    game.oddsH || odds.avgH || 2.5, 
                    game.oddsD || odds.avgD || 3.5, 
                    game.oddsA || odds.avgA || 3.5,
                    homeForm.pts, awayForm.pts,
                    homeForm.gs, awayForm.gs,
                    homeForm.gc, awayForm.gc,
                    homeForm.sot, awayForm.sot,
                    h2h.homeWins, h2h.awayWins, h2h.draws,
                    1, // Home advantage
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

                const implied = 1 / (game.oddsH || 2.5);
                const edge = Math.round((probs[bestIndex] - implied) * 100);
                const valueText = edge > 3 ? `✅ +${edge}% EDGE` : "";

                const predScore = `${Math.round(1.3 + probs[0]*1.8)}-${Math.round(1.0 + probs[2]*1.6)}`;
                const stake = calculateStake(confidence, edge);

                newPredictions.push({
                    game, probs, bestBet, confidence, edge, valueText, predScore, stake, features, actual: null, bytezAnalysis
                });
            }

            setPredictions(newPredictions);
            showToast("Analysis complete!");
        } catch (err: any) {
            showToast("Error: " + err.message);
            setGlobalError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyPrediction = (pred: any) => {
        navigator.clipboard.writeText(`${pred.game.home} vs ${pred.game.away}: ${pred.bestBet} (${pred.confidence}%)`);
        showToast("Copied to clipboard!");
    };

    const clearHistory = () => {
        localStorage.clear();
        setBankroll(1000);
        setTotalCorrect(0);
        setTotalGames(0);
        setPredictions([]);
        showToast("History cleared!");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        
        if (mode === 'SPARTA' && phase === 'STRATOS' && spartaMatrix) {
            await processLineupScreenshot(file);
        } else if (mode === 'BATCH') {
            await processFile(file);
        }
    };

    const successRate = totalGames > 0 ? Math.round((totalCorrect / totalGames) * 100) : 0;

    return (
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
                            <Brain className="w-8 h-8 text-white relative z-10" />
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
                    <div className="glass-panel p-2 rounded-2xl flex gap-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                        <button 
                            onClick={() => setMode('SPARTA')}
                            className={`relative z-10 px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all duration-500 ${mode === 'SPARTA' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
                        >
                            SPARTA LOGIC
                        </button>
                        <button 
                            onClick={() => setMode('BATCH')}
                            className={`relative z-10 px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all duration-500 ${mode === 'BATCH' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
                        >
                            BATCH ODDS
                        </button>
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
                        {mode === 'SPARTA' ? (
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
                                lineupAnalysis={lineupAnalysis}
                                isDragging={isDragging}
                                handleDragOver={handleDragOver}
                                handleDragLeave={handleDragLeave}
                                handleDrop={handleDrop}
                                handleFileChange={handleFileChange}
                                resetSparta={() => {
                                    setPhase('STRATOS');
                                    setSpartaMatrix(null);
                                    setStratosResult(null);
                                    setCombatResult(null);
                                    setLineupAnalysis(null);
                                    setMatchInput("");
                                }}
                            />
                        ) : (
                            <BatchMode 
                                isLoading={isLoading}
                                loadingStep={loadingStep}
                                isDragging={isDragging}
                                handleDragOver={handleDragOver}
                                handleDragLeave={handleDragLeave}
                                handleDrop={handleDrop}
                                handleFileChange={handleFileChange}
                                predictions={predictions}
                            />
                        )}
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
                        className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-50 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.2)] flex items-center gap-3 z-50 font-mono text-sm"
                    >
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="tracking-wide">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
