
export enum Language {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  ARABIC = 'Arabic'
}

export enum Temperature {
  FREEZING = 'Freezing', // 0-20
  COLD = 'Cold',         // 20-45
  WARM = 'Warm',         // 45-70
  HOT = 'Hot',           // 70-90
  BURNING = 'Burning',   // 90-99
  SOLVED = 'Solved'      // 100
}

export interface Guess {
  word: string;
  score: number; // 0 to 100 similarity
  rank?: number; // Estimated rank (e.g., 1 is best)
  temperature: Temperature;
  timestamp: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface HintItem {
  text: string;
  type: 'word' | 'sentence';
}

export interface GameState {
  targetWord: string;
  guesses: Guess[];
  status: GameStatus; // Replaces isWon for more states
  loading: boolean;
  error: string | null;
  bestScore: number;
  definition?: string;
  hints: HintItem[]; // Changed from single string to array of items
  wordLengthRevealed?: boolean;
  revealedLetters?: number; // Number of letters revealed
  relatedWords?: string[];
  recap?: string; // AI generated commentary on the game
  imageHint?: string;
}

export interface Theme {
  id: string;
  name: string;
  price: number;
  description: string;
  bgHome: string;
  heatColors: string[];
  accentColor: string;
}

export interface WordCategory {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  bgHome?: string;
}

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  type: 'hint' | 'reveal' | 'time';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition?: (profile: UserProfile, gameState?: GameState) => boolean;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  hardMode: boolean; // Hides numeric scores
  hapticsEnabled: boolean; // Vibration feedback
  highContrast: boolean; // Better visibility colors
  reducedMotion: boolean; // Disable confetti/animations
}

export interface SolvedWord {
  word: string;
  date: string; // ISO string of when it was solved
  guessesCount: number;
  mode: string;
  seed?: string; // The specific puzzle ID/Date (e.g. 2023-10-25)
}

export type MissionType = 'WIN_GAME' | 'PLAY_BLITZ' | 'GET_BURNING';

export interface DailyMission {
  id: string;
  type: MissionType;
  description: string;
  target: number;
  progress: number;
  reward: number;
  isClaimed: boolean;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'achievement' | 'levelup';
  icon?: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Challenge {
  id: string;
  challenger: string;
  opponent: string;
  word: string;
  seed: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  created_at: number;

  challenger_score?: number;
  challenger_guesses?: number;
  challenger_finished_at?: number;
  challenger_status: 'waiting' | 'playing' | 'finished';

  opponent_score?: number;
  opponent_guesses?: number;
  opponent_finished_at?: number;
  opponent_status: 'invited' | 'playing' | 'finished';

  winner?: string;
}

export interface UserProfile {
  username: string;
  email?: string; // Added for account management
  avatar: string;
  isGuest: boolean;
  xp: number;
  coins: number;
  streak: number;
  lastPlayedDate: string | null;
  ownedThemes: string[];
  activeTheme: string;
  ownedCategories: string[];
  inventory: Record<string, number>; // Item ID -> Count
  language: Language;
  gamesPlayed: number;
  wins: number;
  blitzHighScore: number;
  solvedWords: SolvedWord[];
  dailyMissions: DailyMission[];
  unlockedAchievements: string[];
  notifications: AppNotification[];
  settings: UserSettings;
  friends: string[]; // List of usernames
  incomingRequests: string[]; // List of usernames asking to be friends
  messages: ChatMessage[]; // Chat history
  tutorialCompleted?: boolean; // New flag
}

export interface HintResponse {
  hint: string;
}

export interface SemanticResponse {
  score: number;
  isMatch: boolean;
  estimatedRank: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'achievement' | 'levelup';
  icon?: string;
}
