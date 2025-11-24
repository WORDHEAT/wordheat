import React from 'react';
import { Challenge } from '../types';
import { Trophy, Zap, Target } from 'lucide-react';

interface ChallengeResultModalProps {
    isOpen: boolean;
    <div
                            key = { i }
                            className = "confetti"
                            style = {{
    left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)]
}}
                        />
                    ))}
                </div >
            )}

            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`p-6 text-center ${iWon ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' : 'bg-slate-800/50'}`}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{
                            background: iWon
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                        }}
                    >
                        {iWon ? <Trophy size={40} className="text-white" /> : <Target size={40} className="text-white" />}
                    </div>

                    <h2 className={`text-3xl font-black mb-2 ${iWon ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {iWon ? '🏆 Victory!' : '😔 Defeated'}
                    </h2>

                    <p className="text-slate-400 text-sm">
                        {iWon ? 'You won the challenge!' : `${opponentName} won the challenge`}
                    </p>
                </div>

                {/* Stats */}
                <div className="p-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs text-slate-400 mb-1">Your Guesses</div>
                                <div className="text-2xl font-bold text-blue-400">{myGuesses}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-1">{opponentName}'s Guesses</div>
                                <div className="text-2xl font-bold text-red-400">{opponentGuesses}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                            <Zap size={16} className="text-yellow-500" />
                            <span>The word was: <span className="font-bold text-white">{challenge.word}</span></span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
        </div >
    );
};
