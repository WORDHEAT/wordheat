
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Swords, X, Link, Copy, Check, Plus, ArrowRight, Smartphone, Globe2, Users, Target, Share, Send, User } from 'lucide-react';

interface ChallengeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengeCreateModal: React.FC<ChallengeCreateModalProps> = ({ isOpen, onClose }) => {
  const { profile, showToast, sendMessage, createChallenge } = useUser();
  const navigate = useNavigate();
  const [gameType, setGameType] = useState<'1v1' | '2v2' | 'battle4'>('1v1');
  const [playMode, setPlayMode] = useState<'local' | 'remote'>('local');
  const [word, setWord] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [sentTo, setSentTo] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const encodedWord = word.trim() ? btoa(word.trim().toLowerCase()) : '';

    // Determine params based on selection
    let playerCount = 2;
    if (gameType === 'battle4') playerCount = 4;

    const isTeam = gameType === '2v2';

    if (playMode === 'local') {
      // Navigate to Game with party params
      let url = `/game?mode=party&players=${playerCount}`;
      if (encodedWord) url += `&word=${encodedWord}`;
      if (isTeam) url += `&teams=true`;

      // Add names param
      const activeNames = playerNames.slice(0, isTeam ? 2 : playerCount).map(n => n.trim());
      // Filter out empty names to let Game.tsx handle defaults, or send them all
      if (activeNames.some(n => n)) {
        url += `&names=${encodeURIComponent(activeNames.join(','))}`;
      }

      navigate(url);
      onClose();
      reset();
    } else {
      // Generate Link
      let link = `${window.location.origin}${window.location.pathname}#/game?mode=challenge`;
      if (encodedWord) link += `&word=${encodedWord}`;
      // Add type param so the receiver sees "1v1 Duel" etc.
      link += `&type=${gameType}`;

      setGeneratedLink(link);
      setCopied(false);
      setSentTo([]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Link copied to clipboard!', 'success');
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WordHeat Challenge',
          text: `I challenge you to a WordHeat battle! Can you guess the secret word?`,
          url: generatedLink
        });
        showToast('Challenge shared!', 'success');
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  const sendToFriend = async (friendName: string) => {
    if (sentTo.includes(friendName)) return;

    // Use database challenge system instead of link
    const encodedWord = word.trim() ? btoa(word.trim().toLowerCase()) : '';
    const seed = encodedWord || `${Date.now()}`;
    const actualWord = word.trim() || 'mystery'; // Database needs actual word
    const isSecretWord = !!word.trim();

    const challenge = await createChallenge(friendName, actualWord, seed, isSecretWord);

    if (challenge) {
      setSentTo(prev => [...prev, friendName]);

      if (isSecretWord) {
        // If I set a secret word, I am the "Setter" - navigate to spectator mode
        showToast(`Challenge sent! Watch ${friendName} solve it.`, 'success', 'Swords');
        navigate(`/game?challenge=${challenge.id}`);
        onClose();
        reset();
      } else {
        // If random word, we both play
        navigate(`/game?challenge=${challenge.id}`);
        onClose();
        reset();
      }
    }
  };

