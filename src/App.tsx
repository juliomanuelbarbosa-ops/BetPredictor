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

            for (let i = 0; i < games.slice(0, 10).length; i++) {
                const game = games[i];
                setLoadingStep(`Analyzing match ${i + 1} of ${Math.min(games.length, 10)}: ${game.home} vs ${game.away}...`);
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
                    parseFloat(homeAdv.Clean_Sheet_Probability), parseFloat(awayAdv.Clean_Sheet_Probability)
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
        <div className="bg-gradient-to-br from-gray-950 to-black text-gray-100 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {globalError && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
                        <strong>Error:</strong> {globalError}
                    </div>
                )}
                
                {/* HEADER */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                            AI
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Bet Predictor AI
                            </h1>
                            <p className="text-emerald-300/80 text-sm sm:text-base mt-1">
                                v23 • 100% Free • Real APIs Activated
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-5 py-3">
                            <span className="text-xs text-gray-400 whitespace-nowrap">Bankroll</span>
                            <input
                                type="number"
                                value={bankroll}
                                step="10"
                                min="100"
                                className="bg-transparent font-mono text-xl w-28 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded px-2 py-1"
                                onChange={(e) => saveBankroll(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-gray-400">Success Rate</div>
                            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                                {successRate}%
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex justify-center mb-8">
                    <div className="bg-gray-900 p-1 rounded-xl flex gap-1 border border-gray-800">
                        <button 
                            onClick={() => setMode('SPARTA')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'SPARTA' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                            SPARTA LOGIC
                        </button>
                        <button 
                            onClick={() => setMode('BATCH')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'BATCH' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                            BATCH ODDS
                        </button>
                    </div>
                </div>

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

                {/* FOOTER */}
                <footer className="mt-16 text-center text-xs text-gray-600 pb-8">
                    <button onClick={clearHistory} className="hover:text-gray-400 transition-colors">Clear All History & Reset</button>
                    <p className="mt-3">v24 • March 5, 2026 • Sparta Logic & Combat Phase Protocols Active</p>
                </footer>
            </div>

            {/* TOAST */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="fixed bottom-6 right-6 bg-emerald-700/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
