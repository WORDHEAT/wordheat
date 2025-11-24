
import React from 'react';
import { Temperature } from '../types';
import { useUser } from '../context/UserContext';

interface HeatBarProps {
  score: number;
  temperature: Temperature;
}

export const HeatBar: React.FC<HeatBarProps> = ({ score, temperature }) => {
  const { profile } = useUser();
  const isHardMode = profile.settings.hardMode;
  const isHighContrast = profile.settings.highContrast;
  
  // Calculate width percentage
  const width = `${score}%`;

  // Dynamic color based on score
  const getColor = (s: number) => {
    if (isHighContrast) {
      if (s >= 90) return 'bg-gradient-to-r from-yellow-400 to-red-600'; 
      if (s >= 70) return 'bg-gradient-to-r from-yellow-300 to-orange-500';
      if (s >= 45) return 'bg-gradient-to-r from-sky-300 to-yellow-300';
      if (s >= 20) return 'bg-gradient-to-r from-blue-400 to-sky-300';
      return 'bg-gradient-to-r from-blue-800 to-blue-500';
    }

    if (s >= 90) return 'bg-gradient-to-r from-red-500 to-rose-600'; // Burning
    if (s >= 70) return 'bg-gradient-to-r from-orange-400 to-red-500'; // Hot
    if (s >= 45) return 'bg-gradient-to-r from-yellow-400 to-orange-400'; // Warm
    if (s >= 20) return 'bg-gradient-to-r from-cyan-400 to-blue-500'; // Cold
    return 'bg-gradient-to-r from-blue-600 to-indigo-600'; // Freezing
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
        <span>{temperature}</span>
        <span>{isHardMode && score !== 100 ? '???' : score}/100</span>
      </div>
      <div className={`h-4 w-full bg-slate-800 rounded-full overflow-hidden border ${isHighContrast ? 'border-white' : 'border-slate-700'} relative shadow-inner`}>
        <div 
          className={`h-full ${getColor(score)} transition-all duration-1000 ease-out relative`}
          style={{ width }}
        >
            <div className="absolute right-0 top-0 h-full w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>
    </div>
  );
};
