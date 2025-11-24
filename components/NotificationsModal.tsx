
import React from 'react';
import { useUser } from '../context/UserContext';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Icon } from './Icon';

interface NotificationsModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
   const { profile, markAllRead, clearNotifications } = useUser();

   if (!isOpen) return null;

   const getTimeAgo = (ts: number) => {
      const seconds = Math.floor((Date.now() - ts) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6 pointer-events-none">
         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>

         <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] pointer-events-auto animate-pop relative z-50 mt-14 mr-0 sm:mr-10"
            onClick={e => e.stopPropagation()}
         >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
               <div className="flex items-center gap-2">
                  <Bell size={16} className="text-slate-400" />
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{profile.notifications.length}</span>
               </div>
               <div className="flex gap-2">
                  <button onClick={markAllRead} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title="Mark all read">
                     <Check size={16} />
                  </button>
                  <button onClick={clearNotifications} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Clear all">
                     <Trash2 size={16} />
                  </button>
                  <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                     <X size={16} />
                  </button>
               </div>
            </div>

            <div className="overflow-y-auto p-2 scrollbar-hide flex-1">
               {(!profile.notifications || profile.notifications.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                     No notifications yet.
                  </div>
               ) : (
                  <div className="space-y-1">
                     {profile.notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl flex gap-3 transition-colors ${n.read ? 'opacity-60' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${n.type === 'achievement' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                 n.type === 'levelup' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                    n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                       'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                              {n.icon ? <Icon name={n.icon} size={14} /> : <Bell size={14} />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-xs text-slate-200 font-medium leading-tight">{n.message}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{getTimeAgo(n.timestamp)}</div>
                              {n.action && (
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (n.action.onClick) {
                                          n.action.onClick();
                                       } else if (n.action.url) {
                                          window.location.hash = n.action.url;
                                       }
                                       onClose();
                                    }}
                                    className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors w-full sm:w-auto"
                                 >
                                    {n.action.label}
                                 </button>
                              )}
                           </div>
                           {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
