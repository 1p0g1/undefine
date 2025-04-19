import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Confetti from './components/Confetti'
import Leaderboard from './Leaderboard'
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';
import { 
  Word,
  GuessResult,
  GameState as ImportedGameState,
  LeaderboardEntry,
  UserStats,
  UserPreferences,
  GameStats,
  WordData,
  ClientGuessResult,
  ClueType,
  GuessHistory,
  Message,
  HINT_INDICES
} from './types/index';
import DefineBoxes from './components/DefineBoxes';
import HintContent from './components/HintContent';
import GameSummary from './components/GameSummary';
import { ToastProvider, useToast } from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Timer from './components/Timer';
import GameOverModal from './components/GameOverModal';
import GameLoader from './components/GameLoader';
import Settings from './components/Settings';
import Header from './components/Header';
import { DEBUG_CONFIG } from './config/debug';

// Define local GameState interface
interface GameState {
  gameId: string;
  word: string;
  guessCount: number;
  isGameOver: boolean;
  isCorrect: boolean;
  remainingGuesses: number;
  loading: boolean;
  showConfetti?: boolean;
  showLeaderboard?: boolean;
  message?: Message | null;
  guess?: string;
  timer?: number;
  fuzzyMatchPositions?: number[];
  guessHistory?: GuessHistory[];
  correctWord?: string;
  guessResults?: ('correct' | 'incorrect' | null)[];
  revealedHints?: number[];
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
  revealedHints: number[];
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

// Define local constants
const hintOrder: number[] = [0, 1, 2, 3, 4, 5]; // Hint indices in order of reveal

function App() {
  // ✅ All useState hooks
  const [gameState, setGameState] = useState<GameState>({
    gameId: '',
    word: '',
    guessCount: 0,
    isGameOver: false,
    isCorrect: false,
    remainingGuesses: 6,
    loading: true
  });
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<Message | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number[]>([0]);
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
      
      // Add detailed debug logging
      console.log('🔍 DEBUG: Full word data received:', {
        word: data.word,
        clues: data.word?.clues,
        definitionLength: data.word?.clues?.D?.length,
        etymologyLength: data.word?.clues?.E?.length,
        inSentenceLength: data.word?.clues?.I?.length,
        synonymsCount: Array.isArray(data.word?.clues?.E2) ? data.word?.clues?.E2.length : 'not an array'
      });

      if (data && data.gameId && data.word) {
        setGameState({
          gameId: data.gameId,
          word: data.word.word,
          guessCount: 0,
          isGameOver: false,
          isCorrect: false,
          remainingGuesses: 6,
          loading: false
        });
        setWordData(data.word);
        
        // Log after state update
        setTimeout(() => {
          console.log('🔍 DEBUG: Game state and word data set:', {
            gameState: {
              gameId: data.gameId,
              word: data.word.word,
              guessCount: 0,
              isGameOver: false,
              isCorrect: false,
              remainingGuesses: 6
            },
            wordData: data.word
          });
        }, 100);
      } else {
        throw new Error('Invalid game session data');
      }
    } catch (err) {
      console.error('Failed to initialize game session:', err);
      setGameState(prev => ({ ...prev, loading: false, isGameOver: true }));
      setError(err instanceof Error ? err.message : 'Failed to load game. Please try again.');
    }
  };

  // Function to fetch a random word for testing
  const fetchRandomWord = async () => {
    setGameState(prev => ({ ...prev, loading: true, isGameOver: false }));
    setError('');

    try {
      console.log('⚠️ TESTING MODE: Fetching random word instead of daily word');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(getApiUrl('/api/random'), {
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load random word' }));
        throw new Error(errorData.error || 'Failed to load random word');
      }

      const data = await response.json();

      console.log('Random word game session:', {
        hasGameId: !!data.gameId,
        hasWord: !!data.word,
        wordId: data.word?.id
      });

      if (data && data.gameId && data.word) {
        setGameState({
          gameId: data.gameId,
          word: data.word.word,
          guessCount: 0,
          isGameOver: false,
          isCorrect: false,
          remainingGuesses: 6,
          loading: false
        });
        setWordData(data.word);
        toast.info('Random test word loaded! This is not the daily word.');
      } else {
        throw new Error('Invalid random word data');
      }
    } catch (err) {
      console.error('Failed to load random word:', err);
      setGameState(prev => ({ ...prev, loading: false }));
      setError(err instanceof Error ? err.message : 'Failed to load random word. Please try again.');
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const normalize = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  };

  const handleGameState = async (result: ClientGuessResult) => {
    console.log('Processing game state update:', {
      result,
      currentGameState: gameState,
      wordData
    });

    if (!wordData) {
      console.error('No word data available');
      toast.error('An error occurred. Starting a new game...');
      return;
    }

    const newGuessHistory = [...guessHistory];
    newGuessHistory.push({
      word: result.guess,
      isCorrect: result.isCorrect,
      isFuzzy: result.isFuzzy
    });
    setGuessHistory(newGuessHistory);

    const newGuessCount = gameState.guessCount + 1;
    
    console.log('Updating game state:', {
      newGuessCount,
      isCorrect: result.isCorrect,
      gameOver: result.gameOver
    });

    // Batch state updates together
    if (result.isCorrect === true) {
      setGameState(prev => {
        console.log('Setting winning game state:', {
          ...prev,
          guessCount: newGuessCount,
          remainingGuesses: 6 - newGuessCount,
          isCorrect: true,
          isGameOver: true,
          showConfetti: true,
          showLeaderboard: true,
          correctWord: wordData.word
        });
        return {
          ...prev,
          guessCount: newGuessCount,
          remainingGuesses: 6 - newGuessCount,
          isCorrect: true,
          isGameOver: true,
          showConfetti: true,
          showLeaderboard: true,
          correctWord: wordData.word
        };
      });
      
      const newGuessResults = [...guessResults];
      newGuessResults[gameState.guessCount] = 'correct';
      setGuessResults(newGuessResults);
      
      if (updateGameStats) {
        updateGameStats(true);
      }
      
      toast.success('Congratulations! You got it right!');
      setShowModal(true);
      return;
    }

    // Update state for incorrect guess
    setGameState(prev => {
      const newState = {
        ...prev,
        guessCount: newGuessCount,
        remainingGuesses: 6 - newGuessCount,
        isGameOver: 6 - newGuessCount <= 0,
        showLeaderboard: 6 - newGuessCount <= 0,
        correctWord: 6 - newGuessCount <= 0 ? wordData.word : prev.correctWord
      };
      console.log('Setting incorrect game state:', newState);
      return newState;
    });

    const newGuessResults = [...guessResults];
    newGuessResults[gameState.guessCount] = 'incorrect';
    setGuessResults(newGuessResults);
    
    if (result.isFuzzy && result.fuzzyPositions) {
      setFuzzyMatchPositions(result.fuzzyPositions);
      setFuzzyCount(prev => prev + 1);
      toast.info('Close! Some letters are in the right position.');
    } else {
      setFuzzyMatchPositions([]);
      toast.warning('Try again!');
    }

    const hintOrder: ClueType[] = ['D', 'E', 'F', 'I', 'N', 'E2'];
    if (newGuessCount < hintOrder.length) {
      const newRevealedHints = [...revealedHints];
      const hintIndex = HINT_INDICES[hintOrder[newGuessCount]];
      
      // Debug logging for hint revealing
      console.log('🔍 DEBUG: Hint revealing logic:', {
        currentGuessCount: newGuessCount,
        hintType: hintOrder[newGuessCount],
        hintTypeIndex: hintIndex,
        currentRevealedHints: [...revealedHints],
        willReveal: !newRevealedHints.includes(hintIndex)
      });
      
      if (!newRevealedHints.includes(hintIndex)) {
        newRevealedHints.push(hintIndex);
        setRevealedHints(newRevealedHints);
        
        // Log after update
        console.log('🔍 DEBUG: Updated revealed hints:', {
          newRevealedHints,
          correspondingTypes: newRevealedHints.map(idx => 
            Object.entries(HINT_INDICES).find(([key, val]) => val === idx)?.[0] || 'unknown'
          )
        });
      }
    }
    
    if (6 - newGuessCount <= 0) {
      if (updateGameStats) {
        updateGameStats(false);
      }
      toast.error(`Game Over! The word was: ${wordData.word}`);
      setShowModal(true);
    }
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

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wordData || !gameState.gameId || !guess.trim()) {
      console.warn('Invalid guess attempt:', {
        hasWordData: !!wordData,
        hasGameId: !!gameState.gameId,
        hasGuess: !!guess.trim()
      });
      toast.error('Please enter a valid guess');
      return;
    }
    
    try {
      const trimmedGuess = guess.trim();
      const response = await fetch(getApiUrl('/api/guess'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: gameState.gameId, 
          guess: trimmedGuess,
          username: localGameState.nickname || 'anonymous'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit guess' }));
        throw new Error(errorData.error || 'Failed to submit guess');
      }

      const result = await response.json();
      
      const processedResult: ClientGuessResult = {
        isCorrect: result.isCorrect === true,
        correct: result.isCorrect === true,
        guess: trimmedGuess,
        isFuzzy: !!result.isFuzzy,
        fuzzyPositions: result.fuzzyPositions || [],
        gameOver: !!result.gameOver,
        correctWord: result.correctWord || wordData.word
      };
      
      setGuess('');
      handleGameState(processedResult);
    } catch (error) {
      console.error('Error submitting guess:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to submit guess. Please try again.');
    }
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

  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        const response = await fetch('/api/game');
        const data = await response.json();
        
        if (DEBUG_CONFIG.verboseLogging) {
          console.log('[DEBUG] Game session response:', data);
          console.log('[DEBUG] Word data available:', !!data.word);
          if (data.word) {
            console.log('[DEBUG] Word data details:', {
              word: data.word.word,
              cluesAvailable: !!data.word.clues,
              clueTypes: data.word.clues ? Object.keys(data.word.clues) : [],
              definitionLength: data.word.clues?.D?.length || 0,
              etymologyLength: data.word.clues?.E?.length || 0,
              exampleLength: data.word.clues?.I?.length || 0,
              synonymsCount: Array.isArray(data.word.clues?.E2) ? data.word.clues.E2.length : 0
            });
          }
        }
        
        setGameState(data);
        setWordData(data.word);
        
        if (DEBUG_CONFIG.verboseLogging) {
          console.log('[DEBUG] Game state after set:', {
            gameState: data,
            wordData: data.word
          });
        }
      } catch (error) {
        console.error('Error fetching game session:', error);
      }
    };

    fetchGameSession();
  }, []);

  // Update the hint revealing logic
  useEffect(() => {
    if (!wordData || gameState.isGameOver) return;

    const newRevealedHints = [...revealedHints];
    const hintIndex = gameState.guessCount < hintOrder.length ? hintOrder[gameState.guessCount] : null;
    
    if (DEBUG_CONFIG.verboseLogging) {
      console.log('[DEBUG] Hint revealing logic:', {
        guessCount: gameState.guessCount,
        hintTypeToReveal: hintIndex ? 
          (hintIndex === 1 ? 'Etymology' : 
           hintIndex === 2 ? 'First Letter' : 
           hintIndex === 3 ? 'Example' : 
           hintIndex === 4 ? 'Number of Letters' : 
           hintIndex === 5 ? 'Synonyms' : 'Unknown') : 'None',
        currentRevealedHints: revealedHints,
        willRevealNewHint: hintIndex !== null && !revealedHints.includes(hintIndex)
      });
    }

    if (hintIndex !== null && !newRevealedHints.includes(hintIndex)) {
      newRevealedHints.push(hintIndex);
      setRevealedHints(newRevealedHints);
      
      if (DEBUG_CONFIG.verboseLogging) {
        console.log('[DEBUG] Updated revealed hints:', {
          newRevealedHints,
          hintTypes: newRevealedHints.map(index => 
            index === 1 ? 'Etymology' : 
            index === 2 ? 'First Letter' : 
            index === 3 ? 'Example' : 
            index === 4 ? 'Number of Letters' : 
            index === 5 ? 'Synonyms' : 'Unknown'
          )
        });
      }
    }
  }, [gameState.guessCount, wordData, gameState.isGameOver, revealedHints]);

  // ✅ Single return with conditional rendering
  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={
          gameState.loading || !gameState.gameId ? (
            <GameLoader
              error={error}
              onRetry={() => {
                setError('');
                initializeGame();
              }}
              onRandomWord={fetchRandomWord}
            />
          ) : (
            <>
              {/* Main game content */}
              <div className="game-container">
                <Timer time={formatTime(timer)} />
                <DefineBoxes 
                  isCorrect={gameState.isCorrect}
                  guessCount={gameState.guessCount}
                  revealedHints={revealedHints}
                  guessResults={guessResults}
                />
                <div className="input-container">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guess}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      handleKeyDown(e);
                      if (e.key === 'Enter' && isGuessValid() && !gameState.isGameOver) {
                        e.preventDefault();
                        handleGuess(e);
                      }
                    }}
                    onFocus={handleInputFocus}
                    placeholder={getInputPlaceholder()}
                    maxLength={getInputMaxLength()}
                    disabled={gameState.isGameOver}
                    className={`guess-input ${gameState.isGameOver ? 'disabled' : ''}`}
                  />
                  <button
                    onClick={handleGuess}
                    disabled={!isGuessValid() || gameState.isGameOver}
                    className={`guess-button ${(!isGuessValid() || gameState.isGameOver) ? 'disabled' : ''}`}
                  >
                    Guess
                  </button>
                </div>
                <div className="guesses-remaining">
                  Guesses remaining: {gameState.remainingGuesses}
                </div>
                {wordData && (
                  <HintContent 
                    wordData={wordData}
                    revealedHints={revealedHints}
                  />
                )}
                {showConfetti && <Confetti />}
                {showLeaderboard && (
                  <Leaderboard 
                    gameId={gameState.gameId}
                    isGameOver={gameState.isGameOver}
                    isCorrect={gameState.isCorrect}
                    correctWord={wordData?.word || ''}
                    onClose={() => setShowLeaderboard(false)}
                  />
                )}
                {message && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}
              </div>
              {wordData && (
                <GameOverModal
                  isOpen={showModal}
                  wordData={wordData}
                  isCorrect={gameState.isCorrect}
                  onClose={() => setShowModal(false)}
                />
              )}
            </>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
