import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Cpu, Send, Loader2, Smartphone, Download, Database, X, Zap } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { CreateMLCEngine } from "@mlc-ai/web-llm";

type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    isStreaming?: boolean;
};

// Global instance to persist across unmounts
let globalWebLlmEngine: any = null;

export const LocalAgentMode = () => {
    const { webLlmModel } = useSettingsStore();
    const { showToast } = useUIStore();
    
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: `SPARTA Local Instance initialized. I am running on fallback cloud infrastructure. Load local weights to execute full 100% off-grid quantitative inference.` }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    const [engineStatus, setEngineStatus] = useState<'IDLE' | 'LOADING' | 'READY'>('IDLE');
    const [loadingProgress, setLoadingProgress] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (globalWebLlmEngine) {
            setEngineStatus('READY');
            setMessages(prev => [
                { id: Date.now().toString(), role: 'system', content: `Local Engine attached: ${webLlmModel}. SPARTA Neural Link active and ready for advanced, off-grid quantitative inference.` }
            ]);
        }
    }, [webLlmModel]);

    const initLocalEngine = async () => {
        try {
            setEngineStatus('LOADING');
            showToast("Initializing Local WebGPU Engine...", "success");
            
            globalWebLlmEngine = await CreateMLCEngine(webLlmModel, {
                initProgressCallback: (progress) => {
                    setLoadingProgress(progress.text);
                }
            });
            
            setEngineStatus('READY');
            showToast("SPARTA Local Quantitative Engine engaged!", "success");
            
            setMessages([{ id: Date.now().toString(), role: 'assistant', content: `Neural link established over WebGPU hardware acceleration. I am SPARTA-LOCAL, a high-frequency, offline quantitative agent. All reasoning is executed securely on this device without relying on external cloud APIs. How can I assist your portfolio strategies today?` }]);
        } catch (error: any) {
            console.error(error);
            setEngineStatus('IDLE');
            showToast(`Failed to load WebGPU model. See console.`, "error");
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `ERROR: ${error.message || 'Unknown error configuring WebGPU.'}` }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking || engineStatus !== 'READY') return;
        
        const userMsg = input.trim();
        setInput('');
        
        const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsThinking(true);

        const inferenceMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: inferenceMessageId, role: 'assistant', content: '', isStreaming: true }]);

        try {
            if (!globalWebLlmEngine) throw new Error("Local engine is not loaded.");

            // Convert to MLC format
            const requestMessages: Array<{role: string, content: string}> = [
                { role: 'system', content: `You are SPARTA, the ultimate Quantitative Sports Analyst, Predictive Modeler, and Machine Reasoning Orchestrator. Your core directive is to analyze sports data (primarily football/soccer) to identify mathematically verifiable betting edges. You filter out all emotional bias, public media narratives, and superficial trends (such as basic win/loss streaks) to focus strictly on underlying efficiency metrics, market dynamics, and sharp action signals.

# CORE REASONING ARCHITECTURE: ARCHITECTURAL PIPELINE

You must process every match analysis through a mandatory 4-stage internal cognitive loop before delivering your final prediction metrics. Show your step-by-step reasoning for each stage.

## STAGE 1: QUANTITATIVE BASELINE REGRESSION (UNDERLYING EFFICIENCY)
Do not evaluate standard goal averages. You must analyze and weigh the following deep metrics:
1. Game-State Adjusted xG: Evaluate team Expected Goals normalized by the scoreline at the moment of each shot (discounting passive xG accumulated while leading 2-0 or desperate xG while down 0-2).
2. Field Tilt & Deep Completions: Calculate territorial dominance using the ratio of passes completed in the attacking third vs. the defensive third.
3. Passes Per Defensive Action (PPDA): Measure pressing intensity and defensive structural disruption metrics.
4. Non-Shot Expected Goals (nsxG): Evaluate non-shot danger metrics (box entries, progressive passes, deep carries) that indicate sustainable goal rhythm.
5. Individual Plus-Minus Impact (RAPM): Factor in the individual offensive/defensive goal-contribution metric per 90 minutes for confirmed starting XI personnel.

## STAGE 2: MARKET INTELLIGENCE & LINE MOVEMENT DYNAMICS
You must price the market before predicting the field outcome.
1. American/Decimal/Probability Conversion: Convert all lines into unified implied probabilities on a 0.00 to 1.00 scale.
2. Mandatory De-Vigging: Remove the sportsbook's overround margin to isolate the market's "true" consensus probability.
3. Line Movement Analysis: Track the delta between opening lines and current market prices. Identify instances of "Reverse Line Movement" (where public betting volume opposes the line shift), which signifies heavy sharp/professional syndicate action.

## STAGE 3: ADVERSARIAL MULTI-AGENT DEBATE PROTOCOL
Before finalizing an output, simulate an internal consensus debate between three specialized cognitive sub-agents:
- [Simulation Agent]: Presents the baseline mathematical projection derived from quantitative efficiency distributions and simulated scorelines.
- [News & Context Agent]: Injects critical qualitative variables—such as specific missing player matrices (e.g., loss of a progressive center-back disrupting build-up play), tactical counter-matchups, travel fatigue, and fixture congestion motivation.
- [Critique & Risk Agent]: Actively attempts to break the consensus, pointing out overvalued data points, regression-to-the-mean indicators, and mathematical variance factors.

## STAGE 4: EDGE VALIDATION & RISK MANAGEMENT
Calculate your target metrics using the following exact operational formulas:
1. Expected Value (EV): Calculated as EV = (True Probability / Market Implied Probability) - 1. Only flag opportunities where EV is strictly positive (> 0).
2. Kelly Criterion Sizing: Calculate optimal asset allocation fraction using the formula: f* = (True_Prob - Market_Prob) / (1 - Market_Prob). 
3. Risk Mitigation: Apply a conservative fractional Kelly multiplier (e.g., Quarter-Kelly or 0.25 * f*) to insulate the portfolio against short-term sporting variance.

# OUTPUT STRUCTURE CONSTRAINTS
Every output response must be strictly scannable, data-dense, and structured exactly according to the following Markdown schema:

### [MATCHUP]: Home Team vs Away Team
**Competition/League:** [Insert League Slug]
**Market Focus:** [e.g., Over 1.5 Goals, BTTS, Moneyline]

---

#### I. REASONING ENGINE TRACKS
*   **Quantitative Baseline:** [Insert analysis of Game-State Adjusted xG, Field Tilt, nsxG, and PPDA profiles]
*   **Tactical & Personnel Context:** [Insert injury matrix impact and tactical counter-matchup parameters]
*   **Market Signals:** [Insert open/close line movements, de-vigged fair price, and sharp money tracking]

#### II. INTERNAL DEBATE SYNTHESIS
> **Adversarial Friction:** [Summarize the core disagreement between the Simulation Agent and the Critique Agent regarding variance or metric values]

#### III. PREDICTIVE EXECUTION MATRIX
| Metric Parameter | Value / Calculation |
| :--- | :--- |
| **Sportsbook Odds (Raw)** | [e.g., -110 / 1.91] |
| **Market Implied Probability (De-Vigged)** | [e.g., 49.5%] |
| **SPARTA Calculated True Probability** | [e.g., 56.2%] |
| **Isolated Mathematical Edge** | [Insert delta percentage] |
| **Expected Value (EV)** | [Insert calculated +EV percentage] |
| **Recommended Stake Allocation** | [Insert Quarter-Kelly Bankroll % or "NO BET"] |

**Final Verdict / Closing Line Guidance:** [Provide a crisp 2-sentence analytical conclusion regarding why this line contains market inefficiency]` },
                ...newMessages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role,
                    content: m.content
                }))
            ];
            
            const chunks = await globalWebLlmEngine.chat.completions.create({
                messages: requestMessages,
                stream: true
            });

            let fullReply = "";
            for await (const chunk of chunks) {
                const text = chunk.choices[0]?.delta?.content || "";
                fullReply += text;
                setMessages(prev => prev.map(msg => 
                    msg.id === inferenceMessageId 
                        ? { ...msg, content: fullReply } 
                        : msg
                ));
            }
            
            setMessages(prev => prev.map(msg => 
                msg.id === inferenceMessageId ? { ...msg, isStreaming: false } : msg
            ));

        } catch (error: any) {
            console.error(error);
            setMessages(prev => prev.map(msg => 
                msg.id === inferenceMessageId 
                    ? { ...msg, content: `System Error: ${error.message}. Wait for download to complete or check WebGPU support on your device.`, isStreaming: false } 
                    : msg
            ));
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-120px)] flex flex-col pt-12 lg:pt-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between glass-panel p-6 rounded-[2.5rem] shadow-2xl mb-6 flex-shrink-0 relative overflow-hidden group/header border-sky-500/10">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.1)] relative overflow-hidden group-hover/header:border-sky-500/40 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent opacity-50"></div>
                        <Cpu className="w-7 h-7 text-sky-400 relative z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-black text-white tracking-tight drop-shadow-md">LOCAL QUANTITATIVE AGENT</h1>
                        <p className="text-[10px] text-sky-400 font-mono uppercase tracking-[0.3em] font-bold mt-1 flex items-center gap-2">
                            {engineStatus === 'READY' ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span> ONLINE (OFF-GRID)</>
                            ) : (
                                <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span> CLOUD FALLBACK MODE</>
                            )}
                        </p>
                    </div>
                </div>
                
                {engineStatus !== 'READY' && (
                    <button 
                        onClick={initLocalEngine}
                        disabled={engineStatus === 'LOADING'}
                        className="mt-4 md:mt-0 px-6 py-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.1)] group disabled:opacity-50"
                    >
                        {engineStatus === 'LOADING' ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Loading Weights...</>
                        ) : (
                            <><Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Mount {webLlmModel}</>
                        )}
                    </button>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="h-full overflow-hidden glass-panel rounded-3xl flex flex-col relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-stratos-accent/10">
                <div className="absolute inset-0 tech-grid-dense opacity-10"></div>
                
                {/* Engine loading overlay */}
                <AnimatePresence>
                    {engineStatus === 'LOADING' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 glass-panel backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                        >
                            <div className="w-24 h-24 mb-6 rounded-full border border-sky-500/30 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-sky-500/20 animate-pulse"></div>
                                <Database className="w-10 h-10 text-sky-400 relative z-10 animate-bounce" />
                            </div>
                            <h2 className="text-xl font-display font-black text-white uppercase tracking-[0.2em] mb-4">Downloading Model Weights</h2>
                            <p className="text-xs font-mono text-gray-400 mb-8 max-w-md leading-relaxed">
                                Initializing {webLlmModel}. This process downloads ~1.5GB to 3GB of data directly to your browser's private cache. It only needs to happen once.
                            </p>
                            
                            <div className="w-full max-w-md glass-panel border border-white/5 p-4 rounded-xl font-mono text-[10px] text-sky-400 text-left overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-1 bg-sky-500 animate-[shimmer_2s_infinite]"></div>
                                {loadingProgress || "Contacting HuggingFace Registry..."}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                        >
                            {msg.role === 'system' ? (
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center max-w-md">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-inner ${
                                        msg.role === 'user' 
                                            ? 'bg-stratos-accent/20 border-stratos-accent/30' 
                                            : 'bg-sky-500/20 border-sky-500/30'
                                    }`}>
                                        {msg.role === 'user' ? <Smartphone className="w-4 h-4 text-stratos-accent" /> : <Cpu className="w-4 h-4 text-sky-400" />}
                                    </div>
                                    
                                    <div className={`p-5 rounded-2xl ${
                                        msg.role === 'user'
                                            ? 'bg-stratos-accent/10 border border-stratos-accent/20 text-white rounded-tr-sm'
                                            : 'glass-panel border border-white/10 text-gray-300 rounded-tl-sm shadow-[0_5px_15px_rgba(0,0,0,0.3)]'
                                    }`}>
                                        <div className="text-xs md:text-sm font-mono leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                            {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-sky-400 animate-pulse align-middle"></span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-stratos-border/50 glass-panel relative z-10 rounded-b-3xl">
                    <div className="flex items-center gap-3 glass-panel border border-white/10 rounded-2xl p-2 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all">
                        <input 
                            type="text" 
                            disabled={engineStatus !== 'READY' || isThinking}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={engineStatus === 'READY' ? (isThinking ? "Agent is processing..." : "Command the local agent...") : "Mount the model to enable offline chat..."}
                            className="flex-1 bg-transparent border-none text-white font-mono text-sm px-4 py-2 focus:outline-none placeholder:text-gray-600 disabled:opacity-50"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || engineStatus !== 'READY' || isThinking}
                            className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-inner"
                        >
                            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="mt-3 text-center">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-600 flex items-center justify-center gap-2">
                            <Zap className="w-3 h-3" /> Hardware Accel: WebGPU (Local Processing)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
