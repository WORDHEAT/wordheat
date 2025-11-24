
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { ShopModal } from './ShopModal';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';
import { ArchiveModal } from './ArchiveModal';
import { NotificationsModal } from './NotificationsModal';
import { ChatModal } from './ChatModal';
import { Flame, Coins, Book, ShoppingBag, Settings, HelpCircle, ChevronDown, Bell, MessageSquare } from 'lucide-react';
import { Icon } from './Icon';

interface HeaderProps {
  onHelpClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  const { profile, setLanguage, getLevel, t } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const unreadCount = profile.notifications ? profile.notifications.filter(n => !n.read).length : 0;
  const unreadChatCount = profile.messages.filter(m => !m.read && m.to === profile.username).length;
  const requestCount = profile.incomingRequests.length;

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex justify-between items-center shadow-lg transition-all">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => navigate('/home')}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-orange-500/20 shadow-lg group-hover:scale-105 transition-transform">
            <Flame size={20} strokeWidth={2.5} fill="white" className="text-white/90" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block tracking-tight">
            WordHeat
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          
           {/* Level / Profile Badge */}
           <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-2 bg-slate-800/80 pr-3 pl-1 py-1 rounded-full border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition-all group max-w-[120px] relative"
            title={t('nav.profile')}
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-slate-600 border border-slate-600 overflow-hidden">
               {profile.avatar ? <Icon name={profile.avatar} size={16} /> : <span className="text-[10px] font-bold">{getLevel()}</span>}
            </div>
            <div className="flex flex-col leading-none overflow-hidden">
               <span className="text-[10px] text-white font-bold truncate w-full">{profile.username || 'Guest'}</span>
               <span className="text-[8px] text-slate-400 font-bold tracking-wide">LVL {getLevel()}</span>
            </div>
            {requestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-slate-900 animate-pulse"></span>
            )}
          </div>

          {/* Stats Pills */}
          <div 
            className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors"
            onClick={() => setIsShopOpen(true)}
          >
            <Coins size={16} className="text-yellow-400" fill="#facc15" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">{profile.coins}</span>
          </div>
          
          {/* Language Selector */}
          {location.pathname === '/home' && (
            <div className="relative hidden sm:block">
              <select
                value={profile.language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-slate-800/80 text-white text-xs sm:text-sm rounded-lg border border-slate-700/50 pl-3 pr-8 py-1.5 focus:outline-none focus:border-orange-500 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {Object.values(Language).map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          <div className="h-6 w-px bg-slate-700 mx-1"></div>

          {/* Notifications Button */}
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all relative"
            title={t('nav.notifications')}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-slate-900 text-[9px] font-bold flex items-center justify-center text-white animate-pop">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
            )}
          </button>

           {/* Chat Button (Replaces Sound Toggle) */}
           <button 
            onClick={() => setIsChatOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all relative hidden sm:flex"
            title="Friends & Chat"
          >
            <MessageSquare size={18} />
            {unreadChatCount > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border border-slate-900 text-[9px] font-bold flex items-center justify-center text-white animate-pop">
                 {unreadChatCount > 9 ? '9+' : unreadChatCount}
               </span>
            )}
          </button>

          {/* Archive Button */}
          <button 
            onClick={() => setIsArchiveOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all hidden sm:flex"
            title={t('nav.collection')}
          >
            <Book size={18} />
          </button>

          {/* Shop Button */}
          <button 
            onClick={() => setIsShopOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            title={t('nav.shop')}
          >
            <ShoppingBag size={18} />
          </button>
          
          {/* Settings Button */}
           <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            title={t('nav.settings')}
          >
            <Settings size={18} />
          </button>

          {/* Help Button */}
          <button 
            onClick={onHelpClick}
            className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            title={t('nav.help')}
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};
