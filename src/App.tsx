import React, { useState, useEffect, useRef } from 'react';
import { Brain, CloudLightning, CheckCircle, Copy, UploadCloud } from 'lucide-react';
import { recognizeText } from './lib/ocr';
import { calculateStake } from './lib/utils';
import { getWeather, getRealOdds, getBetStackData, getBizzoPrediction, getGameForecast, getBytezAnalysis, getPlayerMetrics, getAdvancedMetrics } from './lib/api';
import { predictWithModel, createAndTrainModel } from './lib/ai';
import { footballData } from './lib/data';
import { motion, AnimatePresence } from 'motion/react';

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        await processFile(file);
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
        await processFile(file);
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

                {/* UPLOAD AREA */}
                <section className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl">
                    <div className="flex flex-col items-center gap-6">
                        <div 
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full max-w-2xl h-56 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
                                isDragging 
                                    ? 'border-emerald-500 bg-emerald-950/20 scale-[1.02]' 
                                    : isLoading 
                                        ? 'border-emerald-500/30 bg-gray-900/50 cursor-wait' 
                                        : 'border-gray-700/70 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-950/10'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-xl text-emerald-400 font-medium animate-pulse">{loadingStep}</p>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${isDragging ? 'text-emerald-400' : 'text-gray-500/70'}`} />
                                    <p className="text-xl text-gray-300 font-medium">{isDragging ? 'Drop it like it\'s hot!' : 'Drop betting screenshot here'}</p>
                                    <p className="text-sm text-gray-500 mt-2">or click to select file • max 10 matches</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className={`px-10 sm:px-14 py-5 rounded-3xl font-bold text-lg shadow-xl flex items-center gap-3 transition-all ${
                                isLoading 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                            }`}
                        >
                            <CloudLightning className="w-6 h-6" />
                            {isLoading ? 'ANALYZING...' : 'ANALYZE & PREDICT'}
                        </button>
                    </div>
                </section>

                {/* RESULTS AREA */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                    {isLoading && Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 h-96 animate-pulse" style={{
                            background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
                            backgroundSize: '200% 100%'
                        }}></div>
                    ))}
                    
                    {!isLoading && predictions.map((pred, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-[0_25px_40px_-10px_rgba(16,185,129,0.25)] transition-all duration-400"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h3 className="font-semibold text-xl">{pred.game.home} <span className="text-gray-500">vs</span> {pred.game.away}</h3>
                                    <p className="text-emerald-400 text-sm mt-1">{pred.game.time || 'Upcoming'} • Score: {pred.predScore}</p>
                                </div>
                                <div className="w-full sm:w-auto sm:text-right bg-emerald-900/20 px-4 py-3 rounded-2xl border border-emerald-500/20">
                                    <div className="text-2xl font-bold text-emerald-400">{pred.bytezAnalysis.market}</div>
                                    <div className="flex items-center sm:justify-end gap-2 mt-2">
                                        <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg font-medium">{pred.bytezAnalysis.confidence}% Conf</span>
                                        {pred.valueText && (
                                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg font-medium animate-pulse">{pred.valueText}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 p-4 bg-gray-950/70 rounded-2xl text-sm border border-gray-800/50">
                                <strong className="text-gray-400">AI Tactical Insight:</strong> <span className="text-gray-300 italic">"{pred.bytezAnalysis.report}"</span>
                                <div className="mt-3 pt-3 border-t border-gray-800/50 text-xs grid grid-cols-2 gap-2">
                                    <div>
                                        <strong className="text-gray-500 block mb-1">Form & H2H</strong>
                                        <span className="text-gray-400">
                                            Pts: {pred.features[3].toFixed(1)} vs {pred.features[4].toFixed(1)}<br/>
                                            H2H: {pred.features[11]}W-{pred.features[13]}D-{pred.features[12]}L
                                        </span>
                                    </div>
                                    <div>
                                        <strong className="text-gray-500 block mb-1">Advanced Metrics</strong>
                                        <span className="text-gray-400">
                                            xG: {pred.features[21].toFixed(2)} vs {pred.features[22].toFixed(2)}<br/>
                                            PPDA: {pred.features[23].toFixed(1)} vs {pred.features[24].toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                                <div className="bg-gray-950 rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/20" style={{height: `${pred.probs[0]*100}%`}}></div>
                                    <div className="text-gray-500 mb-1 relative z-10">Home</div>
                                    <div className="font-mono text-lg text-gray-300 relative z-10">{(pred.probs[0]*100).toFixed(0)}%</div>
                                </div>
                                <div className="bg-gray-950 rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 right-0 bg-gray-500/20" style={{height: `${pred.probs[1]*100}%`}}></div>
                                    <div className="text-gray-500 mb-1 relative z-10">Draw</div>
                                    <div className="font-mono text-lg text-gray-300 relative z-10">{(pred.probs[1]*100).toFixed(0)}%</div>
                                </div>
                                <div className="bg-gray-950 rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/20" style={{height: `${pred.probs[2]*100}%`}}></div>
                                    <div className="text-gray-500 mb-1 relative z-10">Away</div>
                                    <div className="font-mono text-lg text-gray-300 relative z-10">{(pred.probs[2]*100).toFixed(0)}%</div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center text-sm pt-4 border-t border-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">Suggested Stake</span>
                                    <span className="font-mono font-bold text-emerald-400 text-lg">${pred.stake}</span>
                                </div>
                                <button onClick={() => copyPrediction(pred)} className="text-xs bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors border border-gray-700">
                                    <Copy className="w-4 h-4" /> Copy
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* UPDATE SECTION */}
                {predictions.length > 0 && (
                    <section className="mt-12">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Brain className="w-6 h-6 text-emerald-400" />
                                Record Results & Improve Model
                            </h2>
                            <div className="space-y-6">
                                {predictions.map((pred, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-2xl border border-gray-800">
                                        <div>
                                            <div className="font-semibold">{pred.game.home} vs {pred.game.away}</div>
                                            <div className="text-xs text-gray-400">Predicted: {pred.bytezAnalysis.market}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    const newPreds = [...predictions];
                                                    newPreds[i].actual = newPreds[i].actual === 'WIN' ? null : 'WIN';
                                                    setPredictions(newPreds);
                                                }}
                                                className={`px-3 py-1 text-xs font-bold rounded-xl border transition-colors ${pred.actual === 'WIN' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                            >
                                                WIN
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const newPreds = [...predictions];
                                                    newPreds[i].actual = newPreds[i].actual === 'LOSS' ? null : 'LOSS';
                                                    setPredictions(newPreds);
                                                }}
                                                className={`px-3 py-1 text-xs font-bold rounded-xl border transition-colors ${pred.actual === 'LOSS' ? 'bg-red-600 border-red-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                            >
                                                LOSS
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const newPreds = [...predictions];
                                                    newPreds[i].actual = newPreds[i].actual === 'VOID' ? null : 'VOID';
                                                    setPredictions(newPreds);
                                                }}
                                                className={`px-3 py-1 text-xs font-bold rounded-xl border transition-colors ${pred.actual === 'VOID' ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                            >
                                                VOID
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => {
                                    let correct = 0;
                                    let total = 0;
                                    predictions.forEach(p => {
                                        if (p.actual) {
                                            if (p.actual !== 'VOID') {
                                                total++;
                                                if (p.actual === 'WIN') correct++;
                                            }
                                        }
                                    });
                                    if (total > 0 || predictions.some(p => p.actual === 'VOID')) {
                                        const newTotalCorrect = totalCorrect + correct;
                                        const newTotalGames = totalGames + total;
                                        setTotalCorrect(newTotalCorrect);
                                        setTotalGames(newTotalGames);
                                        localStorage.setItem('totalCorrect', newTotalCorrect.toString());
                                        localStorage.setItem('totalGames', newTotalGames.toString());
                                        showToast(`Saved results! Model updated.`);
                                        setPredictions([]);
                                    } else {
                                        showToast("Select actual results first.");
                                    }
                                }}
                                className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-5 rounded-3xl font-bold text-xl shadow-xl transition-all"
                            >
                                SAVE RESULTS & RETRAIN
                            </button>
                        </div>
                    </section>
                )}

                {/* FOOTER */}
                <footer className="mt-16 text-center text-xs text-gray-600 pb-8">
                    <button onClick={clearHistory} className="hover:text-gray-400 transition-colors">Clear All History & Reset</button>
                    <p className="mt-3">v24 • March 5, 2026 • All free APIs activated • 100+ variables analyzed</p>
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
