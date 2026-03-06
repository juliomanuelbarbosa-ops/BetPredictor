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
        <section className="mt-12">
            <div 
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-64 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
                    isDragging 
                        ? 'border-emerald-500 bg-emerald-950/20 scale-[1.02]' 
                        : isLoading 
                            ? 'border-emerald-500/30 bg-gray-900/50 cursor-wait' 
                            : 'border-gray-700/70 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-950/10'
                }`}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-xl text-emerald-400 font-medium animate-pulse">{loadingStep}</p>
                    </div>
                ) : (
                    <>
                        <UploadCloud className={`w-16 h-16 mb-6 transition-colors ${isDragging ? 'text-emerald-400' : 'text-gray-500/70'}`} />
                        <p className="text-2xl text-gray-300 font-medium mb-2">{isDragging ? 'Drop it like it\'s hot!' : 'Drop odds screenshot here'}</p>
                        <p className="text-gray-500">or click to browse</p>
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
                <div className="mt-12 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <CloudLightning className="w-6 h-6 text-emerald-400" />
                        AI Predictions
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {predictions.map((pred, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Brain className="w-24 h-24" />
                                </div>
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold">{pred.game.home} <span className="text-gray-500 text-sm mx-2">vs</span> {pred.game.away}</h3>
                                        <div className="flex gap-3 mt-2 text-sm text-gray-400">
                                            <span>H: {pred.game.oddsH || pred.odds.avgH || '-'}</span>
                                            <span>D: {pred.game.oddsD || pred.odds.avgD || '-'}</span>
                                            <span>A: {pred.game.oddsA || pred.odds.avgA || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-emerald-400">{pred.confidence}%</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Confidence</div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-400">Recommended Bet</span>
                                            <span className="font-bold text-emerald-400">{pred.bestBet}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Predicted Score</span>
                                            <span className="font-mono font-bold">{pred.predScore}</span>
                                        </div>
                                        {pred.valueText && (
                                            <div className="mt-3 text-xs font-bold text-emerald-400 bg-emerald-950/30 inline-block px-2 py-1 rounded">
                                                {pred.valueText}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800/50">
                                        <div className="text-sm text-gray-400 mb-2">Tactical Insight</div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{pred.bytezAnalysis.analysis}</p>
                                        <div className="mt-3 pt-3 border-t border-gray-800/50 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Top Market</span>
                                            <span className="text-sm font-bold text-emerald-400">{pred.bytezAnalysis.market}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-sm text-gray-400">Suggested Stake</div>
                                        <div className="font-bold text-lg">${pred.stake}</div>
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
