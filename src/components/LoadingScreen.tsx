import React from 'react';
import { motion } from 'motion/react';
import { SpartaLogo } from './SpartaLogo';
import { MatrixRain } from './MatrixRain';

export const LoadingScreen: React.FC<{ step?: string; message?: string }> = ({ step, message }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
            <div className="absolute inset-0 scanlines pointer-events-none opacity-50 z-0"></div>
            <MatrixRain />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-stratos-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
            <motion.div
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-12 relative z-10 glass-panel p-8 rounded-full border border-stratos-accent/20 shadow-[0_0_50px_rgba(23,241,209,0.1)]"
            >
                <SpartaLogo className="w-20 h-20 text-stratos-accent drop-shadow-[0_0_15px_rgba(23,241,209,0.5)]" />
            </motion.div>
            <div className="space-y-4 text-center relative z-10 w-64">
                <p className="text-stratos-accent font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
                    {step || message || "Initializing Core..."}
                </p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-stratos-accent/20 blur-sm z-0"></div>
                    <motion.div 
                        className="h-full bg-stratos-accent shadow-[0_0_10px_rgba(23,241,209,0.8)] relative z-10"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </div>
        </div>
    );
};
