

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Header } from '../components/Header';
import { HelpModal } from '../components/HelpModal';
import { GameSetupModal } from '../components/GameSetupModal';
import { ChallengeCreateModal } from '../components/ChallengeCreateModal';
import { ArchiveModal } from '../components/ArchiveModal';
import { DailyMissionsWidget } from '../components/DailyMissionsWidget';
import { THEMES } from '../utils/themes';
import { Calendar, Infinity, Zap, Swords, Trophy, History, Sparkles, ArrowRight } from 'lucide-react';
import { Icon } from '../components/Icon';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, openAuthModal, t, isLoading } = useUser();
  const [showHelp, setShowHelp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [archiveModalState, setArchiveModalState] = useState<{ isOpen: boolean, tab: 'collection' | 'calendar' }>({
    isOpen: false,
    tab: 'collection'
  });

  useEffect(() => {
    if (!isLoading && !profile.username) {
      openAuthModal();
    }
  }, [profile.username, isLoading]);

  const currentTheme = THEMES[profile.activeTheme] || THEMES['default'];
  const isTutorialNeeded = !profile.tutorialCompleted;

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ease-in-out ${currentTheme.bgHome}`}>
      <Header onHelpClick={() => setShowHelp(true)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <GameSetupModal isOpen={showSetup} onClose={() => setShowSetup(false)} />
      <ChallengeCreateModal isOpen={showChallenge} onClose={() => setShowChallenge(false)} />
      <ArchiveModal isOpen={archiveModalState.isOpen} onClose={() => setArchiveModalState(prev => ({ ...prev, isOpen: false }))} initialTab={archiveModalState.tab} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">

        {/* Background Accents */}
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-10 bg-gradient-to-br ${currentTheme.heatColors[4]} animate-pulse`}></div>
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-10 bg-gradient-to-br ${currentTheme.heatColors[2]} animate-pulse`}></div>

        <div className="text-center mb-6 z-10 w-full max-w-lg">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-3 animate-pop">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
              WordHeat
            </span>
          </h1>
          <p className="text-base text-slate-400 max-w-md mx-auto mb-10 font-medium leading-relaxed">
            {t('app.subtitle')} <br />
            <span className="text-slate-500 text-sm">{t('app.hotter')}</span>
          </p>

          {!isTutorialNeeded && <DailyMissionsWidget />}
        </div>

        <div className="grid gap-4 w-full max-w-sm z-10">

          {isTutorialNeeded ? (
            <button
              onClick={() => navigate('/game?mode=tutorial')}
              className="group relative px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105 flex items-center justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30"></div>
              <div className="relative z-10 text-left">
                <div className="text-emerald-100 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles size={12} /> First Time?</div>
                <div className="text-white font-black text-2xl">Start Tutorial</div>
                <div className="text-emerald-100 text-sm mt-1">Learn to play in 30s</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md text-white group-hover:scale-110 transition-transform shadow-lg border border-white/30">
                <ArrowRight size={24} />
              </div>
            </button>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/game?mode=daily')}
                  className="flex-1 group relative px-6 py-5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl border border-slate-700/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(251,191,36,0.15)] text-left overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute inset-0 w-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 opacity-80"></div>
                  <div className="relative flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-lg">{t('mode.daily')}</div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">{t('mode.daily.desc')}</div>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-xl text-yellow-400 group-hover:bg-yellow-500 group-hover:text-yellow-950 transition-colors">
                      <Calendar size={24} />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setArchiveModalState({ isOpen: true, tab: 'calendar' })}
                  className="w-16 bg-slate-800/60 hover:bg-slate-700 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-slate-400 hover:text-yellow-400 transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] backdrop-blur-sm"
                  title="Past Challenges"
                >
                  <History size={20} />
                  <span className="text-[9px] font-bold uppercase mt-1">Past</span>
                </button>
              </div>

              <button
                onClick={() => setShowSetup(true)}
                className="group relative px-6 py-5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl border border-slate-700/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] text-left overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute inset-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500 opacity-80"></div>
                <div className="relative flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-lg">{t('mode.unlimited')}</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">{t('mode.unlimited.desc')}</div>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-cyan-950 transition-colors">
                    <Infinity size={24} />
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/game?mode=blitz')}
                className="group relative px-6 py-5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl border border-slate-700/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] text-left overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute inset-0 w-1.5 bg-gradient-to-b from-purple-500 to-fuchsia-600 opacity-80"></div>
                <div className="relative flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-lg">{t('mode.blitz')}</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">{t('mode.blitz.desc')} (Best: {profile.blitzHighScore})</div>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-purple-950 transition-colors">
                    <Zap size={24} fill="currentColor" />
                  </div>
                </div>
              </button>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowChallenge(true)}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-[1.02] text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Swords size={16} /> {t('btn.challenge')}
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-[1.02] text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Trophy size={16} /> {t('btn.ranks')}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-10 text-center z-10">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
            {t('lang.playing')} <span className="text-slate-400">{profile.language}</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;