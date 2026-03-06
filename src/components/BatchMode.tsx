import React, { useRef } from 'react';
import { UploadCloud, CloudLightning, Brain } from 'lucide-react';

interface BatchModeProps {
    isLoading: boolean;
    loadingStep: string;
    isDragging: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    predictions: any[];
}

export function BatchMode({
    isLoading,
    loadingStep,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    predictions
}: BatchModeProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <section className="mt-12 animate-in fade-in duration-700">
            <div 
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
                    isDragging 
                        ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' 
                        : isLoading 
                            ? 'border-emerald-500/30 bg-black/40 cursor-wait' 
                            : 'border-white/10 cursor-pointer hover:border-emerald-500/50 hover:bg-white/5'
                }`}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-xl font-mono text-emerald-400 font-medium animate-pulse tracking-widest uppercase">{loadingStep}</p>
                    </div>
                ) : (
                    <>
                        <UploadCloud className={`w-16 h-16 mb-6 transition-colors ${isDragging ? 'text-emerald-400' : 'text-gray-500'}`} />
                        <p className="text-2xl text-white font-medium mb-2 tracking-tight">{isDragging ? 'Drop it like it\'s hot!' : 'Drop odds screenshot here'}</p>
                        <p className="text-gray-500 font-mono text-sm">or click to browse</p>
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

            {predictions.length > 0 && (
                <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <CloudLightning className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">AI Predictions</h2>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {predictions.map((pred, i) => (
                            <div key={i} className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                                    <Brain className="w-48 h-48 text-emerald-500" />
                                </div>
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{pred.game.home} <span className="text-gray-600 font-mono text-sm mx-2">vs</span> {pred.game.away}</h3>
                                        <div className="flex gap-4 mt-3 font-mono text-xs text-gray-400">
                                            <span className="bg-white/5 px-2 py-1 rounded">H: <span className="text-white">{pred.game.oddsH || pred.odds.avgH || '-'}</span></span>
                                            <span className="bg-white/5 px-2 py-1 rounded">D: <span className="text-white">{pred.game.oddsD || pred.odds.avgD || '-'}</span></span>
                                            <span className="bg-white/5 px-2 py-1 rounded">A: <span className="text-white">{pred.game.oddsA || pred.odds.avgA || '-'}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-3xl font-black text-emerald-400 tracking-tighter">{pred.confidence}%</div>
                                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Confidence</div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Recommended Bet</span>
                                            <span className="font-bold text-emerald-400">{pred.bestBet}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Predicted Score</span>
                                            <span className="font-mono font-bold text-white">{pred.predScore}</span>
                                        </div>
                                        {pred.valueText && (
                                            <div className="mt-4 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 inline-block px-3 py-1.5 rounded-lg">
                                                {pred.valueText}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Tactical Insight
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{pred.bytezAnalysis.report}</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Top Market <span className="text-gray-600">({pred.bytezAnalysis.category})</span></span>
                                            <span className="text-sm font-bold text-emerald-400">{pred.bytezAnalysis.market}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 px-2">
                                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">Suggested Stake</div>
                                        <div className="font-bold text-xl text-white">${pred.stake}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
