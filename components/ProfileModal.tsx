
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { PERKS } from '../utils/perks';
import { Icon } from './Icon';
import { User, X, Gamepad2, Trophy, Flame, Coins, CheckCircle, Edit3, Check, Sparkles, UserPlus, Trash2, ArrowLeft, Eye, MessageSquare, Send, ChevronLeft } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = [
  'User', 'Zap', 'Flame', 'Brain', 'Globe', 'PawPrint', 'Trophy', 'Gamepad2', 'Bot', 'Swords', 'Eye', 'Rocket'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, getLevel, updateProfile, openAuthModal, addFriend, removeFriend, acceptFriendRequest, declineFriendRequest, getPublicProfile, sendMessage, markChatRead } = useUser();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'perks' | 'friends'>('stats');

  // Viewing State
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);

  // Chat State
  const [chatFriend, setChatFriend] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.username);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Friends State
  const [friendInput, setFriendInput] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewedProfile(null);
      setChatFriend(null);
      setActiveTab('stats');
      setEditName(profile.username);
      setEditAvatar(profile.avatar);
    }
  }, [isOpen, profile]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatFriend && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatFriend, profile.messages]);

  // Mark read when opening chat
  useEffect(() => {
    if (chatFriend) {
      markChatRead(chatFriend);
    }
  }, [chatFriend, profile.messages]);

  if (!isOpen) return null;

  // Determine who we are looking at. If viewedProfile is null, we are looking at OURSELVES.
  const currentProfile = viewedProfile || profile;
  const isMe = !viewedProfile && !chatFriend;
  const isFriend = !isMe && !chatFriend && profile.friends.includes(currentProfile.username);

  // Calculate stats for the current view
  const currentLevel = isMe ? getLevel() : Math.floor(Math.sqrt(currentProfile.xp / 100)) + 1;
  const currentNextXp = Math.pow(currentLevel, 2) * 100;
  const currentPrevXp = Math.pow(currentLevel - 1, 2) * 100;
  const progress = Math.min(100, Math.max(0, ((currentProfile.xp - currentPrevXp) / (currentNextXp - currentPrevXp)) * 100));
  const winRate = currentProfile.gamesPlayed > 0 ? Math.round((currentProfile.wins / currentProfile.gamesPlayed) * 100) : 0;

  const handleSave = () => {
    if (editName.trim()) {
      updateProfile(editName.trim(), editAvatar, profile.isGuest, profile.email);
      setIsEditing(false);
    }
  };

  const handleCreateAccountClick = () => {
    onClose();
    setTimeout(() => {
      openAuthModal();
    }, 100);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditName(profile.isGuest ? '' : profile.username);
    setEditAvatar(profile.avatar);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (addFriend(friendInput)) {
      setFriendInput('');
    }
  };

  const handleViewFriend = async (username: string) => {
    const friendProfile = await getPublicProfile(username);
    if (friendProfile) {
      setViewedProfile(friendProfile);
      setActiveTab('stats');
    }
  };

  const handleOpenChat = (username: string) => {
    setChatFriend(username);
  };

  const handleCloseChat = () => {
    setChatFriend(null);
    setMessageInput('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatFriend && messageInput.trim()) {
      sendMessage(chatFriend, messageInput);
      setMessageInput('');
    }
  };

  const handleBackToMe = () => {
    setViewedProfile(null);
    setActiveTab('friends');
  };

  const handleToggleFriendStatus = () => {
    if (isFriend) {
      removeFriend(currentProfile.username);
    } else {
      addFriend(currentProfile.username);
    }
  };

  // --- Chat View ---
  if (chatFriend) {
    const myUsername = profile.username || 'Guest';
    const chatHistory = profile.messages.filter(m =>
      (m.from === myUsername && m.to === chatFriend) ||
      (m.from === chatFriend && m.to === myUsername)
    ).sort((a, b) => a.timestamp - b.timestamp);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
        <div
          className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <div className="flex items-center gap-3">
              <button onClick={handleCloseChat} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                  <User size={16} />
                </div>
                <h3 className="text-lg font-bold text-white">{chatFriend}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30 scrollbar-hide">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                <MessageSquare size={48} className="mb-2" />
                <p>Start the conversation!</p>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isMe = msg.from === myUsername;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isMe
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                      }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl w-10 flex items-center justify-center transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div
        className="bg-slate-900/95 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 flex flex-col items-center border-b border-slate-800 relative shrink-0 transition-colors">

          <div className="absolute top-4 left-4">
            {!isMe && (
              <button
                onClick={handleBackToMe}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800/50 text-white hover:bg-slate-700 transition-colors"
                title="Back to my profile"
              >
                <ArrowLeft size={18} />
              </button>
            )}
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {isEditing ? (
            <div className="w-full flex flex-col items-center animate-pop">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Edit Profile
              </h3>
              <div className="mb-4 grid grid-cols-6 gap-2">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => setEditAvatar(av)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${editAvatar === av ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    <Icon name={av} size={16} />
                  </button>
                ))}
              </div>
              <input
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-white font-bold mb-3 w-48 focus:outline-none focus:border-blue-500"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Enter Username"
                maxLength={12}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-full text-white text-xs font-bold flex items-center gap-1"
                >
                  <Check size={12} /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center relative group w-full">
              <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${isMe ? 'from-slate-700 to-slate-800' : 'from-indigo-600 to-purple-700'} flex items-center justify-center text-white shadow-xl ring-4 ring-slate-800/50 overflow-hidden`}>
                  <Icon name={currentProfile.avatar} size={48} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-black tracking-wider px-3 py-1 rounded-full border border-slate-700 shadow-sm whitespace-nowrap z-10">
                  LEVEL {currentLevel}
                </div>
                {isMe && !profile.isGuest && (
                  <button
                    onClick={startEditing}
                    className="absolute top-0 right-0 bg-slate-700 p-1.5 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg"
                    title="Edit Profile"
                  >
                    <Edit3 size={12} />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{currentProfile.username}</h2>

              {isMe && profile.isGuest ? (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <span className="text-[10px] text-slate-500 font-medium">Guest Account</span>
                  <button
                    onClick={handleCreateAccountClick}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/30 hover:border-blue-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 animate-pulse hover:animate-none hover:scale-105"
                  >
                    <Sparkles size={14} className="text-yellow-300" /> Sign Up to Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-3 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                  {!isMe ? (
                    <button
                      onClick={handleToggleFriendStatus}
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isFriend ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                    >
                      {isFriend ? (
                        <> <Trash2 size={10} /> Remove Friend </>
                      ) : (
                        <> <UserPlus size={10} /> Add Friend </>
                      )}
                    </button>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Verified Player</span>
                    </>
                  )}
                </div>
              )}

              <div className="w-full max-w-[200px] space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>XP</span>
                  <span>{Math.floor(currentProfile.xp)} / {currentNextXp}</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-900">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            {/* Only show full tabs for Me. If viewing friend, show specific ones. */}
            {(isMe ? ['stats', 'achievements', 'perks', 'friends'] : ['stats', 'achievements']).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all uppercase tracking-wide whitespace-nowrap relative ${activeTab === tab
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
              >
                {tab}
                {tab === 'friends' && profile.incomingRequests.length > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 scrollbar-hide flex-1">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-3 animate-pop">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                  <Gamepad2 size={18} />
                </div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Games</div>
                <div className="text-xl font-bold text-white">{currentProfile.gamesPlayed}</div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <Trophy size={18} />
                </div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Win Rate</div>
                <div className="text-xl font-bold text-white">{winRate}%</div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2">
                  <Flame size={18} fill="currentColor" />
                </div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Streak</div>
                <div className="text-xl font-bold text-white">{currentProfile.streak}</div>
              </div>

              {isMe && (
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-2">
                    <Coins size={18} fill="currentColor" />
                  </div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Wealth</div>
                  <div className="text-xl font-bold text-white">{currentProfile.coins}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3 animate-pop">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Unlocks</div>
                <div className="text-[10px] text-white font-bold bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                  {isMe ? profile.unlockedAchievements.length : '???'} / {ACHIEVEMENTS.length}
                </div>
              </div>

              {ACHIEVEMENTS.map(ach => {
                let isUnlocked = false;
                if (isMe) {
                  isUnlocked = profile.unlockedAchievements.includes(ach.id);
                } else {
                  if (ach.id === 'first_win' && currentProfile.wins >= 1) isUnlocked = true;
                  if (ach.id === 'veteran' && currentProfile.gamesPlayed >= 10) isUnlocked = true;
                  if (ach.id === 'streak_3' && currentProfile.streak >= 3) isUnlocked = true;
                }

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${isUnlocked
                        ? 'bg-slate-800/60 border-emerald-500/20'
                        : 'bg-slate-800/20 border-slate-800 opacity-50 grayscale'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-600'}`}>
                      <Icon name={ach.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {ach.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{ach.description}</div>
                    </div>
                    {isUnlocked && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'perks' && isMe && (
            <div className="space-y-3 animate-pop">
              <div className="text-xs text-slate-500 uppercase font-bold mb-2 px-1 tracking-wider">Passive Abilities</div>
              {PERKS.map(perk => {
                const isUnlocked = currentLevel >= perk.unlockLevel;
                return (
                  <div
                    key={perk.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${isUnlocked
                        ? 'bg-blue-900/10 border-blue-500/20'
                        : 'bg-slate-800/20 border-slate-800'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isUnlocked ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                      <Icon name={perk.icon} size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{perk.name}</span>
                        {!isUnlocked ? (
                          <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold border border-slate-700">LVL {perk.unlockLevel}</span>
                        ) : (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-500/30">ACTIVE</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{perk.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'friends' && isMe && (
            <div className="space-y-4 animate-pop">
              {/* Incoming Requests Section - Only visible if there are requests */}
              {profile.incomingRequests.length > 0 && (
                <div className="space-y-2 mb-4 bg-slate-800/20 p-3 rounded-2xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-bold px-1 tracking-wider flex items-center gap-2 mb-2">
                    <span>Pending Requests</span>
                    <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{profile.incomingRequests.length}</span>
                  </div>
                  {profile.incomingRequests.map((reqName) => (
                    <div key={reqName} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-600">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{reqName}</div>
                          <div className="text-[9px] text-slate-500">Wants to be friends</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptFriendRequest(reqName)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => declineFriendRequest(reqName)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Decline"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Friend Form */}
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="text"
                  value={friendInput}
                  onChange={(e) => setFriendInput(e.target.value)}
                  placeholder="Add by Username..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!friendInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl w-10 flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <UserPlus size={18} />
                </button>
              </form>

              {/* Friend List */}
              <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase font-bold px-1 tracking-wider flex justify-between">
                  <span>Address Book</span>
                  <span>{profile.friends.length}</span>
                </div>

                {profile.friends.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <UserPlus size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Your contact list is empty.</p>
                    <p className="text-xs text-slate-600 mt-1">Add friends to challenge them directly!</p>
                  </div>
                ) : (
                  profile.friends.map((friendName, i) => {
                    const unreadCount = profile.messages.filter(m => m.from === friendName && !m.read).length;

                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => handleViewFriend(friendName)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/10">
                            <User size={14} />
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{friendName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenChat(friendName)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors relative"
                            title="Message"
                          >
                            <MessageSquare size={14} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold border border-slate-900">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleViewFriend(friendName)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => removeFriend(friendName)}
                            className="p-1.5 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove Friend"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
