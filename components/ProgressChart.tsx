
import React from 'react';
import { Guess } from '../types';

interface ProgressChartProps {
  guesses: Guess[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ guesses }) => {
  if (guesses.length < 2) return null;

  // Sort chronologically (oldest first)
  const data = [...guesses].sort((a, b) => a.timestamp - b.timestamp);

  const height = 150;
  const width = 300;
  const padding = 20;

  // Scales
  const xScale = (index: number) => {
    const safeMax = Math.max(1, data.length - 1);
    return padding + (index / safeMax) * (width - 2 * padding);
  };
  
  const yScale = (score: number) => {
    return height - padding - (score / 100) * (height - 2 * padding);
  };

  // Generate Path
  const points = data.map((g, i) => `${xScale(i)},${yScale(g.score)}`).join(' ');

  return (
    <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-6 flex flex-col items-center">
       <h4 className="text-xs uppercase text-slate-400 font-bold mb-2 tracking-wider">Semantic Trajectory</h4>
       <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid Lines */}
          <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={yScale(50)} x2={width - padding} y2={yScale(50)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={yScale(100)} x2={width - padding} y2={yScale(100)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" /> {/* Emerald for high score */}
              <stop offset="50%" stopColor="#f59e0b" /> {/* Amber for mid */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* Blue for low */}
            </linearGradient>
          </defs>

          {/* The Line */}
          <polyline 
            points={points} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />

          {/* Dots */}
          {data.map((g, i) => (
            <circle 
              key={i}
              cx={xScale(i)} 
              cy={yScale(g.score)} 
              r="4" 
              className="fill-slate-900 stroke-white hover:fill-white transition-colors cursor-pointer"
              strokeWidth="2"
            >
              <title>Guess {i+1}: {g.word} ({g.score})</title>
            </circle>
          ))}
       </svg>
    </div>
  );
};
