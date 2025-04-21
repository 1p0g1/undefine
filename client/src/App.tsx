import React, { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Confetti from './components/Confetti'
import Leaderboard from './Leaderboard'
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';
import { 
  WordData, 
  HintIndex, 
  Message, 
  GameState, 
  HINT_INDICES, 
  clueTypeToNumber, 
  numberToClueType,
  isGameLoaded,
  isGameInProgress as isGameActive,
  initialGameState, 
  GuessResult,
  GuessHistory,
  BaseGameState,
  LoadingGameState,
  ActiveGameState,
  UserStats,
  LeaderboardEntry,
  ClueType,
  ClientGuessResult
} from './types/index';
import { WordClues, GameWord } from '@shared/index';
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
import { useHintRevealer } from './hooks/useHintRevealer';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useGameState } from './hooks/useGameState';
import { useGameSession } from './hooks/useGameSession';
import { useGameGuess } from './hooks/useGameGuess';
import { isWordData, validateWordData } from '@shared/utils/word';
import { WordData as SharedWordData, SafeClueData } from '@undefine/shared-types/utils/word';
import { AppGameState } from '@reversedefine/shared-types/utils/game';

// Extended game state interfaces
interface ExtendedBaseGameState extends BaseGameState {
  gameId: string;
  error: string | null;
}

interface ExtendedLoadingGameState extends ExtendedBaseGameState {
  loading: true;
  wordData: null;
}

interface ExtendedActiveGameState extends ExtendedBaseGameState {
  loading: false;
  wordData: WordData;
}

type ExtendedGameState = ExtendedLoadingGameState | ExtendedActiveGameState;

const isGameInProgress = (state: ExtendedGameState): state is ExtendedActiveGameState => {
  return !state.loading && !state.isGameOver;
};

// Helper functions for state transitions
const toLoadingState = (state: ExtendedGameState): ExtendedLoadingGameState => ({
  ...state,
  loading: true,
  wordData: null,
  isGameOver: false,
  hasWon: false,
  isCorrect: false
});

const toActiveState = (state: ExtendedGameState, wordData: WordData): ExtendedActiveGameState => ({
  ...state,
  loading: false,
  wordData,
  isGameOver: false,
  hasWon: false,
  isCorrect: false
});

