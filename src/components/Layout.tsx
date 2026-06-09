import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Brain, Activity, Settings, Crosshair, Zap, Layers, BarChart2, Menu, X, LogOut, Users, Search, Cpu, Globe2 } from 'lucide-react';
import { SpartaLogo } from './SpartaLogo';
import { useUserStore } from '../stores/userStore';
import { logout } from '../firebase';
import { CommandPalette } from './CommandPalette';

const UserProfile = ({ user }: { user: any }) => (
    <div className="p-4 border-t border-stratos-border/50 relative z-10 glass-panel">
        <div className="flex items-center gap-3 px-4 py-3 glass-panel rounded-2xl border border-stratos-border/30 mb-3 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="w-2 h-2 rounded-full bg-stratos-accent animate-pulse shadow-[0_0_8px_rgba(23,241,209,0.8)]"></div>
            <span className="font-mono text-[9px] text-stratos-muted uppercase tracking-[0.3em] font-bold">System Online</span>
        </div>
        {user && (
            <div className="flex items-center justify-between px-4 py-3 glass-panel hover:bg-stratos-accent/10 rounded-2xl border border-stratos-border/50 shadow-inner group transition-colors hover:border-stratos-accent/30">
                <div className="flex items-center gap-3 overflow-hidden">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-stratos-border/50 glass-panel" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-stratos-accent/10 flex items-center justify-center border border-stratos-accent/20 shrink-0 shadow-inner">
                            <span className="text-xs text-stratos-accent font-bold">{user.email?.[0].toUpperCase()}</span>
                        </div>
                    )}
                    <span className="font-mono text-[10px] text-stratos-text truncate opacity-80 group-hover:opacity-100 transition-opacity">{user.email}</span>
                </div>
                <button 
                    onClick={() => logout()}
                    className="text-stratos-muted hover:text-red-400 transition-colors shrink-0 ml-2"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        )}
    </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useUserStore();

    const navItems = [
        { path: '/oracle', icon: Brain, label: 'The Oracle' },
        { path: '/worldcup', icon: Globe2, label: 'WC 2026' },
        { path: '/upcoming', icon: Calendar, label: 'Upcoming' },
        { path: '/accumulator', icon: Layers, label: 'Accumulator' },
        { path: '/betting', icon: Zap, label: 'Betting' },
        { path: '/trends', icon: Activity, label: 'Market Trends' },
        { path: '/performance', icon: BarChart2, label: 'Performance' },
        { path: '/calculators', icon: Crosshair, label: 'Calculators' },
        { path: '/agent', icon: Cpu, label: 'Local Agent' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-transparent text-white font-sans selection:bg-stratos-accent/30 flex relative">
            <div className="fixed inset-0 scanlines pointer-events-none z-50"></div>
            <div className="fixed inset-0 tech-grid opacity-[0.03] pointer-events-none z-0"></div>
            {/* Desktop Sidebar */}
            <aside className="w-64 glass-panel backdrop-blur-3xl border-r border-stratos-border/50 hidden md:flex flex-col h-screen sticky top-0 relative overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 tech-grid-dense opacity-20 pointer-events-none z-0"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-stratos-accent/10 blur-[80px] pointer-events-none rounded-full z-0 mix-blend-screen"></div>
                
                <div className="p-6 flex items-center gap-4 border-b border-stratos-border/50 relative z-10 bg-gradient-to-r from-stratos-card to-transparent">
                    <SpartaLogo className="w-8 h-8 text-stratos-accent" />
                    <span className="font-display font-black text-2xl tracking-[0.1em] text-white drop-shadow-md">SPARTA</span>
                </div>
                
                <div className="px-4 pt-6 relative z-10">
                    <CommandPalette />
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-bold group relative overflow-hidden ${
                                    isActive
                                        ? 'bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/20 shadow-[0_0_20px_rgba(23,241,209,0.05)]'
                                        : 'text-stratos-muted hover:text-white hover:bg-white/5 border border-transparent shadow-none'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-stratos-accent rounded-r-md"></div>}
                                    <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(23,241,209,0.5)]' : 'group-hover:scale-110 group-hover:text-stratos-accent/70'}`} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav><UserProfile user={user} /><div className="p-4 border-t border-stratos-border/50 text-center relative z-10 glass-panel mt-auto"><p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold">SPARTA Engine</p><p className="text-[8px] font-mono text-stratos-muted/40 uppercase tracking-[0.2em] mt-2 space-x-3"><span>V 3.0</span><span>|</span><span>Quant</span></p></div></aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 glass-panel backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 glass-panel backdrop-blur-3xl border-r border-stratos-border/50 flex flex-col z-[70] transform transition-transform duration-300 ease-in-out md:hidden shadow-[20px_0_60px_rgba(0,0,0,0.8)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute inset-0 tech-grid-dense opacity-20 pointer-events-none z-0"></div>
                <div className="p-6 flex items-center justify-between border-b border-stratos-border/50 bg-gradient-to-r from-stratos-card to-transparent relative z-10">
                    <div className="flex items-center gap-3">
                        <SpartaLogo className="w-8 h-8 text-stratos-accent" />
                        <span className="font-display font-black text-2xl tracking-[0.1em] text-white">SPARTA</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-stratos-muted hover:text-white glass-panel p-2 rounded-xl border border-stratos-border/50">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-bold relative overflow-hidden ${
                                    isActive
                                        ? 'bg-stratos-accent/10 text-stratos-accent border border-stratos-accent/20 shadow-[0_0_20px_rgba(23,241,209,0.05)]'
                                        : 'text-stratos-muted hover:text-white hover:bg-white/5 border border-transparent blur-none'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-stratos-accent rounded-r-md"></div>}
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav><UserProfile user={user} /><div className="p-4 border-t border-stratos-border/50 text-center relative z-10 glass-panel mt-auto"><p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold">SPARTA Engine</p><p className="text-[8px] font-mono text-stratos-muted/40 uppercase tracking-[0.2em] mt-2 space-x-3"><span>V 3.0</span><span>|</span><span>Quant</span></p></div></aside>

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-x-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 glass-panel backdrop-blur-xl border-b border-stratos-border sticky top-0 z-50 shadow-md">
                    <div className="absolute inset-0 tech-grid-dense opacity-10 pointer-events-none z-0"></div>
                    <div className="flex items-center gap-2 relative z-10">
                        <SpartaLogo className="w-6 h-6 text-stratos-accent" />
                        <span className="font-display font-black text-lg tracking-tight text-white">SPARTA</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-stratos-muted hover:text-white hover:bg-stratos-border rounded-lg transition-colors relative z-10"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
