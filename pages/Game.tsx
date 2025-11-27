
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Header } from '../components/Header';
import { HeatBar } from '../components/HeatBar';
import { GuessRow } from '../components/GuessRow';
import { TemperatureBackground } from '../components/TemperatureBackground';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { HelpModal } from '../components/HelpModal';
import { ShareModal } from '../components/ShareModal';
import { ChallengeStatusBar } from '../components/ChallengeStatusBar';
import { ChallengeResultModal } from '../components/ChallengeResultModal';
import { Icon } from '../components/Icon';
import {
  generateTargetWord,
  calculateSimilarity,
  generateHint,
  getRelatedWords,
  generateGameRecap,
  generateCompassClue
} from '../services/geminiService';
import { playGuessSound, playWinSound } from '../utils/sound';
import { GameState, Guess, Temperature, Challenge } from '../types';
import { supabase } from '../lib/supabase';
import { CONSUMABLES } from '../utils/consumables';
import { Send, Lightbulb, Flag, RotateCcw, Share2, Home as HomeIcon, AlertTriangle, Loader2, Coins, X, Zap, Backpack } from 'lucide-react';

// Helper to map score to Temperature
const getTemperature = (score: number): Temperature => {
  if (score === 100) return Temperature.SOLVED;
  if (score >= 90) return Temperature.BURNING;
  if (score >= 70) return Temperature.HOT;
  if (score >= 45) return Temperature.WARM;
  if (score >= 20) return Temperature.COLD;
  return Temperature.FREEZING;
};

const getTemperatureEmoji = (temp: Temperature): string => {
  switch (temp) {
    case Temperature.SOLVED: return '🏆';
    case Temperature.BURNING: return '🔥';
    case Temperature.HOT: return '☀️';
    case Temperature.WARM: return '🌤️';
    case Temperature.COLD: return '❄️';
    default: return '🧊';
  }
};

