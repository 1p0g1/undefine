import React, { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Confetti from './components/Confetti'
import Leaderboard from './components/Leaderboard'
import { getApiUrl } from './config.js';
import { useLocalGameState } from './hooks/useLocalGameState';
import { HINT_INDICES } from '@undefine/shared-types';
import type { 
  GuessResult,
  GameState as ImportedGameState,
  WordData,
  ClueType,
  GuessHistory,
  Message,
  HintIndex,
  AppGameState,
  WordClues,
  GameSession,
  LeaderboardEntry,
  FormState
} from '@undefine/shared-types';
import DefineBoxes from './components/DefineBoxes';
import HintContent from './components/HintContent.js';
import GameSummary from './components/GameSummary.js';
import { ToastProvider, useToast } from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner.js';
import ErrorMessage from './components/ErrorMessage';
import Timer from './components/Timer.js';
import GameOverModal from './components/GameOverModal.js';
import GameLoader from './components/GameLoader.js';
import Settings from './components/Settings.js';
import Header from './components/Header';
import { formatTime } from './utils/time.js';
import { mapWordDataToWordClues } from './utils/validation.js';
import { useGameSession } from './hooks/useGameSession';
import { useGameApi } from './services/gameApi';
import { SettingsModal } from './components/SettingsModal';
import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useWordData } from './hooks/useWordData';
import { useGameGuess } from './hooks/useGameGuess';
import { GameHeader } from './components/GameHeader';
import { GameFooter } from './components/GameFooter';
import { GuessInput } from './components/GuessInput';
import { GameMessages } from './components/GameMessages';

// Define local GameState interface
interface GameState extends ImportedGameState {
  gameId: string;
  word: string;
  correctWord: string;
  fuzzyMatchPositions: number[];
  hasWon: boolean;
  showConfetti: boolean;
  showLeaderboard: boolean;
  message: Message | null;
  guessHistory: Array<{
    guess: string;
    timestamp: number;
    result: GuessResult;
  }>;
  remainingGuesses: number;
  guesses: string[];
}

// Add TypeScript declarations for our window extensions
declare global {
  interface Window {
    API_BASE_URL?: string;
    getApiUrl?: (path: string) => string;
    buildApiUrl?: (endpoint: string) => string;
    testApiConnection?: () => Promise<void>;
  }
}

interface GuessResponse {
  isCorrect: boolean;
  correctWord: string;
  guessedWord: string;
  isFuzzy: boolean;
  fuzzyPositions?: number[];
  leaderboardRank?: number;
}

// Define the hint types that correspond to DEFINE
type HintType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

// Update the Hint interface to track revealed hints
interface Hint {
  D: boolean;  // Definition (always revealed)
  E: boolean;  // Etymology
  F: boolean;  // First letter
  I: boolean;  // In a sentence
  N: boolean;  // Number of letters
  E2: boolean; // Equivalents (synonyms)
}

interface AppState {
  wordData: WordData | null;
  gameId: string;
  guess: string;
  message: Message | null;
  isCorrect: boolean;
  isGameOver: boolean;
  timer: number;
  loading: boolean;
  error: string;
  revealedHints: HintIndex[];
  guessCount: number;
  showConfetti: boolean;
  showLeaderboard: boolean;
  fuzzyCount: number;
  leaderboardRank: number | null;
  guessHistory: GuessHistory[];
  remainingGuesses: number;
  guessResults: ('correct' | 'incorrect' | null)[];
  fuzzyMatchPositions: number[];
  correctWord: string;
  inputRef: React.RefObject<HTMLInputElement>;
}

const MAX_GUESSES = 6;

const normalize = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
};