function App() {
  // ✅ All useState hooks
  const [gameState, setGameState] = useState<ExtendedGameState>({
    loading: true,
    wordData: null,
    revealedHints: [],
    remainingGuesses: 6,
    isGameOver: false,
    hasWon: false,
    isCorrect: false,
    showConfetti: false,
    showLeaderboard: false,
    message: null,
    guessCount: 0,
    guessHistory: [],
    guessResults: [],
    error: null,
    gameId: '',
  });
  const [guess, setGuess] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [revealedHints, setRevealedHints] = useState<HintIndex[]>([HINT_INDICES.D]);
  const [fuzzyCount, setFuzzyCount] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [guessResults, setGuessResults] = useState<('correct' | 'incorrect' | null)[]>([]);
  const [gameGuessResults, setGameGuessResults] = useState<GuessResult[]>([]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);

  // ✅ useRef hooks
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Custom hooks
  const { state: localGameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const toast = useToast();

  // Add state for modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);

  // ✅ All helper functions
  const convertGameWordToWordData = (gameWord: any): WordData => {
    return {
      id: gameWord.id,
      word: gameWord.word,
      definition: gameWord.definition,
      etymology: gameWord.etymology,
      first_letter: gameWord.first_letter,
      in_a_sentence: gameWord.in_a_sentence,
      number_of_letters: gameWord.number_of_letters,
      equivalents: gameWord.equivalents,
      difficulty: gameWord.difficulty,
      created_at: gameWord.created_at,
      updated_at: gameWord.updated_at,
      clues: {
        D: gameWord.clues.D,
        E: gameWord.clues.E,
        F: gameWord.clues.F,
        I: gameWord.clues.I,
        N: gameWord.clues.N,
        E2: gameWord.clues.E2
      }
    };
  };

  const initializeGame = async () => {
    try {
      const loadingState: ExtendedLoadingGameState = {
        ...initialGameState,
        loading: true,
        wordData: null,
        error: undefined,
        message: null,
        gameId: undefined,
        revealedHints: [],
        remainingGuesses: 6,
        guessHistory: [],
        guessResults: [],
        fuzzyMatchPositions: [],
        isGameOver: false,
        hasWon: false,
        isCorrect: false,
        showConfetti: false,
        showLeaderboard: false,
        guessCount: 0
      };
      setGameState(loadingState);

      const response = await fetch('/api/game/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to initialize game');
      }

      const data = await response.json();
      const wordData = convertGameWordToWordData(data.word);

      const activeState: ExtendedActiveGameState = {
        loading: false,
        wordData,
        gameId: data.gameId,
        error: undefined,
        revealedHints: [HINT_INDICES.D],
        remainingGuesses: 6,
        isGameOver: false,
        hasWon: false,
        isCorrect: false,
        showConfetti: false,
        showLeaderboard: false,
        message: null,
        guessCount: 0,
        guessHistory: [],
        guessResults: [],
        fuzzyMatchPositions: []
      };
      setGameState(activeState);
    } catch (error) {
      const errorState: ExtendedLoadingGameState = {
        ...initialGameState,
        loading: true,
        wordData: null,
        error: error instanceof Error ? error.message : 'An error occurred',
        gameId: undefined,
        revealedHints: [],
        remainingGuesses: 6,
        guessHistory: [],
        guessResults: [],
        fuzzyMatchPositions: [],
        isGameOver: false,
        hasWon: false,
        isCorrect: false,
        showConfetti: false,
        showLeaderboard: false,
        guessCount: 0
      };
      setGameState(errorState);
    }
  };

  // Function to fetch a random word for testing
  const fetchRandomWord = async () => {
    try {
      const response = await fetch('/api/random-word');
      if (!response.ok) {
        throw new Error('Failed to fetch word');
      }
      const data = await response.json();
      const wordData = validateWordData(data);
      
      const newState: ExtendedActiveGameState = {
        ...initialGameState,
        loading: false,
        wordData: wordData,
        revealedHints: [HINT_INDICES.D],
        message: null,
        guessHistory: [],
        guessResults: [],
        guessCount: 0,
        remainingGuesses: 6,
        hasWon: false,
        isCorrect: false,
        showConfetti: false,
        showLeaderboard: false,
        fuzzyMatchPositions: [],
        isGameOver: false
      };
      
      setGameState(newState);
    } catch (err) {
      const errorState: ExtendedLoadingGameState = {
        ...initialGameState,
        loading: true,
        wordData: null,
        error: err instanceof Error ? err.message : 'Failed to fetch word',
        message: {
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to fetch word'
        },
        revealedHints: [],
        remainingGuesses: 6,
        guessHistory: [],
        guessResults: [],
        fuzzyMatchPositions: [],
        isGameOver: false,
        hasWon: false,
        isCorrect: false,
        showConfetti: false,
        showLeaderboard: false,
        guessCount: 0
      };
      setGameState(errorState);
    }
  };

  const validateGameState = () => {
    // Don't validate if session isn't ready
    if (!isGameLoaded(gameState)) {
      return;
    }

    const isValid = 
      gameState.wordData.word.length > 0 &&
      Array.isArray(gameState.guessHistory) &&
      gameState.remainingGuesses >= 0;

    if (!isValid) {
      console.error('Invalid game state:', gameState);
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

  const handleGameState = async (result: GuessResult) => {
    if (!gameState.wordData) return;
    
    setGameState((prev: ExtendedGameState) => ({
      ...prev,
      guessHistory: {
        ...prev.guessHistory,
        gameOver: result.gameOver,
        isCorrect: result.isCorrect,
        correctWord: result.isCorrect ? gameState.wordData.word : undefined,
      },
      message: result.isCorrect
        ? {
            type: 'success',
            text: `Congratulations! The word was "${gameState.wordData.word}"`,
          }
        : {
            type: 'error',
            text: `Sorry, the word was "${gameState.wordData.word}"`,
          },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = normalize(value);
    
    if (revealedHints.includes(HINT_INDICES.F) && gameState.wordData?.clues.F) {
      if (cleanValue.length === 0 || cleanValue[0] === normalize(gameState.wordData.clues.F)) {
        setGuess(cleanValue);
      }
    } else {
      setGuess(cleanValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (revealedHints.includes(HINT_INDICES.F) && gameState.wordData?.clues.F) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const target = e.target as HTMLInputElement;
        if (target.selectionStart === 0 || target.selectionStart === 1) {
          e.preventDefault();
        }
      }
    }
  };

  const isGuessValid = () => {
    return guess.trim().length > 0 && !gameState.isGameOver;
  };

  const handleGuess = async (guess: string) => {
    if (!isGameInProgress(gameState)) return;

    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess, gameId: gameState.gameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process guess');
      }

      const result = data as GuessResult;
      const newGuessHistory: GuessHistory = {
        guess,
        timestamp: Date.now(),
        result,
      };

      setGameState((prev) => {
        if (!isGameInProgress(prev)) return prev;
        return {
          ...prev,
          guessHistory: [...prev.guessHistory, newGuessHistory],
          guessResults: [...prev.guessResults, result],
          guessCount: prev.guessCount + 1,
          isGameOver: result.isCorrect || prev.remainingGuesses <= 1,
          hasWon: result.isCorrect,
          isCorrect: result.isCorrect,
          remainingGuesses: prev.remainingGuesses - 1,
          message: {
            type: result.isCorrect ? 'success' : 'info',
            text: result.isCorrect ? 'Correct guess!' : 'Try again!',
          },
          showConfetti: result.isCorrect,
          showLeaderboard: result.isCorrect,
        };
      });
    } catch (error) {
      setGameState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        message: {
          type: 'error',
          text: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
    }
  };

  const handleInputFocus = () => {
    if (revealedHints.includes(HINT_INDICES.F) && gameState.wordData?.clues.F && inputRef.current) {
      if (guess.length === 0) {
        setGuess(gameState.wordData.clues.F);
      }
      const pos = guess.length;
      inputRef.current.setSelectionRange(pos, pos);
    }
  };

  const getInputPlaceholder = () => {
    if (revealedHints.includes(HINT_INDICES.F) && gameState.wordData?.clues.F) {
      return `${gameState.wordData.clues.F}_______`;
    }
    return "Enter your guess...";
  };

  const getInputMaxLength = () => {
    if (revealedHints.includes(HINT_INDICES.N) && gameState.wordData?.clues.N) {
      return gameState.wordData.clues.N;
    }
    return undefined;
  };

  // ✅ All useEffect hooks
  useEffect(() => {
    if (hasPlayedToday()) {
      toast.info('You have already played today. Come back tomorrow for a new word!');
      setGameState(prev => ({ ...prev, loading: false, guessHistory: { gameOver: true } } as ExtendedLoadingGameState));
      setGameState(prev => ({ ...prev, showLeaderboard: true }));
    } else {
      initializeGame();
    }
  }, []);

  useEffect(() => {
    validateGameState();
  }, [gameState.gameId, gameState.wordData, gameState.guessHistory.gameOver]);

  useEffect(() => {
    let interval: number | undefined;
    if (!gameState.guessHistory.gameOver) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.guessHistory.gameOver]);

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

  // Replace the old hint revealing useEffect with the hook
  useHintRevealer({
    guessCount: gameState.guessCount,
    isGameOver: gameState.guessHistory.gameOver,
    revealedHints,
    setRevealedHints
  });

  const renderGameContent = () => {
    if (!isGameInProgress(gameState)) {
      return <LoadingSpinner />;
    }

    const guessResultArray: ('correct' | 'incorrect' | null)[] = gameState.guessResults.map(result => 
      result.isCorrect ? 'correct' : 'incorrect'
    );

    return (
      <div className="game-content">
        <HintContent
          wordData={gameState.wordData}
          revealedHints={gameState.revealedHints}
          onHintReveal={handleHintReveal}
          isGameOver={gameState.isGameOver}
          hasWon={gameState.hasWon}
          guessResults={guessResultArray}
        />
        {/* ... rest of the content ... */}
      </div>
    );
  };

  const handleShowLeaderboard = () => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: true
    }));
  };

  const handleHintReveal = async (hintIndex: HintIndex) => {
    if (!isGameInProgress(gameState)) return;

    try {
      const response = await fetch('/api/game/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hintIndex, gameId: gameState.gameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reveal hint');
      }

      setGameState((prev) => {
        if (!isGameInProgress(prev)) return prev;
        return {
          ...prev,
          revealedHints: [...prev.revealedHints, hintIndex],
          message: {
            type: 'info',
            text: 'New hint revealed!',
          },
        };
      });
    } catch (error) {
      setGameState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        message: {
          type: 'error',
          text: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
    }
  };

  const handleRevealedHintsChange = (hints: HintIndex[]) => {
    setGameState(prevState => {
      if (!isGameInProgress(prevState)) {
        return prevState;
      }

      return {
        ...prevState,
        revealedHints: hints
      };
    });
  };

  // ✅ Single return with conditional rendering
  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={
          gameState.loading || !gameState.gameId ? (
            <GameLoader
              error={gameState.error || undefined}
              onRetry={() => {
                setGameState(prev => ({ ...prev, error: null }));
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
                  revealedHints={gameState.revealedHints}
                  guessResults={gameState.guessResults}
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
                        handleGuess(guess);
                      }
                    }}
                    onFocus={handleInputFocus}
                    placeholder={getInputPlaceholder()}
                    maxLength={getInputMaxLength()}
                    disabled={gameState.isGameOver}
                    className={`guess-input ${gameState.isGameOver ? 'disabled' : ''}`}
                  />
                  <button
                    onClick={() => handleGuess(guess)}
                    disabled={!isGuessValid() || gameState.isGameOver}
                    className={`guess-button ${(!isGuessValid() || gameState.isGameOver) ? 'disabled' : ''}`}
                  >
                    Guess
                  </button>
                </div>
                <div className="guesses-remaining">
                  Guesses remaining: {gameState.remainingGuesses}
                </div>
                {gameState.wordData && (
                  <HintContent 
                    wordData={gameState.wordData}
                    revealedHints={gameState.revealedHints}
                    isGameOver={gameState.isGameOver}
                  />
                )}
                {gameState.showConfetti && <Confetti />}
                {gameState.showLeaderboard && (
                  <Leaderboard 
                    gameId={gameState.gameId}
                    isGameOver={gameState.isGameOver}
                    isCorrect={gameState.isCorrect}
                    correctWord={gameState.wordData?.word || ''}
                    onClose={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}
                  />
                )}
                {gameState.message && (
                  <div className={`message ${gameState.message.type}`}>
                    {gameState.message.text}
                  </div>
                )}
              </div>
              {gameState.wordData && (
                <GameOverModal
                  isOpen={showModal}
                  wordData={gameState.wordData}
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
