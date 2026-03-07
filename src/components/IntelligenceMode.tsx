import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Terminal, Cpu, Zap, Shield, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface Message {
    id: string;
    role: 'user' | 'agent';
    agentName?: string;
    content: string;
    timestamp: Date;
}

interface Agent {
    id: string;
    name: string;
    role: string;
    description: string;
    icon: any;
    color: string;
    systemInstruction: string;
}

const AGENTS: Agent[] = [
    {
        id: 'market-analyst',
        name: 'ARES-1',
        role: 'Market Analyst',
        description: 'Analyzes global betting trends and market movements.',
        icon: TrendingUp,
        color: 'text-blue-400',
        systemInstruction: "You are ARES-1, a high-level market analyst agent for the STRATOS.AI platform. Your specialty is identifying market inefficiencies and betting trends. Provide technical, data-driven insights. Keep responses concise and professional."
    },
    {
        id: 'risk-manager',
        name: 'PALLAS',
        role: 'Risk Manager',
        description: 'Audits bankroll exposure and suggests staking strategies.',
        icon: Shield,
        color: 'text-emerald-400',
        systemInstruction: "You are PALLAS, the risk management agent for STRATOS.AI. Your goal is capital preservation. Analyze user queries regarding bankroll, stakes, and exposure. Be conservative and mathematically rigorous."
    },
    {
        id: 'data-scout',
        name: 'HERMES',
        role: 'Data Scout',
        description: 'Fetches real-time context and historical data points.',
        icon: Search,
        color: 'text-purple-400',
        systemInstruction: "You are HERMES, the data retrieval agent for STRATOS.AI. You specialize in fetching and summarizing historical match data, injuries, and weather conditions. Use a structured, scannable format for data."
    }
];

export function IntelligenceMode() {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const runQuickAction = (action: string) => {
        let prompt = "";
        if (action === 'audit') {
            prompt = "Perform a quick audit of the current market conditions and identify any high-level inefficiencies.";
        } else if (action === 'risk') {
            prompt = "Analyze the risk profile of a standard 2% bankroll allocation given current market volatility.";
        }
        setInput(prompt);
        // We don't auto-send to give user a chance to edit, or we could auto-send.
        // Let's auto-send for better UX.
        setTimeout(() => handleSend(prompt), 100);
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!overrideInput) setInput("");
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: textToSend,
                config: {
                    systemInstruction: selectedAgent.systemInstruction,
                    temperature: 0.7,
                }
            });

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                agentName: selectedAgent.name,
                content: response.text || "I encountered a processing error. Please re-transmit.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMsg]);
        } catch (error: any) {
            console.error("Agent Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                agentName: 'SYSTEM',
                content: `ERROR: ${error.message || "Connection to Stratos Core lost."}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <section className="mt-12 animate-in fade-in duration-700 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
                {/* AGENT SELECTION */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">AI Agents</h2>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Intelligence</p>
                        </div>
                    </div>

                    {AGENTS.map((agent) => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                                selectedAgent.id === agent.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-black/40 border-white/5 hover:border-white/10'
                            }`}
                        >
                            {selectedAgent.id === agent.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                            )}
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center border border-white/10 ${agent.color}`}>
                                    <agent.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-white tracking-wider">{agent.name}</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">{agent.role}</div>
                                </div>
                            </div>
                            <p className="mt-3 text-[10px] text-gray-500 leading-relaxed relative z-10 group-hover:text-gray-400 transition-colors">
                                {agent.description}
                            </p>
                        </button>
                    ))}

                    <div className="mt-8 p-4 bg-black/60 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Cpu className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Core Status</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-gray-600">Latency</span>
                                <span className="text-[9px] font-mono text-emerald-400">12ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-gray-600">Model</span>
                                <span className="text-[9px] font-mono text-emerald-400">Gemini 3 Flash</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-gray-600">Auth</span>
                                <span className="text-[9px] font-mono text-emerald-400">System Key</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHAT INTERFACE */}
                <div className="lg:col-span-3 glass-panel rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative">
                    {/* Chat Header */}
                    <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center border border-white/10 ${selectedAgent.color}`}>
                                <selectedAgent.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">{selectedAgent.name} <span className="text-emerald-500/50 text-xs font-mono ml-2">v1.0.4</span></h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Neural Link Established</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setMessages([])}
                            className="text-[10px] font-mono text-gray-600 hover:text-red-400 transition-colors uppercase tracking-widest"
                        >
                            Purge History
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Terminal className="w-12 h-12 text-gray-600 mb-4" />
                                <p className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em]">Awaiting Command Input...</p>
                                <p className="text-[10px] text-gray-600 mt-2 max-w-xs">Select an agent and transmit your query to begin tactical analysis.</p>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-3xl p-5 ${
                                        msg.role === 'user' 
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50' 
                                            : 'bg-black/60 border border-white/5 text-gray-300'
                                    }`}>
                                        {msg.role === 'agent' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-black tracking-widest uppercase ${selectedAgent.color}`}>{msg.agentName}</span>
                                                <span className="text-[8px] font-mono text-gray-600">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-black/60 border border-white/5 rounded-3xl p-5 flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Processing...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-black/40 border-t border-white/5">
                        <div className="relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={`Transmit query to ${selectedAgent.name}...`}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between px-2">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => runQuickAction('audit')}
                                    className="text-[9px] font-mono text-gray-600 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                                >
                                    <Zap className="w-3 h-3" />
                                    Quick Audit
                                </button>
                                <button 
                                    onClick={() => runQuickAction('risk')}
                                    className="text-[9px] font-mono text-gray-600 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                                >
                                    <AlertTriangle className="w-3 h-3" />
                                    Risk Scan
                                </button>
                            </div>
                            <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Neural Link: SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