function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [gameState, setGameState] = useState<GameState>({
    gameId: '',
    word: '',
    correctWord: '',
    guessCount: 0,
    isGameOver: false,
    isCorrect: false,
    remainingGuesses: 6,
    loading: true,
    wordData: null,
    revealedHints: [],
    hasWon: false,
    showConfetti: false,
    showLeaderboard: false,
    message: null,
    guessHistory: [],
    guessResults: [],
    timer: 0,
    fuzzyMatchPositions: [],
    guesses: [],
    hintLevel: 0
  });
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<Message | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<HintIndex[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [fuzzyCount, setFuzzyCount] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);

  // ✅ useRef hooks
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Custom hooks
  const { state: localGameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const { session } = useGameSession();
  const { state: gameStateHook } = useGameState();
  const { entries: leaderboardEntries, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard();
  const { wordData: wordDataFromHook, loading: wordDataLoading, error: wordDataError } = useWordData(gameState.gameId);
  const { submitGuess, isSubmitting, error: guessError } = useGameGuess();

  // Add state for modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);

  // ✅ All helper functions
  const initializeGame = async () => {
    console.log('Initializing game session...');
    setGameState(prev => ({ ...prev, loading: true, isGameOver: false }));
    setError('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(getApiUrl('/api/word'), {
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load game' }));
        throw new Error(errorData.error || 'Failed to load game');
      }

      const data = await response.json();

      console.log('Game session response:', {
        hasGameId: !!data.gameId,
        hasWord: !!data.word,
        wordId: data.word?.id
      });

      if (data && data.gameId && data.word) {
        const wordData: WordData = {
          id: data.word.id,
          word: data.word.word,
          definition: data.word.definition,
          etymology: data.word.etymology,
          first_letter: data.word.first_letter,
          in_a_sentence: data.word.in_a_sentence,
          number_of_letters: data.word.number_of_letters,
          equivalents: data.word.equivalents,
          difficulty: data.word.difficulty,
          created_at: data.word.created_at,
          updated_at: data.word.updated_at,
          clues: {
            D: data.word.definition,
            E: data.word.etymology,
            F: data.word.first_letter,
            I: data.word.in_a_sentence,
            N: data.word.number_of_letters,
            E2: data.word.equivalents
          }
        };

        setGameState({
          gameId: data.gameId,
          word: data.word.word,
          correctWord: data.word.word,
          guessCount: 0,
          isGameOver: false,
          isCorrect: false,
          remainingGuesses: 6,
          loading: false,
          wordData,
          revealedHints: [],
          hasWon: false,
          showConfetti: false,
          showLeaderboard: false,
          message: null,
          guessHistory: [],
          guessResults: [],
          timer: 0,
          fuzzyMatchPositions: [],
          guesses: [],
          hintLevel: 0
        });
      } else {
        throw new Error('Invalid game session data');
      }
    } catch (err) {
      console.error('Failed to initialize game session:', err);
      setGameState(prev => ({ ...prev, loading: false, isGameOver: true }));
      setError(err instanceof Error ? err.message : 'Failed to load game. Please try again.');
    }
  };

  const validateGameState = () => {
    // Don't validate if session isn't ready
    if (!gameState.gameId || !gameState.word) {
      return;
    }

    const isValid = 
      gameState.gameId.length > 0 &&
      gameState.word.length > 0 &&
      typeof gameState.isGameOver === 'boolean' &&
      gameState.remainingGuesses >= 0 &&
      Array.isArray(gameState.guessHistory) &&
      Array.isArray(gameState.guessResults) &&
      Array.isArray(gameState.revealedHints);

    if (!isValid) {
      console.warn('Invalid game state detected:', gameState);
      setGameState(prev => ({ ...prev, loading: true }));
      initializeGame();
    }
  };

  const handleGameState = (result: GuessResult) => {
    setGameState(prev => ({
      ...prev,
      isGameOver: result.gameOver,
      isCorrect: result.isCorrect,
      hasWon: result.isCorrect,
      guessCount: prev.guessCount + 1,
      guessResults: [...prev.guessResults, result],
      guessHistory: [...prev.guessHistory, {
        guess: result.guess,
        timestamp: Date.now(),
        result
      }],
      fuzzyMatchPositions: result.fuzzyPositions || [],
      correctWord: result.correctWord || prev.correctWord,
      guesses: [...prev.guesses, result.guess]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = normalize(value);
    
    if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
      if (cleanValue.length === 0 || cleanValue[0] === normalize(wordDataFromHook.clues.F)) {
        setGuess(cleanValue);
      }
    } else {
      setGuess(cleanValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const target = e.target as HTMLInputElement;
        if (target.selectionStart === 0 || target.selectionStart === 1) {
          e.preventDefault();
        }
      }
    }
  };

  const isGuessValid = () => {
    if (!guess.trim() || gameState.isGameOver) return false;
    
    if (revealedHints.includes(HINT_INDICES.N) && wordDataFromHook?.clues.N) {
      return guess.length === wordDataFromHook.clues.N;
    }
    
    return true;
  };

  const handleGuess = async (guess: string) => {
    if (!wordDataFromHook) {
      console.error('No word data available');
      return;
    }

    const result: GuessResult = {
      isCorrect: guess.toLowerCase() === wordDataFromHook.word.toLowerCase(),
      guess,
      isFuzzy: false,
      fuzzyPositions: [],
      gameOver: false,
      correctWord: wordDataFromHook.word
    };

    if (result.isCorrect) {
      result.gameOver = true;
    } else if (gameState.guessCount >= MAX_GUESSES - 1) {
      result.gameOver = true;
    }

    handleGameState(result);
    return result;
  };

  const handleInputFocus = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F && inputRef.current) {
      if (guess.length === 0) {
        setGuess(wordDataFromHook.clues.F);
      }
      const pos = guess.length;
      inputRef.current.setSelectionRange(pos, pos);
    }
  };

  const getInputPlaceholder = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
      return `${wordDataFromHook.clues.F}_______`;
    }
    return "Enter your guess...";
  };

  const getInputMaxLength = () => {
    if (revealedHints.includes(HINT_INDICES.N) && wordDataFromHook?.clues.N) {
      return wordDataFromHook.clues.N;
    }
    return undefined;
  };

  const handleHintReveal = (hint: HintIndex) => {
    setRevealedHints(prev => [...prev, hint]);
  };

  // ✅ All useEffect hooks
  useEffect(() => {
    if (hasPlayedToday()) {
      toast.info('You have already played today. Come back tomorrow for a new word!');
      setGameState(prev => ({ ...prev, loading: false, isGameOver: true }));
      setShowLeaderboard(true);
    } else {
      initializeGame();
    }
  }, []);

  useEffect(() => {
    validateGameState();
  }, [gameState.gameId, gameState.word, gameState.isGameOver]);

  useEffect(() => {
    let interval: number | undefined;
    if (!gameState.isGameOver) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.isGameOver]);

  // ✅ Single return with conditional rendering
  return (
    <div className="app">
      <ToastProvider>
        <Header />
        <main className="main-content">
          {gameState.loading ? (
            <GameLoader onRetry={initializeGame} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={initializeGame} />
          ) : (
            <>
              <GameHeader
                onSettingsClick={() => setShowModal(true)}
                onHowToPlayClick={() => {}}
                onStatsClick={() => {}}
              />
              <div className="game-container">
                <DefineBoxes
                  revealedHints={gameState.revealedHints}
                  onHintReveal={handleHintReveal}
                  isGameOver={gameState.isGameOver}
                  isCorrect={gameState.isCorrect}
                  guessCount={gameState.guessCount}
                  guessResults={gameState.guessResults}
                />
                <GuessInput
                  onGuess={handleGuess}
                  disabled={gameState.isGameOver}
                  maxLength={getInputMaxLength()}
                />
                <GameMessages
                  messages={message ? [message] : []}
                  onDismiss={(msg) => setMessage(null)}
                />
                <GameFooter
                  onNewGame={initializeGame}
                  onShare={() => {}}
                />
              </div>
              <HintContent
                wordData={gameState.wordData ? mapWordDataToWordClues(gameState.wordData) : null}
                revealedHints={gameState.revealedHints}
                onHintReveal={handleHintReveal}
                isGameOver={gameState.isGameOver}
                isCorrect={gameState.isCorrect}
                guessCount={gameState.guessCount}
                guessResults={gameState.guessResults}
              />
              {gameState.isGameOver && (
                <GameOverModal
                  isOpen={true}
                  onClose={() => setShowModal(false)}
                  isCorrect={gameState.isCorrect}
                  wordData={gameState.wordData ? mapWordDataToWordClues(gameState.wordData) : null}
                  correctWord={gameState.correctWord}
                  guessCount={gameState.guessCount}
                  timeTaken={timer}
                  onPlayAgain={initializeGame}
                />
              )}
              {showConfetti && <Confetti />}
              {showLeaderboard && (
                <Leaderboard
                  onClose={() => setShowLeaderboard(false)}
                  gameId={gameState.gameId}
                  isGameOver={gameState.isGameOver}
                  isCorrect={gameState.isCorrect}
                  correctWord={gameState.correctWord}
                  severity={gameState.isCorrect ? 'success' : gameState.isGameOver ? 'error' : 'info'}
                />
              )}
            </>
          )}
        </main>
      </ToastProvider>
    </div>
  );
}

export default App;
