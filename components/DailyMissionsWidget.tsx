
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Check, ClipboardList, Clock, Coins, ChevronDown } from 'lucide-react';

export const DailyMissionsWidget: React.FC = () => {
  const { profile, claimMission } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const missions = profile.dailyMissions || [];

  const claimableCount = missions.filter(m => m.progress >= m.target && !m.isClaimed).length;

  if (missions.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl mb-8 transition-all hover:border-slate-600/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800/50 p-4 flex justify-between items-center hover:bg-slate-800/70 transition-colors group"
      >
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${claimableCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                <ClipboardList size={16} />
            </div>
            <div className="text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Daily Missions
                </h3>
                {!isOpen && (
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        {claimableCount > 0 ? (
                            <span className="text-emerald-400 font-bold">{claimableCount} Rewards Ready</span>
                        ) : (
                            <span>{missions.length} Active Tasks</span>
                        )}
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3">
            {isOpen && (
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded">
                    <Clock size={10} />
                    <span>RESETS 00:00</span>
                </div>
            )}
            <div className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
            </div>
        </div>
      </button>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="divide-y divide-slate-700/30 border-t border-slate-700/30">
            {missions.map((mission) => {
            const isCompleted = mission.progress >= mission.target;
            const percent = Math.min(100, (mission.progress / mission.target) * 100);

            return (
                <div key={mission.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex-1 mr-4 text-left">
                    <div className="flex justify-between mb-2">
                    <span className={`text-sm font-medium ${mission.isClaimed ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>
                        {mission.description}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                        {mission.progress}/{mission.target}
                    </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-700 ease-out ${mission.isClaimed ? 'bg-slate-600' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        claimMission(mission.id);
                    }}
                    disabled={!isCompleted || mission.isClaimed}
                    className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 ${
                    mission.isClaimed 
                        ? 'bg-slate-800/50 text-slate-500 border border-slate-700/50 opacity-60 cursor-default'
                        : isCompleted 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 shadow-emerald-500/20'
                        : 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30'
                    }`}
                >
                    {mission.isClaimed ? (
                    <>
                        <Check size={12} /> Done
                    </>
                    ) : (
                    <>
                        Claim <span className="text-yellow-300 flex items-center gap-0.5">{mission.reward}<Coins size={10} /></span>
                    </>
                    )}
                </button>
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
};
