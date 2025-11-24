
import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Settings, Volume2, VolumeX, BrainCircuit, X, LogOut, Eye, Download, Trash2, Zap, Monitor, Smartphone, Upload } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    toggleSound,
    toggleHardMode,
    toggleHaptics,
    toggleHighContrast,
    toggleReducedMotion,
    logout,
    deleteAccount,
    exportData,
    importData
  } = useUser();

  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'data'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { error } = await import('../lib/supabase').then(m => m.supabase.from('profiles').select('count', { count: 'exact', head: true }));
      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows" which is fine for count
        console.error("Supabase check error:", error);
        // If auth fails, it might still be connected but restricted. 
        // Let's assume connected if we get a response, even an error response from the DB (unless it's a network error)
        if (error.message && error.message.includes('fetch')) {
          setConnectionStatus('error');
        } else {
          setConnectionStatus('connected');
        }
      } else {
        setConnectionStatus('connected');
      }
    } catch (e) {
      console.error("Connection failed:", e);
      setConnectionStatus('error');
    }
  };

  if (!isOpen) return null;

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ease-out flex items-center shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-500/50 ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
  );

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleDelete = () => {
    const confirmText = prompt("Type 'DELETE' to permanently erase your account and progress.");
    if (confirmText === 'DELETE') {
      deleteAccount();
      onClose();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importData(content);
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <Settings size={20} strokeWidth={2.5} />
            </div>
            Settings
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-900">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['general', 'visual', 'data'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === tab
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
              >
                {tab === 'general' && <Settings size={14} />}
                {tab === 'visual' && <Eye size={14} />}
                {tab === 'data' && <Download size={14} />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4 bg-slate-900 overflow-y-auto scrollbar-hide">

          {activeTab === 'general' && (
            <>
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${profile.settings.soundEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {profile.settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Sound Effects</div>
                    <div className="text-xs text-slate-400">Audio cues</div>
                  </div>
                </div>
                <Toggle active={profile.settings.soundEnabled} onClick={toggleSound} />
              </div>

              {/* Hard Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${profile.settings.hardMode ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Hard Mode</div>
                    <div className="text-xs text-slate-400">Hide scores</div>
                  </div>
                </div>
                <Toggle active={profile.settings.hardMode} onClick={toggleHardMode} />
              </div>

              {/* Haptics Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${profile.settings.hapticsEnabled ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Vibration</div>
                    <div className="text-xs text-slate-400">Haptic feedback</div>
                  </div>
                </div>
                <Toggle active={profile.settings.hapticsEnabled} onClick={toggleHaptics} />
              </div>
            </>
          )}

          {activeTab === 'visual' && (
            <>
              {/* High Contrast */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${profile.settings.highContrast ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Monitor size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">High Contrast</div>
                    <div className="text-xs text-slate-400">Enhanced visibility colors</div>
                  </div>
                </div>
                <Toggle active={profile.settings.highContrast} onClick={toggleHighContrast} />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${profile.settings.reducedMotion ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Reduced Motion</div>
                    <div className="text-xs text-slate-400">Disable complex animations</div>
                  </div>
                </div>
                <Toggle active={profile.settings.reducedMotion} onClick={toggleReducedMotion} />
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Download size={16} /> Data Management</h4>
                  <p className="text-xs text-slate-400">Save your progress or restore from a file.</p>
                </div>

                <button
                  onClick={exportData}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs border border-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Export Data
                </button>

                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={handleImportClick}
                    className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs border border-slate-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={14} /> Import Data
                  </button>
                </div>
              </div>

              {!profile.isGuest && (
                <>
                  {showLogoutConfirm ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 py-3 rounded-xl border border-red-500/50 bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} /> Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full py-3 rounded-xl border border-slate-700 bg-slate-800/30 text-slate-400 font-bold text-sm hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  )}

                  <div className="pt-4 border-t border-slate-800">
                    <button
                      onClick={handleDelete}
                      className="w-full py-3 rounded-xl border border-red-900/30 bg-red-950/10 text-red-500 font-bold text-sm hover:bg-red-900/30 hover:border-red-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        <div className="p-4 flex justify-between items-center border-t border-slate-800 bg-slate-950/30">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">v1.3.0 • WordHeat</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${connectionStatus === 'connected' ? 'text-emerald-500' :
              connectionStatus === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`}>
              {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'error' ? 'Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
