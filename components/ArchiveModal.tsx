
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Book, X, Calendar, Lock, ArrowUpRight, Hash, Clock, Play } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'collection' | 'calendar';
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, initialTab = 'collection' }) => {
  const { profile } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collection' | 'calendar'>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // --- Calendar Logic ---
  const today = new Date();
  // Generate last 30 days
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return {
       dateObj: d,
       dateStr: d.toLocaleDateString('en-CA'), // YYYY-MM-DD
       dayNum: d.getDate(),
       month: d.toLocaleDateString(undefined, { month: 'short' })
    };
  });

  const checkDayStatus = (dateStr: string) => {
     // Logic: Check if a solved word exists with mode='daily' and seed=dateStr
     const solved = profile.solvedWords.find(
       w => w.mode === 'daily' && (w.seed === dateStr || (!w.seed && w.date.startsWith(dateStr)))
     );
     return solved ? { status: 'solved', word: solved.word } : { status: 'unsolved' };
  };

  const handleDayClick = (dateStr: string, status: string) => {
     if (status === 'solved') return;
     navigate(`/game?mode=daily&date=${dateStr}`);
     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div 
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Book size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-white">History</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-900">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
             <button 
               onClick={() => setActiveTab('collection')}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'collection' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Book size={14} /> Collection
             </button>
             <button 
               onClick={() => setActiveTab('calendar')}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'calendar' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Calendar size={14} /> Daily Archive
             </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto bg-slate-900 flex-1 min-h-[300px] scrollbar-hide">
          
          {activeTab === 'collection' && (
            profile.solvedWords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700 border-dashed">
                   <Lock size={32} className="text-slate-600" />
                </div>
                <h4 className="font-bold text-xl text-slate-300 mb-2">Library Empty</h4>
                <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">
                  Words you solve will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.solvedWords.map((item, index) => (
                  <div key={index} className="group bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30 p-4 rounded-2xl transition-all flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-lg capitalize mb-1 group-hover:text-emerald-400 transition-colors">{item.word}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="flex items-center gap-1"><Hash size={12} /> {item.guessesCount}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                         item.mode === 'daily' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                         item.mode === 'blitz' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                         'bg-blue-500/10 text-blue-400 border-blue-500/20'
                       }`}>
                         {item.mode}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'calendar' && (
             <div className="grid grid-cols-5 gap-3">
                {calendarDays.map((d, i) => {
                   const { status, word } = checkDayStatus(d.dateStr);
                   const isToday = i === 0;
                   
                   return (
                      <button 
                        key={d.dateStr}
                        onClick={() => handleDayClick(d.dateStr, status)}
                        disabled={status === 'solved'}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          status === 'solved' 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                            : isToday 
                              ? 'bg-yellow-500/20 border-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                      >
                         <span className="text-[10px] font-bold uppercase opacity-60">{d.month}</span>
                         <span className="text-xl font-bold">{d.dayNum}</span>
                         
                         <div className="absolute bottom-2">
                            {status === 'solved' ? (
                               <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Lock size={10} className="text-emerald-900" /> 
                               </div>
                            ) : isToday ? (
                               <span className="text-[8px] font-bold bg-yellow-500 text-yellow-950 px-1.5 rounded-sm">TODAY</span>
                            ) : (
                               <Play size={12} className="opacity-0 group-hover:opacity-100 text-white" />
                            )}
                         </div>
                      </button>
                   );
                })}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
