
import React from 'react';
import { Guess, Temperature } from '../types';
import { useUser } from '../context/UserContext';
import { Flame, Sun, CloudSun, Snowflake, Info } from 'lucide-react';

interface GuessRowProps {
  guess: Guess;
  isBest?: boolean;
  listIndex?: number;
  onClick?: () => void;
}

export const GuessRow: React.FC<GuessRowProps> = ({ guess, isBest, listIndex, onClick }) => {
  const { profile } = useUser();
  const isHardMode = profile.settings.hardMode;
  const isClickable = !!onClick;

  const getStyles = (temp: Temperature) => {
    switch (temp) {
      case Temperature.BURNING: return 'border-red-500/40 bg-red-500/10 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      case Temperature.HOT: return 'border-orange-500/40 bg-orange-500/10 text-orange-200';
      case Temperature.WARM: return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200';
      case Temperature.COLD: return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200';
      default: return 'border-blue-800/40 bg-blue-900/20 text-blue-300';
    }
  };

  const renderIcon = (temp: Temperature) => {
    switch (temp) {
      case Temperature.BURNING: return <Flame size={20} fill="currentColor" className="animate-pulse" />;
      case Temperature.HOT: return <Flame size={20} />;
      case Temperature.WARM: return <Sun size={20} />;
      case Temperature.COLD: return <CloudSun size={20} />;
      case Temperature.FREEZING: return <Snowflake size={20} />;
      default: return <Snowflake size={20} />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative group/row flex items-center justify-between p-4 sm:p-5 rounded-xl border backdrop-blur-sm mb-3 sm:mb-4 transition-all duration-300 animate-pop ${getStyles(guess.temperature)} ${isBest ? 'ring-1 ring-white/30 scale-[1.01]' : ''} ${isClickable ? 'cursor-pointer hover:scale-[1.02] active:scale-95 hover:bg-white/5' : ''}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {listIndex && (
          <div className={`font-mono text-xs sm:text-sm font-bold opacity-50 min-w-[1.5rem] ${listIndex === 1 ? 'text-yellow-400 opacity-100 scale-110' : ''}`}>
            #{listIndex}
          </div>
        )}
        <div className="flex-shrink-0 opacity-90">
           {renderIcon(guess.temperature)}
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-semibold tracking-tight break-words">{guess.word}</span>
          {isClickable && (
             <div className="flex items-center gap-1 text-[10px] opacity-0 group-hover/row:opacity-70 transition-opacity uppercase font-bold tracking-wider">
                <Info size={10} /> Why this score?
             </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          {isHardMode && guess.score !== 1 && guess.score !== 100 ? (
            <span className="font-mono font-bold text-lg tracking-wider">???</span>
          ) : (
            <span className="font-mono font-bold text-lg">{guess.score}</span>
          )}
          
          {(!isHardMode && guess.rank && guess.rank < 1000) && (
              <span className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">#{guess.rank}</span>
          )}
        </div>
      </div>
    </div>
  );
};
