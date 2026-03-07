import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, Save, Trash2, Globe, Shield, Cpu, Cloud, Trophy, Zap } from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    description: string;
    envVar: string;
    icon: React.ReactNode;
    category: 'Sports' | 'AI' | 'Weather' | 'Other';
}

const API_SERVICES: ApiKey[] = [
    // --- SPORTS ---
    {
        id: 'odds',
        name: 'The Odds API',
        description: 'Live and upcoming football odds across global bookmakers.',
        envVar: 'VITE_ODDS_API_KEY',
        icon: <Trophy className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'sportmonks',
        name: 'Sportmonks',
        description: 'Detailed player stats, lineups, and historical data.',
        envVar: 'VITE_SPORTMONKS_API_KEY',
        icon: <Globe className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'apifootball',
        name: 'API-Football',
        description: 'Comprehensive football data covering 800+ leagues.',
        envVar: 'VITE_API_FOOTBALL_KEY',
        icon: <Zap className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'rapidapi',
        name: 'RapidAPI',
        description: 'Access to thousands of sports and data APIs via a single key.',
        envVar: 'VITE_RAPIDAPI_KEY',
        icon: <Globe className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'sportradar',
        name: 'Sportradar',
        description: 'Professional-grade sports data and betting services.',
        envVar: 'VITE_SPORTRADAR_API_KEY',
        icon: <Trophy className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'pandascore',
        name: 'PandaScore',
        description: 'The leading provider of E-sports data and odds.',
        envVar: 'VITE_PANDASCORE_API_KEY',
        icon: <Zap className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'opta',
        name: 'Opta / Stats Perform',
        description: 'The gold standard for deep football performance metrics.',
        envVar: 'VITE_OPTA_API_KEY',
        icon: <Trophy className="w-4 h-4" />,
        category: 'Sports'
    },
    {
        id: 'geniussports',
        name: 'Genius Sports',
        description: 'Official data partner for major global leagues.',
        envVar: 'VITE_GENIUS_API_KEY',
        icon: <Globe className="w-4 h-4" />,
        category: 'Sports'
    },

    // --- AI ---
    {
        id: 'bytez',
        name: 'Bytez API',
        description: 'Advanced AI models for tactical analysis and prediction.',
        envVar: 'VITE_BYTEZ_API_KEY',
        icon: <Cpu className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4o and other LLMs for deep reasoning.',
        envVar: 'VITE_OPENAI_API_KEY',
        icon: <Shield className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude 3.5 Sonnet for advanced pattern recognition.',
        envVar: 'VITE_ANTHROPIC_API_KEY',
        icon: <Shield className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Google\'s most capable AI models for multimodal analysis.',
        envVar: 'VITE_GEMINI_API_KEY',
        icon: <Cpu className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'High-performance open-weights models from Europe.',
        envVar: 'VITE_MISTRAL_API_KEY',
        icon: <Cpu className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'perplexity',
        name: 'Perplexity AI',
        description: 'Real-time web search and information retrieval for AI.',
        envVar: 'VITE_PERPLEXITY_API_KEY',
        icon: <Globe className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'groq',
        name: 'Groq',
        description: 'Ultra-fast LPU inference for real-time AI responses.',
        envVar: 'VITE_GROQ_API_KEY',
        icon: <Zap className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'cohere',
        name: 'Cohere',
        description: 'Enterprise-grade RAG and language understanding.',
        envVar: 'VITE_COHERE_API_KEY',
        icon: <Shield className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'together',
        name: 'Together AI',
        description: 'Access to hundreds of open-source models via one API.',
        envVar: 'VITE_TOGETHER_API_KEY',
        icon: <Cpu className="w-4 h-4" />,
        category: 'AI'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Unified interface for all major LLMs with competitive pricing.',
        envVar: 'VITE_OPENROUTER_API_KEY',
        icon: <Globe className="w-4 h-4" />,
        category: 'AI'
    },

    // --- WEATHER ---
    {
        id: 'weather',
        name: 'OpenWeatherMap',
        description: 'Real-time weather data for match condition analysis.',
        envVar: 'VITE_OPENWEATHER_KEY',
        icon: <Cloud className="w-4 h-4" />,
        category: 'Weather'
    },
    {
        id: 'accuweather',
        name: 'AccuWeather',
        description: 'Hyper-local weather forecasts and conditions.',
        envVar: 'VITE_ACCUWEATHER_API_KEY',
        icon: <Cloud className="w-4 h-4" />,
        category: 'Weather'
    },
    {
        id: 'weatherstack',
        name: 'Weatherstack',
        description: 'Real-time, historical, and future weather data.',
        envVar: 'VITE_WEATHERSTACK_API_KEY',
        icon: <Cloud className="w-4 h-4" />,
        category: 'Weather'
    },
    {
        id: 'visualcrossing',
        name: 'Visual Crossing',
        description: 'High-resolution historical and forecast weather data.',
        envVar: 'VITE_VISUALCROSSING_API_KEY',
        icon: <Cloud className="w-4 h-4" />,
        category: 'Weather'
    },
    {
        id: 'weatherbit',
        name: 'Weatherbit',
        description: 'Fast and reliable weather API for global locations.',
        envVar: 'VITE_WEATHERBIT_API_KEY',
        icon: <Cloud className="w-4 h-4" />,
        category: 'Weather'
    },

    // --- OTHER ---
    {
        id: 'twilio',
        name: 'Twilio',
        description: 'Send SMS and voice alerts for critical betting signals.',
        envVar: 'VITE_TWILIO_API_KEY',
        icon: <Zap className="w-4 h-4" />,
        category: 'Other'
    },
    {
        id: 'slack',
        name: 'Slack Webhook',
        description: 'Push tactical reports directly to your Slack workspace.',
        envVar: 'VITE_SLACK_WEBHOOK_URL',
        icon: <Globe className="w-4 h-4" />,
        category: 'Other'
    },
    {
        id: 'discord',
        name: 'Discord Webhook',
        description: 'Automated alerts and analysis for Discord channels.',
        envVar: 'VITE_DISCORD_WEBHOOK_URL',
        icon: <Globe className="w-4 h-4" />,
        category: 'Other'
    },
    {
        id: 'telegram',
        name: 'Telegram Bot',
        description: 'Receive real-time analysis and alerts via Telegram.',
        envVar: 'VITE_TELEGRAM_BOT_TOKEN',
        icon: <Zap className="w-4 h-4" />,
        category: 'Other'
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connect your betting analysis to 5000+ other apps.',
        envVar: 'VITE_ZAPIER_WEBHOOK_URL',
        icon: <Zap className="w-4 h-4" />,
        category: 'Other'
    }
];

