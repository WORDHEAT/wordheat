import React from 'react';
import { Challenge } from '../types';
import { User, Zap } from 'lucide-react';

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

    const getStatusColor = (status: string) => {
        if (status === 'finished') return 'text-emerald-500';
        if (status === 'playing') return 'text-blue-500';
        return 'text-slate-500';
    };

    const getStatusText = (status: string) => {
        if (status === 'finished') return '✓ Finished';
        if (status === 'playing') return '⚡ Playing';
        if (status === 'waiting') return '⏳ Waiting';
        return '💌 Invited';
    };

    return (
        <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-2xl p-4 mb-4 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between gap-4">
                {/* You */}
                <div className="flex-1 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                            <User size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">You</div>
                            <div className="font-bold text-white text-sm">{myName}</div>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-blue-400 ml-10">{myGuesses || 0}</div>
                    <div className="text-[10px] text-slate-500 ml-10">guesses</div>
                    <div className={`text-xs ${getStatusColor(myStatus)} ml-10 mt-1`}>{getStatusText(myStatus)}</div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center px-4">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
                        VS
                    </div>
                    {challenge.status === 'accepted' && (
                        <div className="text-[10px] text-emerald-500 mt-1 uppercase font-bold tracking-wider">
                            Live
                        </div>
                    )}
                </div>

                {/* Opponent */}
                <div className="flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        <div>
                            <div className="text-xs text-slate-400 text-right">Opponent</div>
                            <div className="font-bold text-white text-sm text-right">{opponentName}</div>
                        </div>
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                            <Zap size={16} className="text-red-400" />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-red-400 mr-10">{opponentGuesses || 0}</div>
                    <div className="text-[10px] text-slate-500 mr-10">guesses</div>
                    <div className={`text-xs ${getStatusColor(opponentStatus)} mr-10 mt-1`}>{getStatusText(opponentStatus)}</div>
                </div>
            </div>
        </div>
    );
};
