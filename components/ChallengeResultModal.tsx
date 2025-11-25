import React from 'react';
import { Challenge } from '../types';
import { Trophy, Zap, Target, X, Crown, Frown } from 'lucide-react';

interface ChallengeResultModalProps {
    isOpen: boolean;
    challenge: Challenge;
    isChallenger: boolean;
    onClose: () => void;
}

export const ChallengeResultModal: React.FC<ChallengeResultModalProps> = ({
    isOpen,
    challenge,
    isChallenger,
    onClose
}) => {
    if (!isOpen || !challenge.winner) return null;

    const myName = isChallenger ? challenge.challenger : challenge.opponent;
    const opponentName = isChallenger ? challenge.opponent : challenge.challenger;
    const iWon = challenge.winner === myName;
    const myGuesses = isChallenger ? challenge.challenger_guesses : challenge.opponent_guesses;
    const opponentGuesses = isChallenger ? challenge.opponent_guesses : challenge.challenger_guesses;

    // Simple confetti - show for winners only
    const showConfetti = iWon;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            {showConfetti && (
                <div className="confetti-container fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                backgroundColor: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
            )}

            <div className={`relative w-full max-w-lg transform transition-all animate-scale-in ${iWon ? 'shadow-[0_0_50px_-12px_rgba(234,179,8,0.5)]' : 'shadow-[0_0_50px_-12px_rgba(148,163,184,0.3)]'}`}>
                {/* Glassmorphism Card */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">

                    {/* Dynamic Background Gradient */}
                    <div className={`absolute inset-0 opacity-20 ${iWon
                            ? 'bg-[radial-gradient(circle_at_50%_0%,#eab308,transparent_70%)]'
                            : 'bg-[radial-gradient(circle_at_50%_0%,#475569,transparent_70%)]'
                        }`} />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative p-8 text-center">
                        {/* Status Icon */}
                        <div className="mb-6 relative inline-block">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl ${iWon
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-600 animate-float'
                                    : 'bg-gradient-to-br from-slate-600 to-slate-800'
                                }`}>
                                {iWon ? (
                                    <Trophy size={48} className="text-white drop-shadow-md" />
                                ) : (
                                    <Frown size={48} className="text-slate-300 drop-shadow-md" />
                                )}
                            </div>
                            {iWon && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce-slow">
                                    <Crown size={16} className="text-yellow-900" />
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className={`text-4xl font-black mb-2 tracking-tight ${iWon
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 animate-shimmer bg-[length:200%_auto]'
                                : 'text-slate-300'
                            }`}>
                            {iWon ? 'VICTORY!' : 'DEFEAT'}
                        </h2>

                        <p className="text-slate-400 font-medium mb-8">
                            {iWon ? 'You crushed the challenge!' : `Better luck next time against ${opponentName}`}
                        </p>

                        {/* Stats Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Player Card */}
                            <div className={`rounded-2xl p-4 border ${iWon
                                    ? 'bg-yellow-500/10 border-yellow-500/20'
                                    : 'bg-slate-800/50 border-slate-700/50'
                                }`}>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">You</div>
                                <div className={`text-3xl font-black ${iWon ? 'text-yellow-400' : 'text-slate-300'}`}>
                                    {myGuesses === 999 ? '🏳️' : myGuesses}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Guesses</div>
                            </div>

                            {/* Opponent Card */}
                            <div className={`rounded-2xl p-4 border ${!iWon
                                    ? 'bg-green-500/10 border-green-500/20'
                                    : 'bg-slate-800/50 border-slate-700/50'
                                }`}>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{opponentName}</div>
                                <div className={`text-3xl font-black ${!iWon ? 'text-green-400' : 'text-slate-300'}`}>
                                    {opponentGuesses === 999 ? '🏳️' : opponentGuesses}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Guesses</div>
                            </div>
                        </div>

                        {/* Secret Word Reveal */}
                        <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/5">
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-2">
                                <Zap size={14} className="text-yellow-500" />
                                <span>The secret word was</span>
                            </div>
                            <div className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse-slow">
                                {challenge.word}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onClose}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${iWon
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-orange-900/20 hover:shadow-orange-900/40'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20'
                                }`}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                @keyframes scale-in {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                .confetti {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    top: -10px;
                    border-radius: 2px;
                    animation: confetti-fall 4s linear forwards;
                }
                .animate-scale-in {
                    animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
                .animate-bounce-slow {
                    animation: bounce 2s infinite;
                }
            `}</style>
        </div>
    );
};