const Game: React.FC = () => {
  const {
    profile,
    addCoins,
    spendCoins,
    registerWin,
    getHintCost,
    getWinCoinReward,
    completeTutorial,
    showToast,
    buyItem,
    useItem,
    t,
    getChallenge,
    acceptChallenge,
    updateChallengeProgress
  } = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const mode = searchParams.get('mode') || 'unlimited';
  const category = searchParams.get('category') || 'common';
  const dateParam = searchParams.get('date'); // For daily/archive
  const topicParam = searchParams.get('topic'); // For custom mode
  const challengeId = searchParams.get('challenge'); // For 1v1 challenges

  const [gameState, setGameState] = useState<GameState>({
    targetWord: '',
    guesses: [],
    status: 'playing',
    loading: true,
    error: null,
    bestScore: 0,
    definition: undefined,
    hints: [], // Array of {text, type}
    wordLengthRevealed: false,
    revealedLetters: 0,
    relatedWords: [],
    recap: undefined,
    imageHint: undefined
  });

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [surrenderConfirm, setSurrenderConfirm] = useState(false);
  const [isHintMenuOpen, setIsHintMenuOpen] = useState(false);
  const [hintMenuTab, setHintMenuTab] = useState<'clues' | 'items'>('clues');
  const [hintLoading, setHintLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Challenge State
  const [challengeData, setChallengeData] = useState<Challenge | null>(null);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [isChallenger, setIsChallenger] = useState(false);

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Blitz Timer
  const [timeLeft, setTimeLeft] = useState(60);
  // Use ReturnType<typeof setInterval> for cross-environment compatibility (Node vs Browser)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);



  const [showPassOverlay, setShowPassOverlay] = useState(false);

  // Party Mode State
  const [partyState, setPartyState] = useState({
    currentPlayer: 1,
    totalPlayers: 2,
    isTeamMode: false,
    isSetterMode: false, // True if Player 1 set a custom word (Setter vs Solver)
    playerNames: ['Player 1', 'Player 2']
  });

  // Initialize Game
  useEffect(() => {
    const initGame = async () => {
      setGameState(prev => ({ ...prev, loading: true }));

      // Parse Party Params
      const playersParam = parseInt(searchParams.get('players') || '2');
      const teamsParam = searchParams.get('teams') === 'true';
      const customWordParam = searchParams.get('word');
      const namesParam = searchParams.get('names');

      let isSetter = false;
      let initialPlayer = 1;
      let names = Array.from({ length: playersParam }, (_, i) => `Player ${i + 1}`);

      if (teamsParam) {
        names = ['Team Red', 'Team Blue'];
      }

      // Override with custom names if present
      if (namesParam) {
        try {
          const decodedNames = decodeURIComponent(namesParam).split(',');
          // Fill up to required length, fallback to defaults if empty strings
          names = names.map((defaultName, i) => decodedNames[i] || defaultName);
        } catch (e) {
          console.error("Failed to parse names", e);
        }
      }

      // Check for custom word (Pass & Play)
      let target = '';
      if (customWordParam) {
        try {
          target = atob(customWordParam).toLowerCase();
          isSetter = true;
          initialPlayer = 2; // Player 2 (Solver) starts
        } catch (e) {
          console.error("Failed to decode custom word", e);
        }
      }

      setPartyState({
        currentPlayer: initialPlayer,
        totalPlayers: playersParam,
        isTeamMode: teamsParam,
        isSetterMode: isSetter,
        playerNames: names
      });

      // Check for Pass & Play mode
      if (mode === 'party') {
        setShowPassOverlay(true);
      }

      let seed = undefined;

      if (target) {
        // Custom word already set
        setGameState(prev => ({
          ...prev,
          targetWord: target,
          loading: false,
          status: 'playing'
        }));
        return;
      }

      if (mode === 'daily') {
        // Use date as seed
        seed = dateParam || new Date().toLocaleDateString('en-CA');

        // Check if already played
        const alreadyPlayed = profile.solvedWords.some(w => w.mode === 'daily' && w.seed === seed);
        if (alreadyPlayed) {
          showToast("You've already completed today's challenge!", 'info');
          navigate('/home');
          return;
        }
      }

      try {
        // If custom topic provided, use it as category prompt
        const effectiveCategory = topicParam ? topicParam : category;

        target = await generateTargetWord(profile.language, seed, effectiveCategory);

        // In tutorial, force specific word for predictability
        if (mode === 'tutorial') {
          target = 'water';
          // Only show overlay if not completed (or if explicitly resetting tutorial)
          if (!profile.tutorialCompleted) {
            setIsTutorialOpen(true);
          }
        }

        setGameState(prev => ({
          ...prev,
          targetWord: target,
          loading: false,
          status: 'playing'
        }));

      } catch (e) {
        setGameState(prev => ({ ...prev, loading: false, error: "Failed to start game" }));
      }
    };

    initGame();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, category, dateParam, topicParam, profile.language]);

  // Load Challenge Data
  useEffect(() => {
    const loadChallenge = async () => {
      if (!challengeId) return;

      const challenge = await getChallenge(challengeId);
      if (!challenge) {
        showToast('Challenge not found', 'info');
        navigate('/home');
        return;
      }

      setChallengeData(challenge);
      setIsChallenger(challenge.challenger === profile.username);

      // Accept challenge if opponent
      if (challenge.opponent === profile.username && challenge.status === 'pending') {
        await acceptChallenge(challengeId);
        showToast('Challenge accepted!', 'success', 'Swords');
      }

      // Set target word from challenge
      setGameState(prev => ({
        ...prev,
        targetWord: challenge.word,
        loading: false
      }));
    };

    loadChallenge();
  }, [challengeId]);

  // Subscribe to Challenge Updates
  useEffect(() => {
    if (!challengeId) return;

    const channel = supabase
      .channel(`challenge:${challengeId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'challenges',
        filter: `id=eq.${challengeId}`
      }, (payload) => {
        const updated = payload.new as Challenge;
        setChallengeData(updated);

        // Show notifications
        if (updated.status === 'accepted' && isChallenger && challengeData?.status !== 'accepted') {
          showToast('🎮 Opponent accepted! Game on!', 'success', 'Swords');
        }

        const isOpponentFinished = isChallenger
          ? updated.opponent_status === 'finished'
          : updated.challenger_status === 'finished';
        const wasOpponentFinished = isChallenger
          ? challengeData?.opponent_status === 'finished'
          : challengeData?.challenger_status === 'finished';
        const opponentGuesses = isChallenger
          ? updated.opponent_guesses
          : updated.challenger_guesses;
        const myGuesses = isChallenger
          ? updated.challenger_guesses
          : updated.opponent_guesses;

        if (isOpponentFinished && !wasOpponentFinished) {
          if (opponentGuesses === 999) {
            showToast('🏳️ Opponent gave up! You win!', 'success', 'Trophy');
          } else {
            showToast('⚡ Opponent finished!', 'info', 'Zap');
          }
        }

        // Determine winner when one player finishes (win or surrender)
        const shouldDetermineWinner = (
          (updated.challenger_status === 'finished' || updated.opponent_status === 'finished')
          && !updated.winner
        );

        if (shouldDetermineWinner) {
          let winner: string;
          const challengerGuesses = updated.challenger_guesses || 999;
          const opponentGuesses = updated.opponent_guesses || 999;
          const challengerFinished = updated.challenger_status === 'finished';
          const opponentFinished = updated.opponent_status === 'finished';

          // Scenario 1: Challenger finished first
          if (challengerFinished) {
            // If challenger surrendered (999), opponent wins
            // Otherwise challenger wins
            winner = challengerGuesses === 999 ? updated.opponent : updated.challenger;
          }
          // Scenario 2: Opponent finished first
          else if (opponentFinished) {
            // If opponent surrendered (999), challenger wins
            // Otherwise opponent wins
            winner = opponentGuesses === 999 ? updated.challenger : updated.opponent;
          } else {
            // This shouldn't happen, but default to challenger
            winner = updated.challenger;
          }

          // Update local state with winner
          const updatedWithWinner = { ...updated, winner, status: 'completed' as const };
          setChallengeData(updatedWithWinner);

          // Show modal immediately
          setShowChallengeResult(true);

          // Update DB in background
          determineWinner(updated);
        }

        // Show result modal when winner is declared
        if (updated.winner && !challengeData?.winner) {
          setShowChallengeResult(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [challengeId, isChallenger, challengeData]);

  // Update challenge progress on each guess
  useEffect(() => {
    if (!challengeId || !challengeData || gameState.guesses.length === 0) return;

    updateChallengeProgress(
      challengeId,
      isChallenger,
      gameState.guesses.length,
      gameState.status === 'won'
    );
  }, [gameState.guesses.length, gameState.status]);

  const determineWinner = async (challenge: Challenge) => {
    let winner: string;

    const challengerGuesses = challenge.challenger_guesses || 999;
    const opponentGuesses = challenge.opponent_guesses || 999;

    if (challengerGuesses < opponentGuesses) {
      winner = challenge.challenger;
    } else if (opponentGuesses < challengerGuesses) {
      winner = challenge.opponent;
    } else {
      // Tie on guesses - who finished first?
      winner = (challenge.challenger_finished_at || 0) < (challenge.opponent_finished_at || 0)
        ? challenge.challenger
        : challenge.opponent;
    }

    try {
      // Update winner in database
      const { error } = await supabase
        .from('challenges')
        .update({ winner, status: 'completed' })
        .eq('id', challenge.id)
        .select();

      if (error) {
        console.error('❌ Error updating winner in database:', error);
      }
    } catch (err) {
      console.error('Exception updating winner:', err);
    }
  };

  // Independent Blitz Timer Effect
  useEffect(() => {
    if (mode === 'blitz' && gameState.status === 'playing' && !gameState.loading) {
      setTimeLeft(60); // Reset time when game actually starts

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleLoss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, gameState.status, gameState.loading]);

  const handleLoss = () => {
    setGameState(prev => ({ ...prev, status: 'lost' }));
  };

  const handleGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || submitting || gameState.status !== 'playing') return;

    const guessWord = input.trim().toLowerCase();
    // Check duplicates
    if (gameState.guesses.some(g => g.word.toLowerCase() === guessWord)) {
      setInput('');
      return;
    }

    setSubmitting(true);

    try {
      const result = await calculateSimilarity(gameState.targetWord, guessWord, profile.language);
      const temperature = getTemperature(result.score);

      playGuessSound(temperature);

      const newGuess: Guess = {
        word: guessWord,
        score: result.score,
        rank: result.estimatedRank,
        temperature,
        timestamp: Date.now()
      };

      setGameState(prev => {
        const newGuesses = [...prev.guesses, newGuess];
        const bestScore = Math.max(prev.bestScore, result.score);
        const isWin = result.score === 100;

        return {
          ...prev,
          guesses: newGuesses,
          bestScore,
          status: isWin ? 'won' : prev.status
        };
      });

      setInput('');
      setSubmitting(false);

      if (result.score === 100) {
        handleWin(newGuess);
      } else {
        // Handle Turn Switching for Party Mode (Random Word)
        if (mode === 'party' && !partyState.isSetterMode) {
          setPartyState(prev => {
            const nextPlayer = prev.currentPlayer >= prev.totalPlayers ? 1 : prev.currentPlayer + 1;
            return { ...prev, currentPlayer: nextPlayer };
          });
          setShowPassOverlay(true);
        }
      }

    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const handleWin = async (winningGuess: Guess) => {
    playWinSound();
    if (timerRef.current) clearInterval(timerRef.current);

    // Register win in profile
    registerWin(
      gameState.targetWord,
      gameState.guesses.length + 1,
      mode,
      mode === 'daily' ? (dateParam || new Date().toLocaleDateString('en-CA')) : undefined
    );

    // Handle Tutorial Completion
    if (mode === 'tutorial') {
      completeTutorial();
      showToast('Tutorial Completed!', 'success', 'GraduationCap');
    }

    // Add coins
    const reward = getWinCoinReward();
    addCoins(reward);

    // Generate recap
    const recap = await generateGameRecap(gameState.targetWord, [...gameState.guesses, winningGuess], profile.language);
    setGameState(prev => ({ ...prev, recap, status: 'won' }));

    // Fetch related words for post-game analysis
    const related = await getRelatedWords(gameState.targetWord, profile.language);
    setGameState(prev => ({ ...prev, relatedWords: related }));
    // Auto-open share modal after delay
    setTimeout(() => setShowShareModal(true), 2000);
  };

  const handleSurrender = async () => {
    if (!surrenderConfirm) {
      // First click: ask for confirmation
      setSurrenderConfirm(true);
      setTimeout(() => setSurrenderConfirm(false), 3000);
      return;
    }

    // Second click: confirmed surrender
    if (mode === 'tutorial') {
      completeTutorial();
      navigate('/home');
      return;
    }

    // Handle challenge mode surrender
    if (challengeId && challengeData) {
      // Update challenge with surrender (999 guesses indicates surrender)
      await updateChallengeProgress(challengeId, isChallenger, 999, true);

      // Don't show modal here - let the realtime subscription show it when winner is determined
      // This ensures the modal has proper winner data to display
      return;
    }

    // Regular surrender for non-challenge modes
    setGameState(prev => ({ ...prev, status: 'lost' }));
    setSurrenderConfirm(false);
    // Fetch related words to show what they missed
    getRelatedWords(gameState.targetWord, profile.language).then(related => {
      setGameState(prev => ({ ...prev, relatedWords: related }));
    });
  };

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const buyHint = async (type: 'word' | 'sentence') => {
    const cost = getHintCost(type);

    if (spendCoins(cost)) {
      setHintLoading(true);

      // Collect previous hint texts to avoid duplication
      const previousHintTexts = gameState.hints.map(h => h.text);

      const hintText = await generateHint(
        gameState.targetWord,
        profile.language,
        type,
        previousHintTexts
      );

      setGameState(prev => ({
        ...prev,
        hints: [...prev.hints, { text: hintText, type }]
      }));

      setHintLoading(false);
      showToast(`Unlocked ${type} hint!`, 'success', 'Lightbulb');
    } else {
      showToast("Not enough coins!", 'info', 'Coins');
    }
  };

  const handleUsePowerup = async (itemId: string) => {
    const count = profile.inventory[itemId] || 0;
    if (count <= 0) {
      // Auto-buy attempts
      const item = CONSUMABLES[itemId];
      if (item && buyItem(itemId)) {
        showToast(`Bought ${item.name}`, 'success', 'Coins');
      } else {
        showToast("Not enough coins to buy!", 'info', 'Coins');
        return;
      }
    }

    // Now consume
    if (useItem(itemId)) {
      // Apply Effect
      if (itemId === 'letter_spy') {
        const nextIndex = gameState.revealedLetters || 0;
        if (nextIndex >= gameState.targetWord.length) {
          showToast("All letters already revealed!", 'info');
          return;
        }
        setGameState(prev => ({
          ...prev,
          revealedLetters: (prev.revealedLetters || 0) + 1
        }));
        showToast("Letter Revealed!", 'success', 'Eye');
      }
      else if (itemId === 'compass') {
        setHintLoading(true);
        const clue = await generateCompassClue(gameState.targetWord, profile.language);
        setGameState(prev => ({
          ...prev,
          hints: [...prev.hints, { text: `Compass points to: "${clue}"`, type: 'word' }]
        }));
        setHintLoading(false);
        showToast("Compass Activated!", 'success', 'Compass');
      }
      else if (itemId === 'time_freeze') {
        if (mode === 'blitz') {
          setTimeLeft(prev => prev + 20);
          showToast("+20 Seconds!", 'success', 'Clock');
        } else {
          showToast("Only usable in Blitz mode", 'info');
          // Refund handled loosely here, ideally we check mode before consume
        }
      }
    }
  };

  // Sorted guesses for UI: Best scores first (Winner #1)
  const sortedGuesses = [...gameState.guesses].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.timestamp - a.timestamp;
  });

  const getMaskedWord = () => {
    if (!gameState.targetWord || (!gameState.revealedLetters && !gameState.wordLengthRevealed)) return null;
    const word = gameState.targetWord.toUpperCase();
    const revealed = gameState.revealedLetters || 0;

    // If we haven't revealed anything yet but maybe have length (future feature), show underscores
    if (revealed === 0) return null;

    return word.split('').map((char, index) => {
      if (index < revealed) return char;
      return '_';
    }).join(' ');
  };

  const maskedWord = getMaskedWord();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white relative overflow-hidden">
      {/* Dynamic Background based on best score */}
      <TemperatureBackground temperature={getTemperature(gameState.bestScore)} />

      <Header onHelpClick={() => setShowHelp(true)} />

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col relative z-10">

        {/* Spectator Mode for Setter */}
        {challengeData && isChallenger && challengeData.challenger_status === 'finished' && challengeData.challenger_guesses === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-pop">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 mb-6">
              <Icon name="Swords" size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Challenge Sent!</h2>
            <p className="text-slate-400 mb-8 max-w-xs">
              You set the secret word <span className="text-white font-bold">"{gameState.targetWord}"</span>.
              <br />Waiting for <span className="text-blue-400 font-bold">{challengeData.opponent}</span> to solve it...
            </p>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-slate-500">Opponent Status</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${challengeData.opponent_status === 'playing' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  {challengeData.opponent_status === 'playing' ? 'Playing Now' : 'Invited'}
                </span>
              </div>

              {challengeData.opponent_status === 'playing' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Guesses made:</span>
                    <span className="text-white font-bold">{challengeData.opponent_guesses || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-full origin-left scale-x-50"></div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/home')}
              className="mt-8 text-slate-500 hover:text-white font-bold text-sm transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Normal Game View */}
        {!(challengeData && isChallenger && challengeData.challenger_status === 'finished' && challengeData.challenger_guesses === 0) && (
          <>
            {/* Top Bar: Mode & Timer/Score */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/home')} className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors">
                  <HomeIcon size={16} />
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                  {mode === 'unlimited' ? (category === 'common' ? 'Quick Play' : category) : mode}
                </span>
                {mode === 'party' && (
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border border-slate-800 ${partyState.isTeamMode ? (partyState.currentPlayer === 1 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400') : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {partyState.playerNames[partyState.currentPlayer - 1]}'s Turn
                  </span>
                )}
              </div>
              {mode === 'blitz' && (
                <div className={`text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              )}
            </div>

            {/* Progress / Heat Bar */}
            {/* Challenge Status Bar */}
            {challengeData && (
              <div className="mb-4">
                <ChallengeStatusBar challenge={challengeData} isChallenger={isChallenger} />
              </div>
            )}

            <HeatBar score={gameState.bestScore} temperature={getTemperature(gameState.bestScore)} />

            {/* Game Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide mb-4 min-h-[200px] pb-20">

              {/* Loading State */}
              {gameState.loading && (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <p className="text-slate-400 text-sm animate-pulse">Generating semantic field...</p>
                </div>
              )}

              {/* Hints Display Stack */}
              {gameState.hints.length > 0 && (
                <div className="mb-4 space-y-2">
                  {gameState.hints.map((h, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex gap-3 items-start animate-pop">
                      <Lightbulb size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase text-yellow-600/80 block mb-0.5">
                          {h.type === 'word' ? 'Word Hint' : 'Sentence Hint'}
                        </span>
                        <div className="text-sm text-yellow-100 italic">"{h.text}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Win/Loss State */}
              {gameState.status !== 'playing' && (
                <div className="mb-6 p-6 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl text-center animate-pop shadow-2xl">
                  <h2 className="text-3xl font-black mb-2">
                    {gameState.status === 'won' ? 'VICTORY!' : 'GAME OVER'}
                  </h2>
                  <div className="text-sm text-slate-400 mb-4">The secret word was:</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 uppercase tracking-widest">
                    {gameState.targetWord}
                  </div>

                  {gameState.status === 'won' && gameState.recap && (
                    <div className="text-sm text-slate-300 italic mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      "{gameState.recap}"
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={18} /> Play Again
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-600"
                    >
                      <Share2 size={18} /> Share
                    </button>
                  </div>

                  {/* Related Words */}
                  {gameState.relatedWords && gameState.relatedWords.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <div className="text-xs font-bold uppercase text-slate-500 mb-3">Similar Words</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {gameState.relatedWords.map(w => (
                          <span key={w} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-300 border border-slate-800">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guess History */}
              <div className="space-y-3">
                {sortedGuesses.map((guess, idx) => (
                  <GuessRow
                    key={guess.timestamp}
                    guess={guess}
                    isBest={guess.score === gameState.bestScore && guess.score > 0}
                    listIndex={idx + 1}
                  />
                ))}

              </div>
            </div>

            {/* Input Area - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
              <div className="max-w-2xl mx-auto">

                {/* Masked Word (From Letter Spy) */}
                {maskedWord && gameState.status === 'playing' && (
                  <div className="text-center mb-3 animate-pop">
                    <span className="inline-block px-4 py-1.5 bg-slate-900 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono text-lg font-bold tracking-[0.3em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      {maskedWord}
                    </span>
                  </div>
                )}

                {gameState.status === 'playing' ? (
                  <form onSubmit={handleGuess} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('game.input.placeholder')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                        autoFocus
                        disabled={submitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!input.trim() || submitting}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl px-5 flex items-center justify-center transition-all shadow-lg shadow-blue-600/20"
                    >
                      {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </form>
                ) : null}

                {/* Action Bar */}
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => setIsHintMenuOpen(true)}
                    disabled={gameState.status !== 'playing'}
                    className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 disabled:opacity-50 transition-colors"
                  >
                    <div className="p-1.5 bg-yellow-500/10 rounded-lg"><Lightbulb size={14} /></div>
                    <span>Get Hint</span>
                  </button>

                  {/* Surrender Button */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleSurrender}
                      disabled={gameState.status !== 'playing'}
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${surrenderConfirm ? 'text-red-500 hover:text-red-400 animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {surrenderConfirm ? (
                        <>
                          <AlertTriangle size={12} /> Confirm
                        </>
                      ) : (
                        <>
                          <Flag size={12} /> {mode === 'tutorial' ? 'Skip' : t('game.giveup')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Selection Modal */}
            {isHintMenuOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={() => setIsHintMenuOpen(false)}>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                  {/* Modal Header */}
                  <div className="p-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400">
                        <Lightbulb size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-white">Need a Clue?</h3>
                    </div>
                    <button onClick={() => setIsHintMenuOpen(false)} className="text-slate-500 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="p-2 bg-slate-950/50">
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setHintMenuTab('clues')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hintMenuTab === 'clues' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Hints
                      </button>
                      <button
                        onClick={() => setHintMenuTab('items')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hintMenuTab === 'items' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Power-ups
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto">
                    {hintLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 size={32} className="text-yellow-500 animate-spin mb-2" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        {hintMenuTab === 'clues' && (
                          <div className="space-y-3">
                            <button
                              onClick={() => buyHint('word')}
                              disabled={profile.coins < getHintCost('word')}
                              className="w-full p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between group transition-all"
                            >
                              <div className="text-left">
                                <div className="font-bold text-white text-sm">Word Hint</div>
                                <div className="text-xs text-slate-500">Single related word</div>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 group-hover:border-yellow-500/50 transition-colors">
                                <span className={`text-sm font-bold ${profile.coins < getHintCost('word') ? 'text-red-400' : 'text-yellow-400'}`}>{getHintCost('word')}</span>
                                <Coins size={12} className="text-yellow-500" fill="#facc15" />
                              </div>
                            </button>

                            <button
                              onClick={() => buyHint('sentence')}
                              disabled={profile.coins < getHintCost('sentence')}
                              className="w-full p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between group transition-all"
                            >
                              <div className="text-left">
                                <div className="font-bold text-white text-sm">Sentence Hint</div>
                                <div className="text-xs text-slate-500">Riddle-style description</div>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 group-hover:border-yellow-500/50 transition-colors">
                                <span className={`text-sm font-bold ${profile.coins < getHintCost('sentence') ? 'text-red-400' : 'text-yellow-400'}`}>{getHintCost('sentence')}</span>
                                <Coins size={12} className="text-yellow-500" fill="#facc15" />
                              </div>
                            </button>
                          </div>
                        )}

                        {hintMenuTab === 'items' && (
                          <div className="space-y-3">
                            {['letter_spy', 'compass', 'time_freeze'].map(itemId => {
                              const item = CONSUMABLES[itemId];
                              const count = profile.inventory[itemId] || 0;
                              const disabled = mode !== 'blitz' && itemId === 'time_freeze';

                              return (
                                <div
                                  key={itemId}
                                  className={`p-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center gap-3 transition-all ${disabled ? 'opacity-50 grayscale' : 'hover:border-slate-600'}`}
                                >
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                                    <Icon name={item.icon} size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                      <span className={`text-[10px] font-bold px-1.5 rounded ${count > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-500'}`}>x{count}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.description}</p>
                                  </div>
                                  <button
                                    onClick={() => handleUsePowerup(itemId)}
                                    disabled={disabled}
                                    className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${disabled
                                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                      : count > 0
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                                      }`}
                                  >
                                    {disabled ? 'N/A' : count > 0 ? 'Use' : (
                                      <div className="flex items-center gap-1">
                                        <span>Buy</span>
                                        <span className="text-yellow-400">{item.price}</span>
                                      </div>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {hintMenuTab === 'items' && (
                    <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
                      <button onClick={() => navigate('/home')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 font-bold">
                        <Backpack size={12} /> Go to Full Shop
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pass & Play Overlay */}
            {showPassOverlay && (
              <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-500/20 mb-8 animate-bounce-slow">
                  <Icon name="Smartphone" size={48} strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-black text-white mb-4">Pass the Device!</h2>

                <p className="text-slate-400 text-lg mb-12 max-w-xs leading-relaxed">
                  Pass to <span className={`text-white font-bold ${partyState.isTeamMode ? (partyState.currentPlayer === 1 ? 'text-red-400' : 'text-blue-400') : ''}`}>
                    {partyState.playerNames[partyState.currentPlayer - 1]}
                  </span>
                  <br /><br />
                  <span className="text-sm text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    {partyState.isSetterMode ? "Don't peek at the secret word! 🙈" : "Your turn to guess! 🎲"}
                  </span>
                </p>

                <button
                  onClick={() => setShowPassOverlay(false)}
                  className="w-full max-w-xs py-4 bg-white text-slate-900 font-black text-lg rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center justify-center gap-2"
                >
                  I'm Ready <Icon name="ArrowRight" size={20} />
                </button>
              </div>
            )}

            {/* Tutorial Overlay */}
            {isTutorialOpen && (
              <TutorialOverlay onClose={() => setIsTutorialOpen(false)} />
            )}

            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} mode={mode} />
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              gameState={gameState}
              mode={mode}
              username={profile.username || 'Player'}
            />

            {/* Challenge Result Modal */}
            {challengeData && (
              <ChallengeResultModal
                isOpen={showChallengeResult}
                challenge={challengeData}
                isChallenger={isChallenger}
                onClose={() => {
                  setShowChallengeResult(false);
                  navigate('/home');
                }}
              />
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default Game;
