import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Save, Trash2, Globe, Shield, Cpu, Cloud, Trophy, Zap, Download, Upload, Database, Smartphone } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { CURRENCIES } from '../lib/utils';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore, OddsFormat } from '../stores/settingsStore';
import { API_SERVICES, ApiKey, getSecureItem, setSecureItem, removeSecureItem } from '../lib/vault';
import { testApiKey, getActiveServicesCount } from '../lib/api';

export const SettingsMode = React.memo(() => {
    const { user, currency, bankroll, updateProfile, updateBankroll } = useUserStore();
    const { showToast } = useUIStore();
    const { 
        oddsFormat, setOddsFormat, 
        theme, setTheme,
        inferenceProvider, setInferenceProvider,
        localApiUrl, setLocalApiUrl,
        webLlmModel, setWebLlmModel
    } = useSettingsStore();
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<string | null>(null);
    const [verifying, setVerifying] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [activeCategory, setActiveCategory] = useState<'All' | 'Sports' | 'Quant' | 'Weather' | 'Other'>('All');
    const [activeCount, setActiveCount] = useState(0);
    const [isLocked, setIsLocked] = useState(true);
    const [vaultStatus, setVaultStatus] = useState<'SECURE' | 'UNLOCKED' | 'EMPTY'>('EMPTY');
    const [kellyFraction, setKellyFraction] = useState<number>(0.5);
    const [userStoreBankroll, setUserStoreBankroll] = useState<number>(bankroll);
    const [crawlerLogs, setCrawlerLogs] = useState<any[]>([]);

    useEffect(() => {
        setUserStoreBankroll(bankroll);
    }, [bankroll]);

    useEffect(() => {
        const q = query(collection(db, 'crawler_logs'), orderBy('cycleAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setCrawlerLogs(snapshot.docs[0].data().results || []);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const savedFraction = localStorage.getItem('kelly_fraction');
        if (savedFraction) setKellyFraction(parseFloat(savedFraction));
        
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

    const handleSave = async (service: ApiKey) => {
        setVerifying(service.envVar);
        setMessage(null);
        try {
            await testApiKey(service.id, keys[service.envVar]);
            await setSecureItem(service.envVar, keys[service.envVar]);
            setSaved(service.envVar);
            setMessage({ text: 'Key verified and saved successfully!', type: 'success' });
            showToast(`${service.name} key saved successfully`, "success");
            const count = getActiveServicesCount();
            setActiveCount(count);
            setVaultStatus(count > 0 ? (isLocked ? 'SECURE' : 'UNLOCKED') : 'EMPTY');
            setTimeout(() => { setSaved(null); setMessage(null); }, 3000);
        } catch (e) {
            setMessage({ text: 'Failed to verify key. Please check your key and try again.', type: 'error' });
            showToast(`Failed to verify ${service.name} key`, "error");
        } finally {
            setVerifying(null);
        }
        window.dispatchEvent(new Event('storage'));
    };

    const handleClear = async (envVar: string) => {
        await removeSecureItem(envVar);
        setKeys(prev => ({ ...prev, [envVar]: '' }));
        const count = getActiveServicesCount();
        setActiveCount(count);
        setVaultStatus(count > 0 ? (isLocked ? 'SECURE' : 'UNLOCKED') : 'EMPTY');
        showToast("Key cleared", "success");
        window.dispatchEvent(new Event('storage'));
    };

    const toggleVault = () => {
        setIsLocked(!isLocked);
    };

    const handleBackup = () => {
        const data = {
            keys,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sparta_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700 relative z-10">
            {/* Settings Mode Header */}
            <div className="flex items-center justify-between glass-panel border border-stratos-border/50 p-6 rounded-3xl backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center border border-stratos-border/50 shadow-inner">
                        <Cpu className="w-6 h-6 text-stratos-muted" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white tracking-[0.1em] drop-shadow-md">SYSTEM SETTINGS</h1>
                        <p className="text-[10px] text-stratos-muted font-mono uppercase tracking-[0.3em] font-bold mt-1">Configure your SPARTA environment</p>
                    </div>
                </div>
            </div>

            {/* DATA PERSISTENCE & STORAGE */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 relative overflow-hidden group/storage shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-stratos-accent/30 transition-all duration-500"
            >
                <div className="absolute inset-0 tech-grid opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/storage:animate-[shimmer_3s_infinite] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
                            <Smartphone className="w-8 h-8 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white tracking-[0.05em] uppercase">Phone Storage & Persistence</h2>
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mt-1 font-bold">Local Data Management & Offline Sync</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleBackup}
                            className="px-6 py-3 rounded-xl glass-panel border border-stratos-border/80 text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stratos-accent/10 transition-all flex items-center gap-2 shadow-inner hover:border-white/20"
                        >
                            <Download className="w-3.5 h-3.5" /> Backup
                        </button>
                        <button 
                            className="px-6 py-3 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-sky-500/30 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.1)] hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                        >
                            <Upload className="w-3.5 h-3.5" /> Restore
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10">
                    <div className="p-5 rounded-2xl glass-panel border border-stratos-border/50 shadow-inner group-hover/storage:border-stratos-accent/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="w-4 h-4 text-stratos-accent drop-shadow-[0_0_5px_rgba(23,241,209,0.5)]" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Firestore Sync</span>
                        </div>
                        <p className="text-[10px] text-stratos-muted font-mono leading-relaxed font-bold">
                            Real-time cloud synchronization active. Your data is securely mirrored across all authorized devices.
                        </p>
                        <div className="mt-4 flex items-center gap-2 bg-stratos-accent/5 w-fit px-3 py-1.5 rounded-lg border border-stratos-accent/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-stratos-accent animate-pulse shadow-[0_0_8px_rgba(23,241,209,0.8)]"></div>
                            <span className="text-[9px] font-mono text-stratos-accent uppercase tracking-[0.2em] font-bold">Connected & Encrypted</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl glass-panel border border-stratos-border/50 shadow-inner hover:border-sky-500/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Smartphone className="w-4 h-4 text-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Local Cache</span>
                        </div>
                        <p className="text-[10px] text-stratos-muted font-mono leading-relaxed font-bold">
                            Offline-first storage enabled. Statistics and forecasts are cached locally for instant access without network.
                        </p>
                        <div className="mt-4 flex items-center gap-2 bg-sky-500/5 w-fit px-3 py-1.5 rounded-lg border border-sky-500/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                            <span className="text-[9px] font-mono text-sky-400 uppercase tracking-[0.2em] font-bold">Storage: 2.4MB Used</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AUTONOMOUS BACKGROUND CRAWLERS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 relative overflow-hidden group/crawler shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-stratos-accent/30 transition-all duration-500"
            >
                <div className="absolute inset-0 tech-grid opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/crawler:animate-[shimmer_3s_infinite] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                            <Globe className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white tracking-[0.05em] uppercase">Autonomous Data Crawlers</h2>
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] mt-1 font-bold">Silent Background Market Inference</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stratos-accent/10 px-4 py-2 rounded-xl border border-stratos-accent/20">
                        <div className="w-2 h-2 rounded-full bg-stratos-accent animate-pulse shadow-[0_0_8px_rgba(23,241,209,0.8)]"></div>
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-stratos-accent">Running in Background</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {crawlerLogs.length > 0 ? (
                        crawlerLogs.map((log: any, i: number) => (
                            <div key={i} className="glass-panel border border-stratos-border/50 rounded-2xl p-4 shadow-inner flex flex-col justify-between hover:border-purple-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">{log.source}</span>
                                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-widest ${log.status === 'success' ? 'bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {log.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-stratos-muted font-mono uppercase tracking-widest block mb-1">Target</span>
                                    <span className="text-xs text-purple-400 font-mono font-bold">{log.type}</span>
                                    {log.status === 'success' && log.dataLength && (
                                        <span className="text-[9px] text-stratos-muted font-mono uppercase block mt-2">
                                            {Math.round(log.dataLength / 1024)} KB ext.
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center glass-panel border border-stratos-border/50 rounded-2xl shadow-inner">
                            <Cpu className="w-6 h-6 text-stratos-muted mx-auto mb-3" />
                            <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.2em] font-bold">Waiting for next background crawl cycle...</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* VAULT CONTROL CENTER */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-stratos-border/50 relative overflow-hidden group/vault shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-stratos-accent/30 transition-all duration-500"
            >
                <div className="absolute inset-0 tech-grid opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/5 to-transparent -translate-x-full group-hover/vault:animate-[shimmer_3s_infinite] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stratos-accent/5 to-transparent pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 shadow-inner ${isLocked ? 'glass-panel border-stratos-border/50 shadow-[0_0_30px_rgba(23,241,209,0.1)]' : 'bg-stratos-accent/10 border-stratos-accent/50 shadow-[0_0_50px_rgba(23,241,209,0.2)]'}`}>
                            {isLocked ? <Shield className="w-10 h-10 text-stratos-muted" /> : <Zap className="w-10 h-10 text-stratos-accent animate-pulse drop-shadow-[0_0_8px_rgba(23,241,209,0.8)]" />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-black text-white tracking-[0.05em] uppercase">SPARTA Vault</h2>
                            <div className="flex items-center gap-3 mt-1 glass-panel w-fit px-3 py-1.5 rounded-lg border border-stratos-border/50">
                                <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${vaultStatus === 'SECURE' ? 'bg-stratos-accent shadow-[0_0_8px_rgba(23,241,209,0.8)]' : vaultStatus === 'UNLOCKED' ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-stratos-muted'}`}></div>
                                <span className="text-[10px] font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold">Status: <span className="text-white">{vaultStatus}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-right hidden md:block glass-panel px-4 py-2 rounded-xl border border-stratos-border/50 shadow-inner">
                            <div className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.2em] mb-1 font-bold">Encryption Layer</div>
                            <div className="text-[10px] font-mono text-stratos-accent font-bold">AES-256-GCM (Browser Native)</div>
                        </div>
                        <button 
                            onClick={toggleVault}
                            className={`px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-3 shadow-inner ${isLocked ? 'bg-stratos-accent/20 text-stratos-accent border border-stratos-accent/50 hover:bg-stratos-accent hover:text-black hover:shadow-[0_0_20px_rgba(23,241,209,0.4)]' : 'glass-panel text-white border border-stratos-border/80 hover:bg-stratos-accent/10'}`}
                        >
                            {isLocked ? <><Key className="w-4 h-4" /> Unlock Vault</> : <><Shield className="w-4 h-4" /> Lock Vault</>}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* SYNERGY DASHBOARD */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 rounded-2xl border border-stratos-accent/20 bg-stratos-accent/5 relative overflow-hidden group/synergy shadow-inner"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stratos-accent/10 to-transparent -translate-x-full group-hover/synergy:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <Zap className="w-5 h-5 text-stratos-accent" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Synergy Level</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {Math.min(100, (activeCount / API_SERVICES.length) * 100).toFixed(0)}<span className="text-stratos-accent text-xl">%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">SYSTEM COOPERATION DEPTH</p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group/nodes shadow-inner"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/nodes:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Active Nodes</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {activeCount}<span className="text-gray-600 text-xl ml-1">/ {API_SERVICES.length}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">CONNECTED DATA PROVIDERS</p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group/redundancy shadow-inner"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/redundancy:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Redundancy</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white">
                        {activeCount > 5 ? 'HIGH' : activeCount > 2 ? 'MED' : 'LOW'}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">FAILOVER CAPABILITY STATUS</p>
                </motion.div>
            </div>

            {/* ENGINE CONFIGURATION */}
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Cpu className="w-6 h-6 text-amber-400" />
                        </div>
                        Quantitative Reasoning Engine
                    </h2>
                    <p className="text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                        Configure how SPARTA executes its quantitative models. Use the cloud for raw power, or connect to your local 4-bit Gemma model via phone/desktop for privacy and speed.
                    </p>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/ai shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/ai:animate-[shimmer_3s_infinite] pointer-events-none"></div>
                <div className="flex flex-col gap-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Select Engine</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setInferenceProvider('gemini')}
                                className={`p-5 rounded-2xl border transition-all duration-300 text-left ${
                                    inferenceProvider === 'gemini'
                                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                                        : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Cloud className={`w-5 h-5 ${inferenceProvider === 'gemini' ? 'text-amber-400' : 'text-gray-500'}`} />
                                    <div className="text-sm font-black uppercase tracking-widest">Cloud (Gemini API)</div>
                                </div>
                                <div className="text-[10px] font-mono leading-relaxed mt-3 opacity-80">
                                    Uses Google's GenAI SDK endpoint. Highest quality formatting and logic. Requires active internet.
                                </div>
                            </button>

                            <button
                                onClick={() => setInferenceProvider('local_api')}
                                className={`p-5 rounded-2xl border transition-all duration-300 text-left ${
                                    inferenceProvider === 'local_api'
                                        ? 'bg-stratos-accent/20 border-stratos-accent/50 text-white'
                                        : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Database className={`w-5 h-5 ${inferenceProvider === 'local_api' ? 'text-stratos-accent' : 'text-gray-500'}`} />
                                    <div className="text-sm font-black uppercase tracking-widest">Local Network (API)</div>
                                </div>
                                <div className="text-[10px] font-mono leading-relaxed mt-3 opacity-80">
                                    Connects to an OpenAI-compatible endpoint (e.g. MLC LLM Server, Ollama) on your local phone or PC.
                                </div>
                            </button>

                            <button
                                onClick={() => setInferenceProvider('web_llm')}
                                className={`p-5 rounded-2xl border transition-all duration-300 text-left ${
                                    inferenceProvider === 'web_llm'
                                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                        : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Smartphone className={`w-5 h-5 ${inferenceProvider === 'web_llm' ? 'text-blue-400' : 'text-gray-500'}`} />
                                    <div className="text-sm font-black uppercase tracking-widest">In-Browser (WebLLM)</div>
                                </div>
                                <div className="text-[10px] font-mono leading-relaxed mt-3 opacity-80">
                                    Downloads quantized weights (like Gemma 4-bit) straight to your browser cache. Runs entirely via WebGPU.
                                </div>
                            </button>
                        </div>
                    </div>

                    {inferenceProvider === 'local_api' && (
                        <div className="mt-4 p-6 rounded-2xl glass-panel border border-stratos-accent/20 animate-in fade-in duration-300">
                            <h4 className="text-sm font-bold text-white mb-2 uppercase">Local API Endpoint</h4>
                            <p className="text-[10px] text-gray-400 font-mono mb-4">Enter the base URL of your local inference server (such as Termux Ollama or MLC LLM Android app). Make sure you are on the same WiFi network.</p>
                            <input 
                                type="text" 
                                value={localApiUrl}
                                onChange={(e) => setLocalApiUrl(e.target.value)}
                                placeholder="http://192.168.1.100:8000/v1"
                                className="w-full glass-panel border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-gray-600 focus:border-stratos-accent/50 focus:bg-stratos-accent/5 transition-all font-mono"
                            />
                        </div>
                    )}

                    {inferenceProvider === 'web_llm' && (
                        <div className="mt-4 p-6 rounded-2xl glass-panel border border-blue-500/20 animate-in fade-in duration-300">
                            <h4 className="text-sm font-bold text-white mb-2 uppercase">WebLLM Model Selection</h4>
                            <p className="text-[10px] text-gray-400 font-mono mb-4">Specify the 4-bit quantized model string. The model will be downloaded automatically (approx. 1.5GB to 3GB) and run via your device's WebGPU.</p>
                            <input 
                                type="text" 
                                value={webLlmModel}
                                onChange={(e) => setWebLlmModel(e.target.value)}
                                placeholder="gemma-2b-it-q4f16_1-MLC"
                                className="w-full glass-panel border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-stratos-accent/5 transition-all font-mono"
                            />
                            <div className="mt-4 text-[10px] text-blue-400 font-mono">
                                *Note: Safari iOS 18+ or Chrome Android (Dev) required for WebGPU.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-stratos-accent/20 flex items-center justify-center border border-stratos-accent/30">
                            <Database className="w-6 h-6 text-stratos-accent" />
                        </div>
                        Betting Strategy
                    </h2>
                    <p className="text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                        Configure your staking model and risk management parameters. 
                        SPARTA uses the Kelly Criterion for optimal bankroll growth.
                    </p>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/kelly shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Odds Format</h3>
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-6">
                            Select your preferred odds display format. 
                            Decimal is standard, Fractional is common in UK, American is common in US.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            {(['DECIMAL', 'FRACTIONAL', 'AMERICAN'] as OddsFormat[]).map((format) => (
                                <button
                                    key={format}
                                    onClick={() => {
                                        setOddsFormat(format);
                                        showToast(`Odds format updated to ${format}`, "success");
                                    }}
                                    className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                                        oddsFormat === format
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                            : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="text-xs font-bold font-mono uppercase tracking-widest">{format}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/kelly shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">App Theme</h3>
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-6">
                            Customize the visual appearance of the application.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            {(['dark', 'amoled'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setTheme(t);
                                        showToast(`Theme updated to ${t.toUpperCase()}`, "success");
                                    }}
                                    className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                                        theme === t
                                            ? 'bg-amber-500/20 border-amber-500/50 text-white'
                                            : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="text-xs font-bold font-mono uppercase tracking-widest">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/kelly shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Starting Bankroll</h3>
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-6">
                            Set your initial bankroll. This will update your current balance.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative w-48">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-lg">{CURRENCIES.find(c => c.code === currency)?.symbol || '$'}</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    step="100"
                                    value={userStoreBankroll}
                                    onChange={(e) => setUserStoreBankroll(Number(e.target.value))}
                                    className="w-full glass-panel border border-white/10 rounded-xl py-3 pl-10 pr-4 text-lg text-white font-mono focus:outline-none focus:border-stratos-accent/50 transition-colors"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    await updateBankroll(userStoreBankroll);
                                    showToast(`Bankroll updated to ${userStoreBankroll}`, "success");
                                }}
                                className="px-6 py-3 rounded-xl bg-stratos-accent/20 border border-stratos-accent/50 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-stratos-accent/30 transition-all"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/kelly shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Display Currency</h3>
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-6">
                            Select your preferred currency for bankroll and stake displays. 
                            Exchange rates are updated in real-time.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            {CURRENCIES.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={async () => {
                                        await updateProfile({ currency: c.code });
                                        showToast(`Currency updated to ${c.code}`, "success");
                                    }}
                                    className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                                        currency === c.code
                                            ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                            : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="text-lg">{c.symbol}</span>
                                    <span className="text-xs font-bold font-mono">{c.code}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/kelly shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Kelly Criterion Fraction</h3>
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-6">
                            Choose your risk tolerance. Full Kelly is mathematically optimal but highly volatile. 
                            Half or Quarter Kelly are recommended for bankroll protection.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            {[
                                { label: 'Full Kelly', value: 1, desc: 'Aggressive' },
                                { label: 'Half Kelly', value: 0.5, desc: 'Recommended' },
                                { label: 'Quarter Kelly', value: 0.25, desc: 'Conservative' },
                                { label: 'Eighth Kelly', value: 0.125, desc: 'Ultra-Safe' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setKellyFraction(opt.value);
                                        localStorage.setItem('kelly_fraction', opt.value.toString());
                                    }}
                                    className={`flex-1 min-w-[140px] p-4 rounded-2xl border transition-all duration-300 text-left ${
                                        kellyFraction === opt.value
                                            ? 'bg-stratos-accent/20 border-stratos-accent/50 text-white'
                                            : 'glass-panel border-white/5 text-gray-500 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="text-xs font-black uppercase tracking-widest mb-1">{opt.label}</div>
                                    <div className={`text-[10px] font-mono uppercase tracking-tighter ${kellyFraction === opt.value ? 'text-stratos-accent' : 'text-gray-600'}`}>
                                        {opt.desc} ({opt.value * 100}%)
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-48 h-48 rounded-3xl glass-panel border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Risk Profile</div>
                        <div className={`text-4xl font-black mb-2 ${kellyFraction >= 1 ? 'text-red-500' : kellyFraction >= 0.5 ? 'text-stratos-accent' : 'text-blue-400'}`}>
                            {kellyFraction >= 1 ? 'HIGH' : kellyFraction >= 0.5 ? 'BAL' : 'SAFE'}
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${kellyFraction * 100}%` }}
                                className={`h-full ${kellyFraction >= 1 ? 'bg-red-500' : kellyFraction >= 0.5 ? 'bg-stratos-accent' : 'bg-blue-500'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-stratos-accent/20 flex items-center justify-center border border-stratos-accent/30">
                            <Key className="w-6 h-6 text-stratos-accent" />
                        </div>
                        API Configuration
                    </h2>
                    <p className="text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                        Manage your API keys for various data providers and quantitative models. 
                        Keys are stored locally in your browser using AES-256-GCM encryption.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
                {['All', 'Sports', 'Quant', 'Weather', 'Other'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 border ${
                            activeCategory === cat 
                                ? 'bg-stratos-accent/20 text-stratos-accent border-stratos-accent/40 shadow-[0_0_20px_rgba(23,241,209,0.15)]' 
                                : 'glass-panel text-gray-500 border-white/5 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                {filteredServices.map((service) => (
                    <motion.div 
                        key={service.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-stratos-accent/30 transition-all duration-500 group/key hover:shadow-[0_10px_40px_rgba(23,241,209,0.1)] hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/key:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/5 to-transparent opacity-0 group-hover/key:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl glass-panel border border-white/10 text-stratos-accent group-hover:border-stratos-accent/30 transition-colors">
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg flex items-center gap-3 tracking-tight">
                                        {service.name}
                                        {keys[service.envVar] && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stratos-accent opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-stratos-accent shadow-[0_0_8px_rgba(23,241,209,0.8)]" title="Configured"></span>
                                            </span>
                                        )}
                                    </h3>
                                    <span className="text-[10px] font-mono text-stratos-accent/60 uppercase tracking-[0.2em]">{service.category}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed relative z-10">
                            {service.description}
                        </p>

                        <div className="space-y-4 relative z-10">
                            <div className="relative">
                                <input 
                                    aria-label={`Enter API key for ${service.name}`}
                                    type={isLocked ? "password" : "text"}
                                    value={isLocked ? "••••••••••••••••" : (keys[service.envVar] || '')}
                                    onChange={(e) => !isLocked && setKeys(prev => ({ ...prev, [service.envVar]: e.target.value }))}
                                    disabled={isLocked}
                                    placeholder={isLocked ? "Vault Locked" : "Enter API Key..."}
                                    className={`w-full glass-panel border rounded-xl px-5 py-3.5 text-sm transition-all shadow-inner ${isLocked ? 'border-white/5 text-gray-700 cursor-not-allowed' : 'border-white/10 text-white placeholder:text-gray-600 focus:border-stratos-accent/50 focus:bg-stratos-accent/5'}`}
                                />
                                {isLocked && (
                                    <div className="absolute inset-0 glass-panel backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-stratos-accent/20" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => !isLocked && handleSave(service)}
                                    disabled={isLocked || verifying === service.envVar}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${isLocked ? 'bg-white/5 text-gray-700 cursor-not-allowed' : verifying === service.envVar ? 'bg-stratos-accent/50 text-white' : saved === service.envVar ? 'bg-stratos-accent text-black shadow-[0_0_20px_rgba(23,241,209,0.4)]' : 'bg-stratos-accent/10 hover:bg-stratos-accent/20 text-stratos-accent border border-stratos-accent/20 hover:border-stratos-accent/40'}`}
                                >
                                    {verifying === service.envVar ? 'Verifying...' : saved === service.envVar ? 'Saved!' : <><Save className="w-4 h-4" /> Save Key</>}
                                </button>
                                <button 
                                    aria-label={`Clear API key for ${service.name}`}
                                    onClick={() => !isLocked && handleClear(service.envVar)}
                                    disabled={isLocked}
                                    className={`p-3.5 rounded-xl border transition-all duration-300 ${isLocked ? 'bg-red-500/5 text-red-900/20 border-red-900/10 cursor-not-allowed' : 'bg-red-500/5 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40'}`}
                                    title="Clear Key"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            {message && message.type === 'error' && (
                                <p className="text-red-400 text-[10px] font-mono mt-2">{message.text}</p>
                            )}
                            {message && message.type === 'success' && (
                                <p className="text-stratos-accent text-[10px] font-mono mt-2">{message.text}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <div className="p-8 rounded-[2.5rem] bg-stratos-accent/5 border border-stratos-accent/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-stratos-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex gap-6 relative z-10">
                        <div className="p-4 rounded-2xl bg-stratos-accent/10 h-fit border border-stratos-accent/20">
                            <Zap className="w-8 h-8 text-stratos-accent" />
                        </div>
                        <div>
                            <h4 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">Premium Subscription</h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Unlock Arbitrage Scanner, VIP Signals, and Algorithmic Tactical Divergence Reports.
                            </p>
                            <button className="w-full py-3 bg-stratos-accent text-black font-black text-xs rounded-xl uppercase tracking-[0.2em] hover:bg-stratos-accent transition-all shadow-[0_0_20px_rgba(23,241,209,0.3)]">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex gap-6 relative z-10">
                        <div className="p-4 rounded-2xl bg-blue-500/10 h-fit border border-blue-500/20">
                            <Globe className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">Referral Program</h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Invite friends and earn 1 month of Pro for every successful referral.
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 glass-panel border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-400 font-mono flex items-center">
                                    SPARTA-REF-772
                                </div>
                                <button className="px-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all">
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 rounded-2xl bg-stratos-accent/5 border border-stratos-accent/10"
            >
                <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-stratos-accent/10 h-fit">
                        <Shield className="w-6 h-6 text-stratos-accent" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Security Note</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            These keys are stored in your device's secure storage. 
                            They are never sent to our servers. If you clear your app data, you will need to re-enter them.
                            The SPARTA Vault uses AES-256-GCM encryption for all sensitive data.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});
