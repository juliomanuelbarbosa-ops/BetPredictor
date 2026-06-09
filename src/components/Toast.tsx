import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-8 right-8 backdrop-blur-xl border ${
                type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-50' : 
                type === 'info' ? 'bg-blue-950/80 border-blue-500/30 text-blue-50' :
                'glass-panel border-stratos-accent/30 text-stratos-accent'
            } px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] font-mono text-sm`}
        >
            {type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
            ) : type === 'info' ? (
                <Info className="w-5 h-5 text-blue-400" />
            ) : (
                <CheckCircle className="w-5 h-5 text-stratos-accent" />
            )}
            <span className="tracking-wide">{message}</span>
        </motion.div>
    );
};
