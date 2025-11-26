import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Language, AppNotification, GameState, SolvedWord, MissionType, DailyMission, ChatMessage, Challenge } from '../types';
import { THEMES } from '../utils/themes';
import { CATEGORIES } from '../utils/categories';
import { CONSUMABLES } from '../utils/consumables';
import { generateDailyMissions } from '../utils/missions';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { TRANSLATIONS } from '../utils/translations';

interface UserContextType {
  profile: UserProfile;
  activeToasts: AppNotification[];
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateProfile: (username: string, avatar: string, isGuest: boolean, email?: string) => void;
  logout: () => Promise<void>;
  deleteAccount: () => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  buyTheme: (themeId: string) => boolean;
  equipTheme: (themeId: string) => void;
  buyCategory: (categoryId: string) => boolean;
  buyItem: (itemId: string) => boolean;
  useItem: (itemId: string) => boolean;
  setLanguage: (lang: Language) => void;
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  updateBlitzHighScore: (score: number) => void;
  registerWin: (word: string, guessesCount: number, mode: string, seed?: string) => void;
  updateMissionProgress: (type: MissionType, amount: number) => void;
  claimMission: (missionId: string) => void;
  completeTutorial: () => void;
  getLevel: () => number;
  getNextLevelXp: () => number;
  getHintCost: (type: 'word' | 'sentence') => number;
  getWinCoinReward: () => number;
  getBlitzStartDuration: () => number;
  checkAchievements: (gameState?: GameState) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'achievement' | 'levelup', icon?: string, action?: { label: string; url?: string; onClick?: () => void }) => void;
  removeToast: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  toggleSound: () => void;
  toggleHardMode: () => void;
  toggleHaptics: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  triggerHaptic: () => void;
  t: (key: string) => string;
  addFriend: (username: string) => boolean;
  removeFriend: (username: string) => void;
  acceptFriendRequest: (username: string) => void;
  declineFriendRequest: (username: string) => void;
  getPublicProfile: (username: string) => Promise<UserProfile | null>;
  sendMessage: (to: string, text: string) => void;
  markChatRead: (friend: string) => void;
  deleteChatHistory: (friend: string) => void;
  createChallenge: (opponent: string, word: string, seed: string, isSecretWord?: boolean) => Promise<Challenge | null>;
  acceptChallenge: (challengeId: string) => Promise<boolean>;
  updateChallengeProgress: (challengeId: string, isChallenger: boolean, guesses: number, finished: boolean) => Promise<void>;
  getChallenge: (challengeId: string) => Promise<Challenge | null>;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  username: '',
  avatar: 'User',
  isGuest: true,
  xp: 0,
  coins: 50,
  streak: 0,
  lastPlayedDate: null,
  ownedThemes: ['default'],
  activeTheme: 'default',
  ownedCategories: ['common'],
  inventory: {},
  language: Language.ENGLISH,
  gamesPlayed: 0,
  wins: 0,
  blitzHighScore: 0,
  solvedWords: [],
  dailyMissions: [],
  unlockedAchievements: [],
  notifications: [],
  friends: [],
  incomingRequests: [],
  messages: [],
  settings: {
    soundEnabled: true,
    hardMode: false,
    hapticsEnabled: true,
    highContrast: false,
    reducedMotion: false
  },
  tutorialCompleted: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    // Check local storage for guest
    const saved = localStorage.getItem('wordheat_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check Daily Missions
        const today = new Date().toLocaleDateString('en-CA');
        if (!parsed.lastPlayedDate || parsed.lastPlayedDate !== today || !parsed.dailyMissions || parsed.dailyMissions.length === 0) {
          parsed.dailyMissions = generateDailyMissions();
          parsed.lastPlayedDate = today;
        }
        setProfile({ ...defaultProfile, ...parsed });
      } catch (e) { }
    }

    // Check Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) {
        // Pass email from session since profile table doesn't have it
        loadOnlineProfile(session.user.id, session.user.user_metadata, session.user.email).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (session) {
        loadOnlineProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else if (!session && userSession) {
        // If we were logged in and now are not, reset to defaults
        setProfile(defaultProfile);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Full Profile from Supabase
  const loadOnlineProfile = async (userId: string, metadata?: any, email?: string) => {
    try {
      // Use ensureProfileExists to handle missing profile rows for authenticated users
      // This will recover 'stuck' accounts that have auth but no profile
      const p = await api.ensureProfileExists(
        userId,
        metadata?.username || 'Player',
        metadata?.avatar || 'User'
      );

      // Check Daily Missions
      const today = new Date().toLocaleDateString('en-CA');
      if (!p.lastPlayedDate || p.lastPlayedDate !== today || !p.dailyMissions || p.dailyMissions.length === 0) {
        p.dailyMissions = generateDailyMissions();
        p.lastPlayedDate = today;
      }

      // Merge DB profile with session email
      setProfile(prev => ({ ...prev, ...p, isGuest: false, email: email || prev.email }));
      fetchFriends(userId);
    } catch (e: any) {
      console.error("Error loading profile", e);
      let msg = e.message || 'Unknown error';
      if (typeof e === 'object' && e !== null && !e.message) {
        try {
          msg = JSON.stringify(e);
        } catch (err) {
          msg = "Database Error";
        }
      }
      addNotification(`Profile Error: ${msg}`, 'info', 'AlertCircle');
    }
  };

  // 3. Fetch Friends & Realtime Subscription
  const fetchFriends = async (userId: string) => {
    try {
      const rawFriends = await api.getFriends(userId);
      const friendList: string[] = [];
      const requestList: string[] = [];

      rawFriends.forEach((f: any) => {
        // Identify if I am the requester or receiver
        const amIRequester = f.requester_id === userId;

        // Get username from joined data
        // Structure matches the API select: requester: { username: '...' }, receiver: { username: '...' }
        const otherUsername = amIRequester ? f.receiver?.username : f.requester?.username;

        if (!otherUsername) return;

        if (f.status === 'accepted') {
          friendList.push(otherUsername);
        } else if (f.status === 'pending' && !amIRequester) {
          // Only show request if I am the receiver
          requestList.push(otherUsername);
        }
      });

      setProfile(prev => ({
        ...prev,
        friends: friendList,
        incomingRequests: requestList
      }));

      // Subscribe to Friend Changes
      const channel = supabase
        .channel('friendships_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
          fetchFriends(userId); // Refresh on any change
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };

    } catch (e) { console.error("Error fetching friends", e); }
  };

  // 4. Sync State -> Database (Debounced)
  useEffect(() => {
    if (userSession && !profile.isGuest) {
      const timeout = setTimeout(() => {
        api.updateProfile(userSession.user.id, profile);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      localStorage.setItem('wordheat_user', JSON.stringify(profile));
    }
  }, [profile, userSession]);


  // --- Actions ---


  const addNotification = (
    message: string,
    type: 'success' | 'info' | 'achievement' | 'levelup' = 'info',
    icon?: string,
    action?: { label: string; url?: string; onClick?: () => void }
  ) => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { id, message, type, icon, timestamp: Date.now(), read: false, action };
    setActiveToasts(prev => [...prev.slice(-3), newNotif]);
    setTimeout(() => removeToast(id), 5000); // Increased from 3s to 5s for actions
    setProfile(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications].slice(0, 30) }));
  };
  const removeToast = (id: string) => setActiveToasts(prev => prev.filter(n => n.id !== id));

  const updateProfile = async (username: string, avatar: string, isGuest: boolean, email?: string) => {
    if (isGuest) {
      setProfile(prev => ({ ...prev, username, avatar, isGuest, email }));
      setIsAuthModalOpen(false);
    } else {
      // If user is trying to register via AuthModal, the Modal handles api.register
      // This function updates local state for immediate feedback
      // However, if we are just editing profile:
      if (userSession) {
        // Update DB immediately for profile info changes
        const updates = { username, avatar };
        try {
          await api.updateProfile(userSession.user.id, updates);
          setProfile(prev => ({ ...prev, username, avatar }));
        } catch (e) {
          console.error(e);
        }
      } else if (email) {
        // This path usually called during registration flow in AuthModal
        // We assume AuthModal calls api.register which handles DB creation
        // We just update local state to reflect 'logged in' pending real auth state change
        setProfile(prev => ({ ...prev, username, avatar, isGuest: false, email }));
      }
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error("Logout API failed, forcing local logout", e);
    }
    setProfile(defaultProfile);
    setUserSession(null);
    window.location.reload();
  };

  const deleteAccount = async () => {
    // Implement API delete if needed, for now just logout
    logout();
  };

  // --- Friend Actions ---

  const addFriend = (username: string) => {
    if (!username.trim()) return false;

    // Guest Mode (Local)
    if (profile.isGuest) {
      if (!profile.friends.includes(username)) {
        setProfile(prev => ({ ...prev, friends: [...prev.friends, username] }));
        addNotification(`Added ${username} locally`, 'success');
        return true;
      }
      return false;
    }

    // Online Mode
    if (userSession) {
      api.sendFriendRequest(userSession.user.id, username)
        .then(() => addNotification(`Request sent to ${username}`, 'success'))
        .catch((e: any) => addNotification(e.message, 'info'));
      return true;
    }
    return false;
  };

  const acceptFriendRequest = async (username: string) => {
    if (userSession) {
      // We need the friendship ID. We can re-fetch or search local state if we stored IDs.
      // For simplicity, let's re-fetch to find the ID corresponding to this username
      try {
        const rawFriends = await api.getFriends(userSession.user.id);
        const req = rawFriends.find((f: any) =>
          f.requester?.username === username && f.status === 'pending'
        );

        if (req) {
          await api.acceptFriendRequest(req.id);
          addNotification(`You are now friends with ${username}`, 'success');
          // Optimistic update
          setProfile(prev => ({
            ...prev,
            friends: [...prev.friends, username],
            incomingRequests: prev.incomingRequests.filter(r => r !== username)
          }));
        }
      } catch (e) {
        console.error(e);
        addNotification("Failed to accept request", 'info');
      }
    } else {
      // Local
      setProfile(prev => ({
        ...prev,
        friends: [...prev.friends, username],
        incomingRequests: prev.incomingRequests.filter(r => r !== username)
      }));
    }
  };

  const removeFriend = (username: string) => {
    if (userSession) {
      api.deleteFriend(userSession.user.id, username);
    }
    setProfile(prev => ({ ...prev, friends: prev.friends.filter(f => f !== username) }));
  };

  // Boilerplate state updaters...
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const getLevel = () => Math.floor(Math.sqrt(profile.xp / 100)) + 1;
  const getNextLevelXp = () => Math.pow(getLevel(), 2) * 100;
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wordheat_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      setProfile(prev => ({ ...prev, ...parsed }));
      addNotification('Data imported successfully!', 'success');
    } catch (e) {
      addNotification('Invalid file format', 'info');
    }
  };
  const addXp = (amount: number) => setProfile(prev => ({ ...prev, xp: prev.xp + amount }));
  const addCoins = (amount: number) => setProfile(prev => ({ ...prev, coins: prev.coins + amount }));
  const spendCoins = (amount: number) => {
    if (profile.coins >= amount) { setProfile(prev => ({ ...prev, coins: prev.coins - amount })); return true; }
    return false;
  };
  const buyTheme = (id: string) => {
    if (profile.ownedThemes.includes(id)) return true;
    if (spendCoins(THEMES[id].price)) { setProfile(prev => ({ ...prev, ownedThemes: [...prev.ownedThemes, id] })); return true; }
    return false;
  };
  const equipTheme = (id: string) => setProfile(prev => ({ ...prev, activeTheme: id }));
  const buyCategory = (id: string) => {
    if (profile.ownedCategories.includes(id)) return true;
    if (spendCoins(CATEGORIES[id].price)) { setProfile(prev => ({ ...prev, ownedCategories: [...prev.ownedCategories, id] })); return true; }
    return false;
  };
  const buyItem = (id: string) => {
    if (spendCoins(CONSUMABLES[id].price)) {
      setProfile(prev => ({ ...prev, inventory: { ...prev.inventory, [id]: (prev.inventory[id] || 0) + 1 } }));
      return true;
    }
    return false;
  };
  const useItem = (id: string) => {
    if ((profile.inventory[id] || 0) > 0) {
      setProfile(prev => ({ ...prev, inventory: { ...prev.inventory, [id]: prev.inventory[id] - 1 } }));
      return true;
    }
    return false;
  };
  const setLanguage = (lang: Language) => setProfile(prev => ({ ...prev, language: lang }));
  const incrementGamesPlayed = () => setProfile(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
  const incrementWins = () => setProfile(prev => ({ ...prev, wins: prev.wins + 1 }));
  const updateBlitzHighScore = (score: number) => { if (score > profile.blitzHighScore) setProfile(prev => ({ ...prev, blitzHighScore: score })); };
  const registerWin = (word: string, count: number, mode: string, seed?: string) => {
    setProfile(prev => ({
      ...prev,
      solvedWords: [{ word, date: new Date().toISOString(), guessesCount: count, mode, seed }, ...prev.solvedWords],
      wins: prev.wins + 1,
      gamesPlayed: prev.gamesPlayed + 1,
      coins: prev.coins + getWinCoinReward()
    }));
  };
  const updateMissionProgress = (type: MissionType, amount: number) => {
    setProfile(prev => ({
      ...prev,
      dailyMissions: prev.dailyMissions.map(m => m.type === type && !m.isClaimed ? { ...m, progress: Math.min(m.target, m.progress + amount) } : m)
    }));
  };
  const claimMission = (id: string) => {
    setProfile(prev => {
      const m = prev.dailyMissions.find(x => x.id === id);
      if (m && !m.isClaimed && m.progress >= m.target) {
        return {
          ...prev,
          coins: prev.coins + m.reward,
          dailyMissions: prev.dailyMissions.map(dm => dm.id === id ? { ...dm, isClaimed: true } : dm)
        };
      }
      return prev;
    });
  };
  const completeTutorial = () => setProfile(prev => ({ ...prev, tutorialCompleted: true }));
  const getHintCost = (type: string) => type === 'word' ? 30 : 20;
  const getWinCoinReward = () => 10 + (getLevel() >= 4 ? 5 : 0);
  const getBlitzStartDuration = () => getLevel() >= 6 ? 70 : 60;
  const checkAchievements = () => { };
  const markAllRead = () => setProfile(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
  const clearNotifications = () => setProfile(prev => ({ ...prev, notifications: [] }));
  const toggleSound = () => setProfile(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }));
  const toggleHardMode = () => setProfile(prev => ({ ...prev, settings: { ...prev.settings, hardMode: !prev.settings.hardMode } }));
  const toggleHaptics = () => setProfile(prev => ({ ...prev, settings: { ...prev.settings, hapticsEnabled: !prev.settings.hapticsEnabled } }));
  const toggleHighContrast = () => setProfile(prev => ({ ...prev, settings: { ...prev.settings, highContrast: !prev.settings.highContrast } }));
  const toggleReducedMotion = () => setProfile(prev => ({ ...prev, settings: { ...prev.settings, reducedMotion: !prev.settings.reducedMotion } }));
  const triggerHaptic = () => { };
  const t = (key: string) => TRANSLATIONS[profile.language][key] || key;
  const declineFriendRequest = (username: string) => setProfile(prev => ({ ...prev, incomingRequests: prev.incomingRequests.filter(f => f !== username) }));

  const getPublicProfile = async (username: string) => {
    try {
      const data = await api.getPublicProfileByUsername(username);
      if (data) {
        // Map partial data to full profile structure for UI compatibility
        // We use defaultProfile for missing fields since public profile is limited
        return { ...defaultProfile, ...data, isGuest: false };
      }
    } catch (e) {
      console.error("Failed to fetch public profile", e);
    }
    return null;
  };

  const sendMessage = (to: string, text: string) => {
    // Local State Update
    const msg: ChatMessage = { id: Date.now().toString(), from: profile.username, to, text, timestamp: Date.now(), read: true };
    setProfile(prev => ({ ...prev, messages: [...prev.messages, msg] }));

    // Realtime Broadcast via Supabase
    if (userSession) {
      supabase.channel(`chat:${to}`).send({
        type: 'broadcast',
        event: 'message',
        payload: { from: profile.username, text, timestamp: Date.now() }
      });
    }
  };

  // Subscribe to my own chat channel to receive messages
  useEffect(() => {
    if (profile.username && !profile.isGuest) {
      const channel = supabase.channel(`chat:${profile.username}`);
      channel.on('broadcast', { event: 'message' }, (payload) => {
        const msg: ChatMessage = {
          id: Date.now().toString(),
          from: payload.payload.from,
          to: profile.username,
          text: payload.payload.text,
          timestamp: payload.payload.timestamp,
          read: false
        };
        setProfile(prev => ({ ...prev, messages: [...prev.messages, msg] }));

        // Check if message contains a challenge link
        const challengeMatch = msg.text.match(/#\/game\?challenge=([a-zA-Z0-9-]+)/);
        if (challengeMatch) {
          const challengeUrl = challengeMatch[0];
          addNotification(
            `🔥 ${payload.payload.from} challenged you!`,
            'info',
            'Swords',
            { label: 'Play Now', url: challengeUrl }
          );
        } else {
          addNotification(`New message from ${payload.payload.from}`, 'info', 'MessageSquare');
        }
      }).subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [profile.username, profile.isGuest]);

  const markChatRead = (friend: string) => setProfile(prev => ({ ...prev, messages: prev.messages.map(m => (m.from === friend && !m.read) ? { ...m, read: true } : m) }));

  const deleteChatHistory = (friend: string) => {
    setProfile(prev => ({
      ...prev,
      messages: prev.messages.filter(m => !(m.from === friend || m.to === friend))
    }));
    addNotification(`Chat history with ${friend} deleted`, 'info');
  };

  // Challenge Functions
  const createChallenge = async (opponent: string, word: string, seed: string, isSecretWord: boolean = false): Promise<Challenge | null> => {
    if (!userSession) {
      addNotification('You must be logged in to create challenges', 'info');
      return null;
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        challenger: profile.username,
        opponent,
        word,
        seed,
        status: 'pending',
        created_at: Date.now(),
        challenger_status: isSecretWord ? 'finished' : 'waiting',
        challenger_guesses: isSecretWord ? 0 : null, // 0 indicates setter mode
        challenger_finished_at: isSecretWord ? Date.now() : null,
        opponent_status: 'invited'
      })
      .select()
      .single();

    if (error) {
      console.error('Create challenge error:', error);
      addNotification('Failed to create challenge', 'info');
      return null;
    }

    // Send notification with challenge link
    sendMessage(opponent, `🔥 I challenge you! ${window.location.origin}#/game?challenge=${data.id}`);
    addNotification(`Challenge sent to ${opponent}!`, 'success', 'Swords');

    return data as Challenge;
  };

  const acceptChallenge = async (challengeId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'accepted',
        opponent_status: 'playing'
      })
      .eq('id', challengeId);

    if (error) {
      console.error('Accept challenge error:', error);
      addNotification('Failed to accept challenge', 'info');
      return false;
    }

    return true;
  };

  const updateChallengeProgress = async (
    challengeId: string,
    isChallenger: boolean,
    guesses: number,
    finished: boolean
  ): Promise<void> => {
    const updates = isChallenger ? {
      challenger_status: finished ? 'finished' as const : 'playing' as const,
      challenger_guesses: guesses,
      challenger_finished_at: finished ? Date.now() : null
    } : {
      opponent_status: finished ? 'finished' as const : 'playing' as const,
      opponent_guesses: guesses,
      opponent_finished_at: finished ? Date.now() : null
    };

    const { error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', challengeId);

    if (error) {
      console.error('Update challenge progress error:', error);
    }
  };

  const getChallenge = async (challengeId: string): Promise<Challenge | null> => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Get challenge error:', error);
      return null;
    }

    return data as Challenge;
  };

  return (
    <UserContext.Provider value={{
      profile, activeToasts, isAuthModalOpen, openAuthModal, closeAuthModal, updateProfile, logout, deleteAccount,
      exportData, importData, addXp, addCoins, spendCoins, buyTheme, equipTheme, buyCategory, buyItem, useItem,
      setLanguage, incrementGamesPlayed, incrementWins, updateBlitzHighScore, registerWin, updateMissionProgress,
      claimMission, completeTutorial, getLevel, getNextLevelXp, getHintCost, getWinCoinReward, getBlitzStartDuration,
      checkAchievements, showToast: addNotification, removeToast, markAllRead, clearNotifications, toggleSound,
      toggleHardMode, toggleHaptics, toggleHighContrast, toggleReducedMotion, triggerHaptic, t, addFriend, removeFriend,
      acceptFriendRequest, declineFriendRequest, getPublicProfile, sendMessage, markChatRead, deleteChatHistory,
      createChallenge, acceptChallenge, updateChallengeProgress, getChallenge, isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};