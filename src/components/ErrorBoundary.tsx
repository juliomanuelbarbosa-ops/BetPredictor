import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0"></div>
                    <div className="absolute inset-0 scanlines pointer-events-none z-0 opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-xl w-full glass-panel border border-red-500/30 rounded-3xl p-8 backdrop-blur-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)] relative z-10 flex flex-col items-center group">
                        <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </div>
                        
                        <h1 className="text-3xl font-display font-black text-white mb-2 tracking-tight uppercase text-center">System Failure</h1>
                        <p className="text-[10px] font-mono text-stratos-muted uppercase tracking-widest text-center mb-6 py-1 px-3 bg-red-500/10 rounded-md border border-red-500/20 text-red-400 font-bold">
                            Critical Exception Caught
                        </p>
                        
                        <div className="w-full glass-panel rounded-xl p-5 mb-8 border border-stratos-border/50 overflow-auto max-h-48 shadow-inner bg-black/40">
                            <p className="text-xs text-red-400 font-mono break-words leading-relaxed">
                                {this.state.error?.message || 'An unexpected runtime error occurred.'}
                            </p>
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 glass-panel hover:bg-white text-white hover:text-black rounded-xl transition-all border border-stratos-border shadow-inner font-mono font-bold text-[10px] tracking-[0.2em] uppercase"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Reboot System Sequence</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