import { getActiveServicesCount } from '../api/footballApi';
import { getSecureItem, setSecureItem, removeSecureItem } from '../utils/storage';

export const SettingsMode: React.FC = () => {
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<'All' | 'Sports' | 'AI' | 'Weather' | 'Other'>('All');
    const [activeCount, setActiveCount] = useState(0);
    const [isLocked, setIsLocked] = useState(true);
    const [vaultStatus, setVaultStatus] = useState<'SECURE' | 'UNLOCKED' | 'EMPTY'>('EMPTY');

    useEffect(() => {
        const loadKeys = async () => {
            const loadedKeys: Record<string, string> = {};
            let count = 0;
            for (const service of API_SERVICES) {
                const val = await getSecureItem(service.envVar) || '';
                loadedKeys[service.envVar] = val;
                if (val) count++;
            }
            setKeys(loadedKeys);
            setActiveCount(count);
            setVaultStatus(count > 0 ? (isLocked ? 'SECURE' : 'UNLOCKED') : 'EMPTY');
        };
        loadKeys();
    }, [isLocked]);

    const filteredServices = activeCategory === 'All' 
        ? API_SERVICES 
        : API_SERVICES.filter(s => s.category === activeCategory);

    const handleSave = async (envVar: string) => {
        await setSecureItem(envVar, keys[envVar]);
        setSaved(envVar);
        const count = getActiveServicesCount();
        setActiveCount(count);
        setVaultStatus(count > 0 ? (isLocked ? 'SECURE' : 'UNLOCKED') : 'EMPTY');
        setTimeout(() => setSaved(null), 2000);
        window.dispatchEvent(new Event('storage'));
    };

    const handleClear = async (envVar: string) => {
        await removeSecureItem(envVar);
        setKeys(prev => ({ ...prev, [envVar]: '' }));
        const count = getActiveServicesCount();
        setActiveCount(count);
        setVaultStatus(count > 0 ? (isLocked ? 'SECURE' : 'UNLOCKED') : 'EMPTY');
        window.dispatchEvent(new Event('storage'));
    };

    const toggleVault = () => {
        setIsLocked(!isLocked);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* VAULT CONTROL CENTER */}
            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 ${isLocked ? 'bg-black/60 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]'}`}>
                            {isLocked ? <Shield className="w-10 h-10 text-emerald-500/50" /> : <Zap className="w-10 h-10 text-emerald-400 animate-pulse" />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Stratos Vault</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <div className={`h-2 w-2 rounded-full ${vaultStatus === 'SECURE' ? 'bg-emerald-500' : vaultStatus === 'UNLOCKED' ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">Status: {vaultStatus}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">Encryption Layer</div>
                            <div className="text-xs font-mono text-emerald-500/70">AES-256-GCM (Browser Native)</div>
                        </div>
                        <button 
                            onClick={toggleVault}
                            className={`px-8 py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-3 ${isLocked ? 'bg-emerald-500 text-black hover:scale-105' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                        >
                            {isLocked ? <><Key className="w-4 h-4" /> Unlock Vault</> : <><Shield className="w-4 h-4" /> Lock Vault</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* SYNERGY DASHBOARD */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Synergy Level</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {Math.min(100, (activeCount / API_SERVICES.length) * 100).toFixed(0)}<span className="text-emerald-500 text-xl">%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">SYSTEM COOPERATION DEPTH</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Active Nodes</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {activeCount}<span className="text-gray-600 text-xl ml-1">/ {API_SERVICES.length}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">CONNECTED DATA PROVIDERS</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Redundancy</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {activeCount > 5 ? 'HIGH' : activeCount > 2 ? 'MED' : 'LOW'}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">FAILOVER CAPABILITY STATUS</p>
                </div>
            </div>

            <div className="mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Key className="w-8 h-8 text-emerald-400" />
                    API Configuration
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Manage your API keys for various data providers and AI models. 
                    Keys are stored locally in your browser for security.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
                {['All', 'Sports', 'AI', 'Weather', 'Other'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                            activeCategory === cat 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                    <motion.div 
                        key={service.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        {service.name}
                                        {keys[service.envVar] && (
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Configured"></span>
                                        )}
                                    </h3>
                                    <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">{service.category}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            {service.description}
                        </p>

                        <div className="space-y-3">
                            <div className="relative">
                                <input 
                                    type={isLocked ? "password" : "text"}
                                    value={isLocked ? "••••••••••••••••" : (keys[service.envVar] || '')}
                                    onChange={(e) => !isLocked && setKeys(prev => ({ ...prev, [service.envVar]: e.target.value }))}
                                    disabled={isLocked}
                                    placeholder={isLocked ? "Vault Locked" : "Enter API Key..."}
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-2.5 text-sm transition-all ${isLocked ? 'border-white/5 text-gray-700 cursor-not-allowed' : 'border-white/10 text-white placeholder:text-gray-700 focus:border-emerald-500/50'}`}
                                />
                                {isLocked && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-emerald-500/20" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => !isLocked && handleSave(service.envVar)}
                                    disabled={isLocked}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isLocked ? 'bg-white/5 text-gray-700 cursor-not-allowed' : saved === service.envVar ? 'bg-emerald-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                                >
                                    {saved === service.envVar ? 'Saved!' : <><Save className="w-3.5 h-3.5" /> Save Key</>}
                                </button>
                                <button 
                                    onClick={() => !isLocked && handleClear(service.envVar)}
                                    disabled={isLocked}
                                    className={`p-2 rounded-xl border transition-all ${isLocked ? 'bg-red-500/5 text-red-900/20 border-red-900/10 cursor-not-allowed' : 'bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/10'}`}
                                    title="Clear Key"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 h-fit">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Security Note</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            These keys are stored in your device's secure storage. 
                            They are never sent to our servers. If you clear your app data, you will need to re-enter them.
                            The Stratos Vault uses AES-256-GCM encryption for all sensitive data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
