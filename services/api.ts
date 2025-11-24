import { supabase } from '../lib/supabase';
import { UserProfile, Language } from '../types';

// Explicit column list to avoid "PGRST204: Could not find column in schema cache" errors
// Removed 'email' as it does not exist in the profiles table (it lives in auth.users)
const PROFILE_COLUMNS = `
  id, username, avatar, xp, coins, streak, last_played_date, 
  games_played, wins, blitz_high_score, owned_themes, active_theme, 
  owned_categories, inventory, solved_words, daily_missions, 
  unlocked_achievements, settings
`;

export const api = {
  // --- Auth Wrappers ---
  
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return true;
  },

  async register(email: string, password: string, username: string, avatar: string) {
    // 1. Sign up auth user
    // We do NOT insert the profile here manually anymore to avoid conflicts with triggers
    // or race conditions. We let ensureProfileExists handle it upon first login.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar
        },
        emailRedirectTo: window.location.origin 
      }
    });

    if (authError) throw authError;
    return authData;
  },

  // --- Data Access ---

  async ensureProfileExists(userId: string, desiredUsername: string, avatar: string) {
    // 1. Try to get existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return this.mapDatabaseToProfile(data);
    }

    // 2. If missing, we need to insert.
    // We handle potential username conflicts by trying with random suffixes.
    const baseUsername = desiredUsername || 'Player';
    let usernameToTry = baseUsername;
    let attempts = 0;
    
    while (attempts < 5) {
        const newProfile = { 
            id: userId, 
            username: usernameToTry, 
            avatar: avatar || 'User',
            xp: 0,
            coins: 50,
            streak: 0,
            games_played: 0,
            wins: 0,
            owned_themes: ['default'],
            active_theme: 'default',
            owned_categories: ['common']
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select(PROFILE_COLUMNS)
          .single();
        
        if (!insertError && inserted) {
            return this.mapDatabaseToProfile(inserted);
        }

        // Check if error is Unique Violation (code 23505)
        if (insertError && (insertError.code === '23505' || insertError.message.includes('unique'))) {
            // Username taken, try appending random number
            const suffix = Math.floor(Math.random() * 9999);
            usernameToTry = `${baseUsername}#${suffix}`;
            attempts++;
        } else {
            // Genuine error (or profile created by trigger in meantime)
            // Double check if it exists now
            const { data: retry } = await supabase
              .from('profiles')
              .select(PROFILE_COLUMNS)
              .eq('id', userId)
              .single();
              
            if (retry) return this.mapDatabaseToProfile(retry);
            
            console.error("Failed to create profile:", insertError);
            throw insertError || new Error("Failed to create profile");
        }
    }
    
    throw new Error("Could not generate a unique username. Please try again.");
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return this.mapDatabaseToProfile(data);
  },

  async getPublicProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar, xp, games_played, wins, streak')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    // Map camelCase to snake_case for DB
    const dbUpdates = {
      username: updates.username,
      avatar: updates.avatar,
      xp: updates.xp,
      coins: updates.coins,
      streak: updates.streak,
      last_played_date: updates.lastPlayedDate,
      games_played: updates.gamesPlayed,
      wins: updates.wins,
      blitz_high_score: updates.blitzHighScore,
      owned_themes: updates.ownedThemes,
      active_theme: updates.activeTheme,
      owned_categories: updates.ownedCategories,
      inventory: updates.inventory,
      solved_words: updates.solvedWords,
      daily_missions: updates.dailyMissions,
      unlocked_achievements: updates.unlockedAchievements,
      settings: updates.settings,
      // language: updates.language, // Commented out to prevent schema errors
      updated_at: new Date().toISOString(),
    };

    // Remove undefined keys
    Object.keys(dbUpdates).forEach(key => (dbUpdates as any)[key] === undefined && delete (dbUpdates as any)[key]);

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;
    return this.mapDatabaseToProfile(data);
  },

  // --- Friends System ---

  async sendFriendRequest(userId: string, targetUsername: string) {
    // 1. Get Target ID
    const { data: target, error: targetError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', targetUsername)
      .single();
    
    if (targetError || !target) throw new Error("User not found");
    if (target.id === userId) throw new Error("Cannot friend yourself");

    // 2. Check existence
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${userId},receiver_id.eq.${target.id}),and(requester_id.eq.${target.id},receiver_id.eq.${userId})`)
      .single();
    
    if (existing) throw new Error("Request already pending or accepted");

    // 3. Insert
    const { error } = await supabase
      .from('friendships')
      .insert([{ requester_id: userId, receiver_id: target.id }]);

    if (error) throw error;
    return true;
  },

  async getFriends(userId: string) {
    // Get all friendships where user is sender OR receiver
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id, 
        status,
        requester_id,
        receiver_id,
        requester:profiles!requester_id(username),
        receiver:profiles!receiver_id(username)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;
    return data; 
  },
  
  async acceptFriendRequest(requestId: string) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (error) throw error;
  },

  async deleteFriend(userId: string, friendUsername: string) {
     // Find the friend ID first
     const { data: friend } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', friendUsername)
        .single();
     
     if (!friend) return;

     const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${userId},receiver_id.eq.${friend.id}),and(requester_id.eq.${friend.id},receiver_id.eq.${userId})`);
     
     if (error) throw error;
  },

  // --- Helper ---
  mapDatabaseToProfile(dbUser: any): UserProfile {
    return {
      username: dbUser.username || 'User',
      // Email is not in profiles table, handled by auth context
      email: undefined, 
      avatar: dbUser.avatar || 'User',
      isGuest: false,
      xp: dbUser.xp || 0,
      coins: dbUser.coins !== undefined ? dbUser.coins : 50,
      streak: dbUser.streak || 0,
      lastPlayedDate: dbUser.last_played_date,
      gamesPlayed: dbUser.games_played || 0,
      wins: dbUser.wins || 0,
      blitzHighScore: dbUser.blitz_high_score || 0,
      ownedThemes: dbUser.owned_themes || ['default'],
      activeTheme: dbUser.active_theme || 'default',
      ownedCategories: dbUser.owned_categories || ['common'],
      inventory: dbUser.inventory || {},
      solvedWords: dbUser.solved_words || [],
      dailyMissions: dbUser.daily_missions || [],
      unlockedAchievements: dbUser.unlocked_achievements || [],
      notifications: [], 
      friends: [], 
      incomingRequests: [], 
      messages: [], 
      settings: dbUser.settings || {
        soundEnabled: true,
        hardMode: false,
        hapticsEnabled: true,
        highContrast: false,
        reducedMotion: false
      },
      tutorialCompleted: true, 
      language: dbUser.language || Language.ENGLISH
    };
  }
};