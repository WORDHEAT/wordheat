
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CATEGORIES } from '../utils/categories';
import { X, Coins, Lock, LayoutGrid, ArrowRight, Wand2, Search } from 'lucide-react';
import { Icon } from './Icon';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ isOpen, onClose }) => {
  const { profile, buyCategory } = useUser();
  const navigate = useNavigate();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  if (!isOpen) return null;

  const handleStart = (categoryId: string) => {
    navigate(`/game?mode=unlimited&category=${categoryId}`);
  };

  const handleCustomStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    navigate(`/game?mode=unlimited&topic=${encodeURIComponent(customTopic.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div 
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              <LayoutGrid size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-white">Word Packs</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800 text-sm flex items-center gap-2">
              <Coins size={14} className="text-yellow-400" fill="#facc15" /> 
              <span className="text-slate-200 font-mono font-bold">{profile.coins}</span>
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X size={20} />
             </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-900">
          {Object.values(CATEGORIES).map((cat) => {
            const isOwned = profile.ownedCategories.includes(cat.id);
            
            return (
              <button
                key={cat.id}
                onClick={() => isOwned ? handleStart(cat.id) : buyCategory(cat.id)}
                className={`relative group aspect-square rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isOwned 
                    ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 hover:-translate-y-1' 
                    : 'bg-slate-900 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className={`mb-4 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isOwned 
                    ? 'bg-slate-700/50 text-slate-200 group-hover:bg-white group-hover:text-slate-900 shadow-inner' 
                    : 'bg-slate-800 text-slate-600'
                }`}>
                   <Icon name={cat.icon} size={32} strokeWidth={1.5} />
                </div>
                
                <div className="font-bold text-base text-white mb-1">{cat.name}</div>
                <div className="text-[10px] text-slate-500 font-medium px-2">{cat.description.split(' ')[0]}...</div>
                
                {isOwned ? (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                     Play <ArrowRight size={10} />
                   </div>
                ) : (
                   <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-4 transition-opacity opacity-0 group-hover:opacity-100">
                      <Lock size={24} className="text-slate-400 mb-3" />
                      <div className="bg-yellow-500 text-yellow-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg hover:bg-yellow-400 transition-colors scale-95 hover:scale-100">
                         Unlock {cat.price} <Coins size={12} />
                      </div>
                   </div>
                )}
              </button>
            );
          })}

          {/* Custom Topic Card */}
          <div 
            className={`relative group aspect-square rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-300 overflow-hidden ${
              isCustomMode 
                ? 'bg-indigo-900/20 border-indigo-500/50' 
                : 'bg-slate-800/40 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 hover:-translate-y-1'
            }`}
          >
             {!isCustomMode ? (
               <button 
                 onClick={() => setIsCustomMode(true)}
                 className="w-full h-full flex flex-col items-center justify-center"
               >
                  <div className="mb-4 w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                     <Wand2 size={32} strokeWidth={1.5} />
                  </div>
                  <div className="font-bold text-base text-white mb-1">Custom</div>
                  <div className="text-[10px] text-slate-500 font-medium px-2">Play any topic!</div>
               </button>
             ) : (
               <form onSubmit={handleCustomStart} className="w-full h-full p-4 flex flex-col items-center justify-center animate-pop">
                  <div className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3">Enter Topic</div>
                  <div className="relative w-full mb-3">
                    <input 
                      autoFocus
                      type="text"
                      value={customTopic}
                      onChange={e => setCustomTopic(e.target.value)}
                      placeholder="e.g. Star Wars"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button 
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-700"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={!customTopic.trim()}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 disabled:opacity-50"
                    >
                      Play
                    </button>
                  </div>
               </form>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
