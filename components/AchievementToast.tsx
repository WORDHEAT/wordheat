
import React from 'react';
import { AppNotification } from '../types';
import { Icon } from './Icon';

interface AchievementToastProps {
  notification: AppNotification;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ notification, onClose }) => {
  const getBg = () => {
    switch (notification.type) {
      case 'achievement': return 'bg-slate-800 border-yellow-500/30 shadow-yellow-500/10';
      case 'success': return 'bg-slate-800 border-emerald-500/30 shadow-emerald-500/10';
      case 'levelup': return 'bg-slate-800 border-purple-500/30 shadow-purple-500/10';
      default: return 'bg-slate-800 border-slate-600 shadow-lg';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'achievement': return 'text-yellow-500 bg-yellow-500/10';
      case 'success': return 'text-emerald-500 bg-emerald-500/10';
      case 'levelup': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  }

  return (
    <div
      className={`pointer-events-auto mb-3 w-full max-w-sm rounded-xl border p-4 shadow-2xl backdrop-blur-md text-white flex items-center gap-4 animate-pop cursor-pointer hover:scale-[1.02] transition-transform ${getBg()}`}
      onClick={onClose}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor()}`}>
        {/* If icon string matches a Lucide icon key, render it. Else fallback/emoji */}
        {notification.icon && notification.icon.length > 2 ? <Icon name={notification.icon} size={20} /> : <span className="text-xl">{notification.icon || '✨'}</span>}
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">
          {notification.type === 'achievement' ? 'Achievement Unlocked' : notification.type === 'levelup' ? 'Level Up!' : 'Notification'}
        </div>
        <div className="font-bold text-sm leading-tight mt-0.5">{notification.message}</div>
        {notification.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (notification.action.onClick) {
                notification.action.onClick();
              } else if (notification.action.url) {
                window.location.hash = notification.action.url;
              }
              onClose();
            }}
            className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            {notification.action.label}
          </button>
        )}
      </div>
    </div>
  );
};
