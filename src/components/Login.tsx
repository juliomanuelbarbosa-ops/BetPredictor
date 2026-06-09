import React from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../stores/userStore';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { SpartaLogo } from './SpartaLogo';
import { MatrixRain } from './MatrixRain';

export const Login: React.FC = () => {
    const { setUser } = useUserStore();

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 relative overflow-hidden">
            <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
            <div className="absolute inset-0 scanlines pointer-events-none z-0 opacity-50"></div>
            <MatrixRain />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stratos-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 glass-panel p-12 md:p-16 rounded-[3rem] border border-stratos-border/50 shadow-2xl flex flex-col items-center backdrop-blur-3xl group"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-stratos-accent/5 to-transparent pointer-events-none rounded-[3rem]"></div>
                
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-stratos-accent/20 blur-2xl rounded-full"></div>
                    <SpartaLogo className="w-24 h-24 text-stratos-accent relative z-10 drop-shadow-[0_0_15px_rgba(23,241,209,0.5)] group-hover:scale-105 transition-transform duration-700" />
                </div>
                
                <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-2 tracking-tighter drop-shadow-lg">SPARTA</h1>
                <p className="text-stratos-accent font-mono text-[10px] mb-12 tracking-[0.4em] uppercase font-bold bg-stratos-accent/10 px-3 py-1 rounded-md border border-stratos-accent/20 shadow-[0_0_10px_rgba(23,241,209,0.1)]">Quantitative Arbitrage Engine</p>
                
                <button 
                    onClick={handleLogin}
                    className="px-10 py-5 bg-stratos-accent text-black font-mono font-black tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(23,241,209,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:-translate-y-1 relative overflow-hidden group/btn"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">INITIALIZE SESSION</span>
                </button>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center relative z-10 mt-8"
            >
                <p className="text-[9px] font-mono text-stratos-muted uppercase tracking-[0.3em] font-bold">SPARTA Engine</p>
                <p className="text-[8px] font-mono text-stratos-muted/40 uppercase tracking-[0.2em] mt-2 space-x-3"><span>V 3.0</span><span>|</span><span>Quant</span></p>
            </motion.div>
        </div>
    );
};
