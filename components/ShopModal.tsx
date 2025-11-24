import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { THEMES } from '../utils/themes';
import { CATEGORIES } from '../utils/categories';
import { CONSUMABLES } from '../utils/consumables';
import { ShoppingBag, Palette, Package, Zap, Coins, X, Check, Sparkles } from 'lucide-react';
import { Icon } from './Icon';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { profile, buyTheme, equipTheme, buyCategory, buyItem } = useUser();
  const [activeTab, setActiveTab] = useState<'themes' | 'packs' | 'items'>('themes');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleBuy = (action: () => boolean, id: string) => {
    if (action()) {
        setAnimatingId(id);
        setTimeout(() => setAnimatingId(null), 1000);
    }
  };

  if (!isOpen) return null;

  // Featured Item Logic (Mocked for Cyber theme)
  const featuredThemeId = 'cyber'; 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div 
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingBag size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-none tracking-tight">Marketplace</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Upgrade your experience</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                 <Coins size={14} className="text-yellow-400" fill="#facc15" />
                 <span className="text-slate-200 font-bold font-mono">{profile.coins.toLocaleString()}</span>
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Featured Banner (Only on themes tab for now) */}
        {activeTab === 'themes' && !profile.ownedThemes.includes(featuredThemeId) && (
            <div className="mx-6 mt-6 relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-700/50" onClick={() => setActiveTab('themes')}>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900 via-purple-900 to-slate-900"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur flex items-center justify-center text-fuchsia-400 border border-white/10">
                            <Sparkles size={24} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="bg-fuchsia-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Featured</span>
                            </div>
                            <div className="font-bold text-white text-lg">Cyberpunk City</div>
                            <div className="text-xs text-fuchsia-200/70">Limited time offer</div>
                         </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-yellow-400 font-black text-xl flex items-center gap-1">
                             500 <Coins size={16} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            {(['themes', 'packs', 'items'] as const).map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
               >
                 {tab === 'themes' && <Palette size={16} />}
                 {tab === 'packs' && <Package size={16} />}
                 {tab === 'items' && <Zap size={16} />}
                 <span className="capitalize">{tab}</span>
               </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeTab === 'themes' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(THEMES).map((theme) => {
                    const isOwned = profile.ownedThemes.includes(theme.id);
                    const isActive = profile.activeTheme === theme.id;
                    const isJustBought = animatingId === theme.id;

                    return (
                    <div 
                        key={theme.id} 
                        className={`relative p-4 rounded-2xl border transition-all group flex flex-col ${
                        isActive 
                        ? 'border-emerald-500/50 bg-emerald-900/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]' 
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex flex-col">
                                <h4 className="font-bold text-white text-sm">{theme.name}</h4>
                                <span className="text-[10px] text-slate-500">{theme.description}</span>
                           </div>
                           {isActive && <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full"><Check size={12} /></div>}
                        </div>
                        
                        {/* Preview Gradient */}
                        <div className={`h-16 w-full rounded-xl mb-4 bg-gradient-to-r ${theme.heatColors[4]} shadow-inner border border-white/5 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
                        </div>

                        <div className="mt-auto">
                        {isOwned ? (
                            <button 
                            onClick={() => equipTheme(theme.id)}
                            disabled={isActive}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                isActive 
                                ? 'bg-transparent text-emerald-500 border border-emerald-500/30 cursor-default' 
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                            >
                                {isActive ? 'Active' : 'Equip'}
                            </button>
                        ) : (
                            <button 
                            onClick={() => handleBuy(() => buyTheme(theme.id), theme.id)}
                            disabled={profile.coins < theme.price}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                isJustBought 
                                ? 'bg-emerald-500 text-white'
                                : profile.coins < theme.price 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                            }`}
                            >
                            {isJustBought ? <Check size={14} /> : <>{theme.price} <Coins size={12} /></>}
                            </button>
                        )}
                        </div>
                    </div>
                    );
                })}
             </div>
          )}

          {activeTab === 'packs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(CATEGORIES).map((cat) => {
                    const isOwned = profile.ownedCategories.includes(cat.id);
                    const isJustBought = animatingId === cat.id;

                    return (
                    <div 
                        key={cat.id} 
                        className={`relative p-4 rounded-2xl border transition-all flex flex-col ${isOwned ? 'border-emerald-500/30 bg-slate-800/50' : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/50'}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 ${isOwned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                <Icon name={cat.icon} size={24} />
                            </div>
                            {isOwned && <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full"><Check size={12} /></div>}
                        </div>
                        
                        <div className="flex-1 mb-4">
                             <h4 className="font-bold text-white text-sm mb-1">{cat.name}</h4>
                             <p className="text-xs text-slate-500 leading-snug">{cat.description}</p>
                        </div>
                        
                        <div className="mt-auto">
                            {isOwned ? (
                                <div className="w-full py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                                    Owned
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleBuy(() => buyCategory(cat.id), cat.id)}
                                    disabled={profile.coins < cat.price}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                        isJustBought 
                                        ? 'bg-emerald-500 text-white'
                                        : profile.coins < cat.price 
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                            : 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                                    }`}
                                >
                                    {isJustBought ? <Check size={14} /> : <>{cat.price} <Coins size={12} /></>}
                                </button>
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>
          )}

          {activeTab === 'items' && (
              <div className="space-y-3">
                {Object.values(CONSUMABLES).map((item) => {
                    const count = profile.inventory[item.id] || 0;
                    const isJustBought = animatingId === item.id;
                    
                    return (
                    <div 
                        key={item.id} 
                        className="relative p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/50 transition-all group flex gap-4 items-center"
                    >
                        <div className="w-14 h-14 bg-slate-900 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-800 shrink-0 group-hover:text-white transition-colors">
                            <Icon name={item.icon} size={24} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                <div className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded text-indigo-400 border border-slate-800">
                                    x{count}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-snug">{item.description}</p>
                        </div>

                        <button 
                        onClick={() => handleBuy(() => buyItem(item.id), item.id)}
                        disabled={profile.coins < item.price}
                        className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 ${
                             isJustBought 
                                ? 'bg-emerald-500 text-white'
                                : profile.coins < item.price 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-slate-700 text-white hover:bg-white hover:text-slate-900 border border-slate-600'
                        }`}
                        >
                           {isJustBought ? <Check size={16} /> : <>{item.price} <Coins size={12} className={profile.coins >= item.price ? "text-yellow-400" : "text-slate-500"} fill={profile.coins >= item.price ? "#facc15" : "none"} /></>}
                        </button>
                    </div>
                    )
                })}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};