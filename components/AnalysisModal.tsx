import React from 'react';
import { Bot, X, Loader2, Sparkles } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | string[];
  isLoading?: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div 
        className="bg-slate-900/95 border border-slate-600/50 rounded-3xl max-w-sm w-full shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
               <Bot size={18} />
            </div>
            AI Analysis
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-slate-200 bg-slate-900 min-h-[180px] flex items-center justify-center relative">
          {/* Decorative BG */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>

          {isLoading ? (
             <div className="flex flex-col items-center gap-4 relative z-10">
               <div className="relative">
                 <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                 <Loader2 size={40} className="text-emerald-500 animate-spin relative z-10" />
               </div>
               <p className="text-sm text-slate-400 font-medium animate-pulse">Analyzing semantic network...</p>
             </div>
          ) : (
             <div className="w-full relative z-10">
               <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-80">
                 <Sparkles size={12} /> {title}
               </div>
               
               {Array.isArray(content) ? (
                 <div className="flex flex-wrap gap-2 justify-center">
                   {content.map((word, i) => (
                     <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:border-emerald-500/50 transition-colors">
                       {word}
                     </span>
                   ))}
                 </div>
               ) : (
                 <p className="text-base leading-relaxed text-slate-300 bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                   "{content}"
                 </p>
               )}
             </div>
          )}
        </div>

        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors text-sm text-white border border-slate-700 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};