import React from 'react';
import { X, HelpCircle, ChevronRight, Calendar, Zap, Infinity, Swords, Users } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, mode = 'general' }) => {
  if (!isOpen) return null;

  const getModeInfo = () => {
    switch (mode) {
      case 'daily':
        return {
          title: 'Daily Challenge',
          icon: <Calendar size={20} strokeWidth={2.5} />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          desc: 'One word, shared globally. Resets every midnight.',
          rules: [
            'Everyone solves the exact same word.',
            'Your result contributes to your Daily Streak.',
            'Come back tomorrow for a new puzzle!'
          ]
        };
      case 'blitz':
        return {
          title: 'Blitz Mode',
          icon: <Zap size={20} strokeWidth={2.5} />,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          desc: 'Race against the clock! You have 60 seconds.',
          rules: [
            'Find the word before the timer hits zero.',
            'Unlimited guesses - speed is key!',
            'Earn high scores for fast solves.'
          ]
        };
      case 'unlimited':
        return {
          title: 'Unlimited Play',
          icon: <Infinity size={20} strokeWidth={2.5} />,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20',
          desc: 'Relaxed practice mode. Play as much as you want.',
          rules: [
            'No time limits or daily restrictions.',
            'Great for earning XP and Coins.',
            'Choose different Word Packs to change topics.'
          ]
        };
      case 'party':
        return {
          title: 'Party Mode',
          icon: <Users size={20} strokeWidth={2.5} />,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/20',
          desc: 'Local multiplayer. Pass the device!',
          rules: [
            'Players take turns guessing.',
            'First to find the word wins the round.',
            'Play with up to 4 friends on one device.'
          ]
        };
      case 'challenge':
        return {
          title: '1v1 Challenge',
          icon: <Swords size={20} strokeWidth={2.5} />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          desc: 'A custom duel sent by a friend.',
          rules: [
            'You are playing a specific seed or word set by a friend.',
            'Try to beat their score!',
            'Create your own challenges from the home screen.'
          ]
        };
      default:
        return null;
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop">
      <div className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modeInfo ? `${modeInfo.bgColor} ${modeInfo.color}` : 'bg-blue-500/20 text-blue-400'}`}>
              {modeInfo ? modeInfo.icon : <HelpCircle size={20} strokeWidth={2.5} />}
            </div>
            {modeInfo ? modeInfo.title : 'How to Play'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto scrollbar-hide">
          
          {/* Mode Specific Info */}
          {modeInfo && (
             <div className="mb-8 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <p className="text-white font-medium mb-3 text-lg leading-snug">{modeInfo.desc}</p>
                <ul className="space-y-2">
                  {modeInfo.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${modeInfo.color.replace('text-', 'bg-')}`}></span>
                      {rule}
                    </li>
                  ))}
                </ul>
             </div>
          )}

          <p className="text-lg text-slate-300 mb-8 font-medium leading-relaxed text-center">
            Find the secret word by guessing words with <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded-md">similar meanings</span>.
          </p>
          
          {/* Visual Scale */}
          <div className="relative pl-6 space-y-4 mb-8">
            {/* The Bar */}
            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500 via-yellow-400 to-blue-500/50 opacity-50"></div>

            <div className="relative flex items-center gap-4 group">
               <div className="absolute left-[-22px] w-3 h-3 rounded-full border-2 border-slate-900 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10"></div>
               <div className="flex-1 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex justify-between items-center">
                 <div>
                   <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-0.5">Burning (90-100)</div>
                   <div className="text-red-200/70 text-xs">Top 10 closest words. Direct synonyms.</div>
                 </div>
                 <span className="text-2xl animate-pulse">🔥</span>
               </div>
            </div>

            <div className="relative flex items-center gap-4 group">
               <div className="absolute left-[-22px] w-3 h-3 rounded-full border-2 border-slate-900 bg-orange-400 z-10"></div>
               <div className="flex-1 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 flex justify-between items-center">
                 <div>
                   <div className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-0.5">Hot (70-89)</div>
                   <div className="text-orange-200/70 text-xs">Strong associations or categories.</div>
                 </div>
                 <span className="text-2xl">☀️</span>
               </div>
            </div>

            <div className="relative flex items-center gap-4 group">
               <div className="absolute left-[-22px] w-3 h-3 rounded-full border-2 border-slate-900 bg-blue-500 z-10"></div>
               <div className="flex-1 bg-slate-800 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                 <div>
                   <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-0.5">Cold (0-44)</div>
                   <div className="text-slate-400 text-xs">Unrelated. Try a new angle!</div>
                 </div>
                 <span className="text-2xl opacity-50">❄️</span>
               </div>
            </div>
          </div>

          {/* Example Box */}
          <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Example Round
            </div>
            <div className="flex items-center justify-center gap-3 mb-6">
               <span className="text-sm text-slate-400">Secret:</span>
               <span className="text-xl font-black text-white tracking-widest bg-slate-800 px-4 py-1 rounded-lg border border-slate-700 shadow-inner">OCEAN</span>
            </div>
            <div className="space-y-2 text-sm max-w-xs mx-auto">
               <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50">
                 <span className="w-16 text-right font-bold text-cyan-400">Apple</span> 
                 <ChevronRight size={14} className="text-slate-600" />
                 <span className="text-slate-500 text-xs">Freezing (Is it food?)</span>
               </div>
               <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50">
                 <span className="w-16 text-right font-bold text-orange-400">Water</span> 
                 <ChevronRight size={14} className="text-slate-600" />
                 <span className="text-orange-200/70 text-xs">Hot (Getting closer!)</span>
               </div>
               <div className="flex items-center gap-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                 <span className="w-16 text-right font-bold text-red-400">Sea</span> 
                 <ChevronRight size={14} className="text-red-400" />
                 <span className="text-red-200 text-xs font-bold">Burning (Almost there!)</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};