import React, { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Confetti from './components/Confetti.js'
import Leaderboard from './Leaderboard.js'
import { getApiUrl } from './config.js';
import { useLocalGameState } from './hooks/useLocalGameState.js';
import { 
  GuessResult,
  GameState as ImportedGameState,
  WordData,
  ClueType,
  GuessHistory,
  Message,
  HintIndex,
  HINT_INDICES,
  AppGameState
} from '@undefine/shared-types';
import DefineBoxes from './components/DefineBoxes.js';
import HintContent from './components/HintContent.js';
import GameSummary from './components/GameSummary.js';
import { ToastProvider, useToast } from './components/Toast.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import ErrorMessage from './components/ErrorMessage.js';
import Timer from './components/Timer.js';
import GameOverModal from './components/GameOverModal.js';
import GameLoader from './components/GameLoader.js';
import Settings from './components/Settings.js';
import Header from './components/Header.js';
import { formatTime } from './utils/time.js';

// Define local GameState interface
interface GameState extends AppGameState {
  gameId: string;
  word: string;
  loading: boolean;
  timer?: number;
  fuzzyMatchPositions?: number[];
  correctWord?: string;
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
  // ✅ All useState hooks
  const [gameState, setGameState] = useState<GameState>({
    gameId: '',
    word: '',
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
    fuzzyMatchPositions: []
  });
  const [wordData, setWordData] = useState<WordData | null>(null);
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
  const [guessResults, setGuessResults] = useState<('correct' | 'incorrect' | null)[]>([null, null, null, null, null, null]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);

  // ✅ useRef hooks
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Custom hooks
  const { state: localGameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const toast = useToast();

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
          clues: data.word.clues
        };

        setGameState({
          gameId: data.gameId,
          word: data.word.word,
          guessCount: 0,
          isGameOver: false,
          isCorrect: false,
          remainingGuesses: 6,
          loading: false,
          wordData: wordData.clues,
          revealedHints: [],
          hasWon: false,
          showConfetti: false,
          showLeaderboard: false,
          message: null,
          guessHistory: [],
          guessResults: [],
          timer: 0,
          fuzzyMatchPositions: []
        });
        setWordData(wordData);
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
      gameState.remainingGuesses >= 0;

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
      fuzzyMatchPositions: result.fuzzyPositions,
      correctWord: result.correctWord
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = normalize(value);
    
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.clues.F) {
      if (cleanValue.length === 0 || cleanValue[0] === normalize(wordData.clues.F)) {
        setGuess(cleanValue);
      }
    } else {
      setGuess(cleanValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.clues.F) {
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
    
    if (revealedHints.includes(HINT_INDICES.N) && wordData?.clues.N) {
      return guess.length === wordData.clues.N;
    }
    
    return true;
  };

  const handleGuess = async (guess: string) => {
    if (!wordData) {
      console.error('No word data available');
      return;
    }

    const result: GuessResult = {
      isCorrect: guess.toLowerCase() === wordData.word.toLowerCase(),
      guess,
      isFuzzy: false,
      fuzzyPositions: [],
      gameOver: false
    };

    if (result.isCorrect) {
      result.gameOver = true;
    } else if (gameState.guessCount >= MAX_GUESSES - 1) {
      result.gameOver = true;
      result.correctWord = wordData.word;
    }

    handleGameState(result);
    return result;
  };

  const handleInputFocus = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.clues.F && inputRef.current) {
      if (guess.length === 0) {
        setGuess(wordData.clues.F);
      }
      const pos = guess.length;
      inputRef.current.setSelectionRange(pos, pos);
    }
  };

  const getInputPlaceholder = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.clues.F) {
      return `${wordData.clues.F}_______`;
    }
    return "Enter your guess...";
  };

  const getInputMaxLength = () => {
    if (revealedHints.includes(HINT_INDICES.N) && wordData?.clues.N) {
      return wordData.clues.N;
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
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={
          <>
            {gameState.loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} onRetry={initializeGame} />
            ) : (
              <div className="game-container">
                <Timer time={formatTime(timer)} />
                <DefineBoxes
                  revealedHints={gameState.revealedHints}
                  onHintReveal={handleHintReveal}
                  isGameOver={gameState.isGameOver}
                  isCorrect={gameState.isCorrect}
                  guessCount={gameState.guessCount}
                  guessResults={gameState.guessResults}
                />
                <HintContent
                  wordData={gameState.wordData}
                  revealedHints={gameState.revealedHints}
                  onHintReveal={handleHintReveal}
                  isGameOver={gameState.isGameOver}
                  isCorrect={gameState.isCorrect}
                  guessCount={gameState.guessCount}
                  guessResults={gameState.guessResults}
                />
                <GameOverModal
                  isOpen={gameState.isGameOver}
                  onClose={() => setShowModal(false)}
                  isCorrect={gameState.isCorrect}
                  wordData={wordData!}
                  guessCount={gameState.guessCount}
                  timeTaken={timer}
                  onPlayAgain={initializeGame}
                />
              </div>
            )}
          </>
        } />
        <Route path="/leaderboard" element={
          showLeaderboard && (
            <Leaderboard
              gameId={gameState.gameId}
              isGameOver={gameState.isGameOver}
              isCorrect={gameState.isCorrect}
              correctWord={gameState.word}
              onClose={() => setShowLeaderboard(false)}
            />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
