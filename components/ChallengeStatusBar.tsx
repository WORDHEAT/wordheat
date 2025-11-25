import React, { useEffect, useState } from 'react';
import { Challenge } from '../types';
import { User, Zap, Swords, Activity } from 'lucide-react';

interface ChallengeStatusBarProps {
    challenge: Challenge;
    isChallenger: boolean;
}

export const ChallengeStatusBar: React.FC<ChallengeStatusBarProps> = ({ challenge, isChallenger }) => {
    const myStatus = isChallenger ? challenge.challenger_status : challenge.opponent_status;
    const opponentStatus = isChallenger ? challenge.opponent_status : challenge.challenger_status;
    const myGuesses = isChallenger ? challenge.challenger_guesses : challenge.opponent_guesses;
    const opponentGuesses = isChallenger ? challenge.opponent_guesses : challenge.challenger_guesses;
    const myName = isChallenger ? challenge.challenger : challenge.opponent;
    const opponentName = isChallenger ? challenge.opponent : challenge.challenger;

    // Animation state for score changes
    const [animateMyScore, setAnimateMyScore] = useState(false);
    const [animateOpponentScore, setAnimateOpponentScore] = useState(false);

    useEffect(() => {
        setAnimateMyScore(true);
        const timer = setTimeout(() => setAnimateMyScore(false), 300);
        return () => clearTimeout(timer);
    }, [myGuesses]);

    useEffect(() => {
        setAnimateOpponentScore(true);
        const timer = setTimeout(() => setAnimateOpponentScore(false), 300);
        return () => clearTimeout(timer);
    }, [opponentGuesses]);

    const getStatusColor = (status: string) => {
        if (status === 'finished') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        if (status === 'playing') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    const getStatusText = (status: string) => {
        if (status === 'finished') return 'FINISHED';
        if (status === 'playing') return 'PLAYING';
        if (status === 'waiting') return 'WAITING';
        return 'INVITED';
    };

    return (
        <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 mb-6 shadow-2xl animate-fade-in">
            {/* Background Glows */}
            <div className="absolute -left-10 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-10 bottom-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-2 sm:gap-6">
                {/* You */}
                <div className="flex-1 flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                            <User size={20} className="text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                            <div className={`w-2 h-2 rounded-full ${myStatus === 'playing' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">You</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(myStatus)} font-mono`}>
                                {getStatusText(myStatus)}
                            </span>
                        </div>
                        <div className="font-bold text-white text-sm sm:text-base truncate max-w-[80px] sm:max-w-[120px]">{myName}</div>
                        <div className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono transition-transform duration-300 ${animateMyScore ? 'scale-125' : 'scale-100'}`}>
                            {myGuesses || 0}
                        </div>
                    </div>
                </div>

                {/* VS Center */}
                <div className="flex flex-col items-center justify-center px-2">
                    <div className="relative">
                        <Swords size={24} className="text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 scale-150" />
                        <div className="text-xl sm:text-2xl font-black italic text-slate-500/50 tracking-widest">VS</div>
                    </div>
                    {challenge.status === 'accepted' && (
                        <div className="flex items-center gap-1 mt-1 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Live</span>
                        </div>
                    )}
                </div>

                {/* Opponent */}
                <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 text-right">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(opponentStatus)} font-mono`}>
                                {getStatusText(opponentStatus)}
                            </span>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Opponent</span>
                        </div>
                        <div className="font-bold text-white text-sm sm:text-base truncate max-w-[80px] sm:max-w-[120px]">{opponentName}</div>
                        <div className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 font-mono transition-transform duration-300 ${animateOpponentScore ? 'scale-125' : 'scale-100'}`}>
                            {opponentGuesses || 0}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
                            <Zap size={20} className="text-red-400" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                            <div className={`w-2 h-2 rounded-full ${opponentStatus === 'playing' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
