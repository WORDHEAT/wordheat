import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Share2, Download, Copy, Check, Flame, Smartphone, Globe } from 'lucide-react';
import { GameState, Temperature } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  mode: string;
  username: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, gameState, mode, username }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  if (!isOpen) return null;

  const getTemperatureColor = (temp: Temperature) => {
    switch (temp) {
      case Temperature.BURNING: return 'bg-red-500 border-red-400 text-red-100';
      case Temperature.HOT: return 'bg-orange-500 border-orange-400 text-orange-100';
      case Temperature.WARM: return 'bg-yellow-500 border-yellow-400 text-yellow-900';
      case Temperature.COLD: return 'bg-cyan-500 border-cyan-400 text-cyan-900';
      case Temperature.FREEZING: return 'bg-blue-700 border-blue-600 text-blue-200';
      default: return 'bg-slate-700 border-slate-600';
    }
  };

  const getEmoji = (temp: Temperature) => {
    switch (temp) {
      case Temperature.SOLVED: return '🏆';
      case Temperature.BURNING: return '🔥';
      case Temperature.HOT: return '☀️';
      case Temperature.WARM: return '🌤️';
      case Temperature.COLD: return '❄️';
      default: return '🧊';
    }
  };

  const generateShareText = () => {
    const emojis = gameState.guesses
       .sort((a, b) => a.timestamp - b.timestamp)
       .map(g => getEmoji(g.temperature))
       .join('');
    
    return `WordHeat 🔥 ${gameState.guesses.length} Guesses\nMode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}\n\n${emojis}\n\nPlay at: https://wordheat.app`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setShareLoading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2, // Better quality
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
            setShareLoading(false);
            return;
        }

        // Try native share first
        if (navigator.share) {
            const file = new File([blob], 'wordheat-victory.png', { type: 'image/png' });
            try {
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'WordHeat Victory',
                        text: `I found the word in ${gameState.guesses.length} guesses!`
                    });
                    setShareLoading(false);
                    return;
                }
            } catch (e) {
                console.log("Native share failed or cancelled, falling back to download");
            }
        }

        // Fallback to download
        const link = document.createElement('a');
        link.download = `wordheat-${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL();
        link.click();
        setShareLoading(false);
      });
    } catch (e) {
      console.error("Share failed", e);
      setShareLoading(false);
    }
  };

  // Prepare data for visualizer
  const sortedGuesses = [...gameState.guesses].sort((a, b) => a.timestamp - b.timestamp);
  const displayedGuesses = sortedGuesses.length > 48 ? sortedGuesses.slice(-48) : sortedGuesses;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-pop" onClick={onClose}>
      <div className="w-full max-w-md flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        
        {/* Controls Header */}
        <div className="flex justify-between items-center text-white px-2">
          <h3 className="text-lg font-bold">Share Result</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* The Card (This gets captured) */}
        <div ref={cardRef} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative">
           {/* Background Glows */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none"></div>
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>

           <div className="p-6 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Flame size={20} fill="white" />
                    </div>
                    <div>
                       <h2 className="font-black text-xl text-white leading-none tracking-tight">WordHeat</h2>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Semantic Puzzle</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-bold text-slate-500 uppercase">{new Date().toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">{mode}</div>
                 </div>
              </div>

              {/* Main Stats */}
              <div className="text-center mb-8">
                 <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                    Mission Accomplished
                 </div>
                 <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg uppercase tracking-tight">
                    {gameState.targetWord}
                 </h1>
                 <div className="flex justify-center gap-6 text-sm">
                    <div className="flex flex-col items-center">
                       <span className="font-bold text-white text-lg">{gameState.guesses.length}</span>
                       <span className="text-[10px] text-slate-500 uppercase font-bold">Guesses</span>
                    </div>
                    <div className="w-px h-8 bg-slate-800"></div>
                    <div className="flex flex-col items-center">
                       <span className="font-bold text-white text-lg">{username}</span>
                       <span className="text-[10px] text-slate-500 uppercase font-bold">Player</span>
                    </div>
                 </div>
              </div>

              {/* Heat Map Visual */}
              <div className="mb-6">
                 <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider flex justify-between">
                    <span>Heat History</span>
                    <span>{gameState.guesses.length} Total</span>
                 </div>
                 <div className="grid grid-cols-8 gap-1.5">
                    {displayedGuesses.map((guess, i) => (
                       <div 
                         key={i} 
                         className={`aspect-square rounded-md border flex items-center justify-center text-[8px] ${getTemperatureColor(guess.temperature)}`}
                       >
                       </div>
                    ))}
                    {/* Fill remaining slots to look nice if few guesses */}
                    {displayedGuesses.length < 8 && Array.from({length: 8 - displayedGuesses.length}).map((_, i) => (
                       <div key={`empty-${i}`} className="aspect-square rounded-md bg-slate-800/50 border border-slate-800"></div>
                    ))}
                 </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Globe size={12} /> wordheat.app
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <Smartphone size={12} /> Play Free
                 </div>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-2">
           <button 
             onClick={handleCopyText}
             className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
           >
              {copySuccess ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              {copySuccess ? 'Copied Text' : 'Copy Text'}
           </button>
           <button 
             onClick={handleShareImage}
             disabled={shareLoading}
             className="py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
           >
              {shareLoading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                 <>
                   <Share2 size={18} /> Share Card
                 </>
              )}
           </button>
        </div>

      </div>
    </div>
  );
};