  const reset = () => {
    setWord('');
    setGeneratedLink('');
    setCopied(false);
    setSentTo([]);
    setPlayerNames(['', '', '', '']);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
              <Swords size={20} strokeWidth={2.5} />
            </div>
            Challenge Mode
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-hide">
          {!generatedLink ? (
            <>
              {/* Game Type Selection */}
              <div className="px-6 pt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => setGameType('1v1')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${gameType === '1v1' ? 'bg-slate-800 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  <Swords size={24} className={gameType === '1v1' ? 'text-red-400' : 'opacity-50'} />
                  <span className="text-xs font-bold">1v1 Duel</span>
                </button>
                <button
                  onClick={() => setGameType('2v2')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${gameType === '2v2' ? 'bg-slate-800 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  <Users size={24} className={gameType === '2v2' ? 'text-blue-400' : 'opacity-50'} />
                  <span className="text-xs font-bold">2v2 Teams</span>
                </button>
                <button
                  onClick={() => setGameType('battle4')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${gameType === 'battle4' ? 'bg-slate-800 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  <Target size={24} className={gameType === 'battle4' ? 'text-purple-400' : 'opacity-50'} />
                  <span className="text-xs font-bold">Battle 4</span>
                </button>
              </div>

              {/* Play Mode Tabs */}
              <div className="px-6 py-4">
                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setPlayMode('local'); reset(); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${playMode === 'local'
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                  >
                    <Smartphone size={14} /> Pass & Play
                  </button>
                  <button
                    onClick={() => { setPlayMode('remote'); reset(); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${playMode === 'remote'
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                  >
                    <Globe2 size={14} /> Create Link
                  </button>
                </div>
              </div>

              <div className="p-6 pt-0 bg-slate-900">
                {playMode === 'local' ? (
                  <div className="mb-6 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {gameType === '2v2' ? 'Team Names' : 'Player Names'}
                    </div>

                    {gameType === '1v1' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={playerNames[0]}
                          onChange={(e) => handleNameChange(0, e.target.value)}
                          placeholder="Player 1"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors text-center"
                        />
                        <input
                          type="text"
                          value={playerNames[1]}
                          onChange={(e) => handleNameChange(1, e.target.value)}
                          placeholder="Player 2"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors text-center"
                        />
                      </div>
                    )}

                    {gameType === '2v2' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={playerNames[0]}
                          onChange={(e) => handleNameChange(0, e.target.value)}
                          placeholder="Team Red"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors text-center"
                        />
                        <input
                          type="text"
                          value={playerNames[1]}
                          onChange={(e) => handleNameChange(1, e.target.value)}
                          placeholder="Team Blue"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors text-center"
                        />
                      </div>
                    )}

                    {gameType === 'battle4' && (
                      <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map(i => (
                          <input
                            key={i}
                            type="text"
                            value={playerNames[i]}
                            onChange={(e) => handleNameChange(i, e.target.value)}
                            placeholder={`Player ${i + 1}`}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors text-center"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed text-center bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                    Generate a unique link to send to your friends via WhatsApp, Messenger, or in-game chat.
                  </p>
                )}

                <form onSubmit={handleCreate}>
                  <div className="relative mb-6 group">
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder=" "
                      className="peer w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-transparent text-center font-bold"
                    />
                    <label className="absolute left-1/2 -translate-x-1/2 top-4 text-slate-500 text-lg transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:bg-slate-900 peer-focus:px-2 peer-focus:text-red-500 pointer-events-none peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-slate-900 peer-not-placeholder-shown:px-2 whitespace-nowrap">
                      Secret Word (Optional)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-2xl shadow-lg transition-all shadow-red-600/20 flex items-center justify-center gap-2 group hover:scale-[1.02]"
                  >
                    {playMode === 'local' ? 'Start Game' : 'Generate Invite Link'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-6 bg-slate-900 text-center animate-pop">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-900/30">
                <Link size={28} className="text-white" strokeWidth={2} />
              </div>
              <h4 className="text-white font-bold text-xl mb-1">Challenge Ready!</h4>
              <p className="text-slate-400 text-xs mb-6">
                Share with friends to start the duel.
              </p>

              <div className="bg-slate-950/80 p-3 rounded-xl text-slate-500 text-[10px] break-all font-mono mb-6 border border-slate-800 select-all">
                {generatedLink}
              </div>

              <div className="flex flex-col gap-3">
                {/* Friend List Section */}
                {profile.friends.length > 0 && (
                  <div className="mb-2">
                    <div className="text-left text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Send to Friend</div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {profile.friends.map(friend => (
                        <button
                          key={friend}
                          onClick={() => sendToFriend(friend)}
                          disabled={sentTo.includes(friend)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${sentTo.includes(friend) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}`}
                        >
                          <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300">
                            <User size={12} />
                          </div>
                          <span className="text-xs font-bold">{friend}</span>
                          {sentTo.includes(friend) && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareLink}
                    className="py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl shadow-lg transition-all text-white flex items-center justify-center gap-2 text-sm"
                  >
                    <Share size={16} /> Share
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className={`py-3 font-bold rounded-xl border transition-all flex items-center justify-center gap-2 text-sm ${copied ? 'bg-emerald-600 text-white border-transparent' : 'bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800'}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full mt-6 py-3 bg-transparent hover:bg-slate-800 text-slate-400 font-bold rounded-xl border border-transparent hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} /> Create Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
