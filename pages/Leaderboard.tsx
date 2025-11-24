
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useUser } from '../context/UserContext';
import { Trophy, Shield, Crown, Award, Gem, Zap, Target } from 'lucide-react';

type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

const getLeague = (xp: number): League => {
  if (xp >= 50000) return 'Diamond';
  if (xp >= 20000) return 'Platinum';
  if (xp >= 7500) return 'Gold';
  if (xp >= 2500) return 'Silver';
  return 'Bronze';
};

const getLeagueColor = (league: League) => {
  switch (league) {
    case 'Diamond': return 'from-fuchsia-500 to-purple-600';
    case 'Platinum': return 'from-cyan-400 to-blue-500';
    case 'Gold': return 'from-yellow-400 to-amber-500';
    case 'Silver': return 'from-slate-300 to-slate-400';
    case 'Bronze': return 'from-orange-700 to-orange-900';
  }
};

const getLeagueIcon = (league: League) => {
  switch (league) {
    case 'Diamond': return Gem;
    case 'Platinum': return Zap;
    case 'Gold': return Crown;
    case 'Silver': return Shield;
    case 'Bronze': return Award;
  }
};

const Leaderboard: React.FC = () => {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<'history' | 'standards'>('history');

  const userLeague = getLeague(profile.xp);
  const LeagueIcon = getLeagueIcon(userLeague);
  const leagueGradient = getLeagueColor(userLeague);

  const myHistory = [...profile.solvedWords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Static global benchmarks for comparison
  const standards = [
     { level: 'Diamond', guesses: 5, reward: 'Master', desc: "Solve in 5 guesses or less" },
     { level: 'Platinum', guesses: 10, reward: 'Expert', desc: "Solve in 10 guesses or less" },
     { level: 'Gold', guesses: 20, reward: 'Pro', desc: "Solve in 20 guesses or less" },
     { level: 'Silver', guesses: 40, reward: 'Novice', desc: "Solve in 40 guesses or less" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
       <Header />
       <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6">
          
          {/* Hero Header - League Display */}
          <div className="flex flex-col items-center mb-8 text-center animate-pop">
             <div className="relative mb-4">
                <div className={`absolute inset-0 blur-xl opacity-40 rounded-full bg-gradient-to-br ${leagueGradient}`}></div>
                <div className={`relative w-20 h-20 bg-gradient-to-br ${leagueGradient} rounded-3xl flex items-center justify-center shadow-lg shadow-black/20 transform rotate-3 border border-white/20 ring-4 ring-black/20`}>
                    <LeagueIcon size={40} className="text-white drop-shadow-md" fill="currentColor" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-700 shadow-xl">
                  {userLeague} League
                </div>
             </div>
             <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight mt-2">Personal Ranking</h1>
             <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span>{profile.wins} Wins</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-slate-300 font-medium">{profile.xp.toLocaleString()} XP</span>
             </div>
          </div>

          {/* Toggle */}
          <div className="flex p-1.5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 mb-8 max-w-xs mx-auto shadow-lg">
             <button 
               onClick={() => setActiveTab('history')}
               className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <Trophy size={14} /> My Victories
             </button>
             <button 
               onClick={() => setActiveTab('standards')}
               className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'standards' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <Target size={14} /> Global Par
             </button>
          </div>

          {/* Leaderboard List */}
          <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md shadow-2xl relative">
             
             {activeTab === 'history' && (
                <>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-700/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-6">Word</div>
                        <div className="col-span-3 text-center">Guesses</div>
                        <div className="col-span-3 text-right">Date</div>
                    </div>

                    <div className="divide-y divide-slate-700/30 max-h-[55vh] overflow-y-auto scrollbar-hide">
                        {myHistory.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                <Trophy size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No wins recorded yet.</p>
                                <p className="text-xs">Start playing to build your legacy!</p>
                            </div>
                        ) : (
                            myHistory.map((game, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-slate-700/30 transition-colors">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${game.guessesCount <= 10 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {game.word.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm capitalize">{game.word}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">{game.mode} Mode</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-center font-mono font-bold text-slate-300">
                                        {game.guessesCount}
                                    </div>
                                    <div className="col-span-3 text-right text-xs text-slate-500">
                                        {new Date(game.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
             )}

             {activeTab === 'standards' && (
                <div className="p-6">
                    <h3 className="text-white font-bold mb-4 text-center">Global Performance Standards</h3>
                    <div className="space-y-3">
                        {standards.map((s, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border bg-gradient-to-br ${
                                    s.level === 'Diamond' ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300' :
                                    s.level === 'Platinum' ? 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300' :
                                    s.level === 'Gold' ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300' :
                                    'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-300'
                                }`}>
                                    <Crown size={20} fill="currentColor" className="opacity-80" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">{s.level} Standard</span>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400">{s.reward}</span>
                                    </div>
                                    <div className="text-sm text-slate-400">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-6">
                        Aim for these benchmarks in your daily games to estimate your skill level.
                    </p>
                </div>
             )}

          </div>
       </main>
    </div>
  );
};

export default Leaderboard;
