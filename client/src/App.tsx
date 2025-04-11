import { useState, useEffect, useRef } from 'react'
import './App.css'
import Confetti from 'react-confetti'
import Leaderboard from './Leaderboard'
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';
import type { WordData, GameState, GuessResult } from './types';
import DefineHints from './components/DefineHints';

// Add TypeScript declarations for our window extensions
declare global {
  interface Window {
    API_BASE_URL?: string;
    getApiUrl?: (path: string) => string;
    buildApiUrl?: (endpoint: string) => string;
    testApiConnection?: () => Promise<void>;
  }
}

interface GuessHistory {
  word: string;
  isCorrect: boolean;
  isFuzzy: boolean;
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

function App() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [gameId, setGameId] = useState<string>('');
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number[]>([0]);
  const [guessCount, setGuessCount] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [fuzzyCount, setFuzzyCount] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState<number>(6);
  const [guessResults, setGuessResults] = useState<('correct' | 'incorrect' | null)[]>([null, null, null, null, null, null]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);
  const [correctWord, setCorrectWord] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { state: gameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const username = gameState.nickname || 'anonymous';

  // Add effect to handle invalid game state
  useEffect(() => {
    if (isGameOver && !wordData) {
      console.error('Invalid game state detected: Game over with no word data');
      handleNextWord();
    }
  }, [isGameOver, wordData]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (hasPlayedToday()) {
      setMessage('You have already played today. Come back tomorrow for a new word!');
      setIsGameOver(true);
      setShowLeaderboard(true);
      return;
    }
    
    if (!wordData) {
      fetchNewWord();
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (!isGameOver) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameOver]);

  const fetchNewWord = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(getApiUrl('/api/word'));
      if (!response.ok) {
        throw new Error('Failed to fetch word');
      }
      
      const data = await response.json();
      if (!data.word) {
        throw new Error('Invalid response format');
      }
      
      setWordData(data.word);
      setGameId(data.gameId);
      setLoading(false);
      setIsGameOver(false);
      setGuessCount(0);
      setRemainingGuesses(6);
      setGuessResults([null, null, null, null, null, null]);
      setRevealedHints([0]); // Reset to only show definition
    } catch (error) {
      console.error('Error fetching word:', error);
      setError('Failed to fetch word. Please try again.');
      setLoading(false);
    }
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wordData || !gameId || !guess.trim()) return;
    
    try {
      const response = await fetch(getApiUrl('/api/guess'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, guess: guess.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to submit guess');
      }

      const result = await response.json() as GuessResult;
      
      // Handle correct guess
      if (result.isCorrect) {
        setIsCorrect(true);
        setIsGameOver(true);
        setMessage('Congratulations! You found the word!');
        setShowConfetti(true);
        setCorrectWord(wordData.word);
        
        // Only mark the current box as correct
        const newGuessResults = [...guessResults];
        newGuessResults[guessCount] = 'correct';
        setGuessResults(newGuessResults);
        
        // Update stats and show leaderboard
        updateGameStats(true, guessCount + 1, timer);
        setShowLeaderboard(true);
        return;
      }

      // Update game state
      setGuessCount(prev => prev + 1);
      setGuess('');
      setRemainingGuesses(prev => prev - 1);

      // Handle incorrect guess
      const newGuessResults = [...guessResults];
      newGuessResults[guessCount] = 'incorrect';
      setGuessResults(newGuessResults);

      // Reveal next hint
      const hintOrder = [0, 1, 2, 3, 4, 5];
      const nextHintIndex = revealedHints.length;
      if (nextHintIndex < hintOrder.length) {
        setRevealedHints(prev => [...prev, hintOrder[nextHintIndex]]);
      }

      // Check for game over
      if (result.gameOver || remainingGuesses <= 1) {
        setIsGameOver(true);
        setMessage(`Game Over! The word was: ${wordData.word}`);
        updateGameStats(false, 6, timer);
        setShowLeaderboard(true);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
      setMessage('Failed to submit guess. Please try again.');
    }
  };

  const handleNextWord = () => {
    setGuess('');
    setGuessHistory([]);
    setGuessResults([null, null, null, null, null, null]);
    setFuzzyMatchPositions([]);
    
    fetchNewWord();
    setIsGameOver(false);
  };

  // DEFINE boxes component
  const DefineBoxes = () => {
    const defineLetters = ['D', 'E', 'F', 'I', 'N', 'E'];
    
    return (
      <div className="define-boxes-container">
        <span className="un-prefix">Un ·</span>
        <div className="define-boxes">
          {defineLetters.map((letter, index) => {
            let boxClass = 'define-box';
            
            // If this is the current guess and it's correct
            if (index === guessCount && isCorrect) {
              boxClass += ' correct';
            }
            // If this is a past guess and it was incorrect
            else if (index < guessCount) {
              boxClass += ' incorrect';
            }
            // If this is the current guess box
            else if (index === guessCount && !isGameOver) {
              boxClass += ' hint-revealed';
            }
            
            return (
              <div key={index} className={boxClass}>
                {letter}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Update the hint type mapping
  const HINT_INDICES = {
    D: 0,  // Definition
    E: 1,  // Etymology
    F: 2,  // First Letter
    I: 3,  // In a Sentence
    N: 4,  // Number of Letters
    E2: 5, // Equivalents/Synonyms
  } as const;

  // Helper function to convert hint type to index
  const getHintIndex = (hintType: keyof typeof HINT_INDICES) => HINT_INDICES[hintType];

  // Update input handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.first_letter) {
      if (value.length === 0 || value[0].toLowerCase() === wordData.first_letter.toLowerCase()) {
        setGuess(value);
      }
    } else {
      setGuess(value);
    }
  };

  const handleInputFocus = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.first_letter && inputRef.current) {
      if (guess.length === 0) {
        setGuess(wordData.first_letter);
      }
      const pos = guess.length;
      inputRef.current.setSelectionRange(pos, pos);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.first_letter) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const target = e.target as HTMLInputElement;
        if (target.selectionStart === 0 || target.selectionStart === 1) {
          e.preventDefault();
        }
      }
    }
  };

  // Render hints based on DEFINE progression
  const HintContent = () => {
    if (!wordData) return null;

    return (
      <div className="hints-container game-summary">
        <h2 className="word-title">Un·DEFINE</h2>
        <div className="summary-content">
          {/* All hints are always rendered, but only visible when revealed */}
          <p className="definition-entry visible">
            <strong>Definition:</strong> {wordData.definition}
          </p>

          <p className={`etymology-entry ${revealedHints.includes(HINT_INDICES.E) ? 'visible' : ''}`}>
            <strong>Etymology:</strong> {wordData.etymology || 'No etymology available'}
          </p>

          <p className={`first-letter-entry ${revealedHints.includes(HINT_INDICES.F) ? 'visible' : ''}`}>
            <strong>First Letter:</strong> {wordData.first_letter}
          </p>

          <p className={`sentence-entry ${revealedHints.includes(HINT_INDICES.I) ? 'visible' : ''}`}>
            <strong>Example:</strong> {wordData.in_a_sentence?.replace(wordData.word, '_'.repeat(wordData.word.length)) || 'No example sentence available'}
          </p>

          <p className={`letter-count-entry ${revealedHints.includes(HINT_INDICES.N) ? 'visible' : ''}`}>
            <strong>Number of Letters:</strong> {wordData.number_of_letters}
          </p>

          <p className={`synonyms-entry ${revealedHints.includes(HINT_INDICES.E2) ? 'visible' : ''}`}>
            <strong>Synonyms:</strong> {wordData.equivalents || 'No synonyms available'}
          </p>
        </div>
      </div>
    );
  };

  // Update the game summary to use the same styling
  const renderGameSummary = () => {
    if (!wordData || !isGameOver) return null;

    return (
      <div className="hints-container game-summary">
        <h2 className="word-title">{wordData.word}</h2>
        <div className="summary-content">
          <p className="definition-entry visible">
            <strong>Definition:</strong> {wordData.definition}
          </p>
          <p className="etymology-entry visible">
            <strong>Etymology:</strong> {wordData.etymology || 'No etymology available'}
          </p>
          <p className="first-letter-entry visible">
            <strong>First Letter:</strong> {wordData.first_letter}
          </p>
          <p className="sentence-entry visible">
            <strong>Example:</strong> {wordData.in_a_sentence}
          </p>
          <p className="letter-count-entry visible">
            <strong>Number of Letters:</strong> {wordData.number_of_letters}
          </p>
          <p className="synonyms-entry visible">
            <strong>Synonyms:</strong> {wordData.equivalents}
          </p>
        </div>
      </div>
    );
  };

  // Update isGuessValid function
  const isGuessValid = () => {
    if (!guess.trim() || isGameOver) return false;
    
    if (revealedHints.includes(HINT_INDICES.N) && wordData?.number_of_letters) {
      return guess.length === wordData.number_of_letters;
    }
    
    return true;
  };

  // Update input placeholder
  const getInputPlaceholder = () => {
    if (revealedHints.includes(HINT_INDICES.F) && wordData?.first_letter) {
      return `${wordData.first_letter}_______`;
    }
    return "Enter your guess...";
  };

  // Update maxLength logic
  const getInputMaxLength = () => {
    if (revealedHints.includes(HINT_INDICES.N) && wordData?.number_of_letters) {
      return wordData.number_of_letters;
    }
    return undefined;
  };

  // Add console logging to debug data
  useEffect(() => {
    console.log('Game state:', {
      gameId,
      wordData,
      loading,
      error,
      isGameOver,
      revealedHints
    });
  }, [gameId, wordData, loading, error, isGameOver, revealedHints]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!wordData) return null;

  return (
    <div className="app-container">
      {showConfetti && <Confetti />}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading word data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={fetchNewWord} className="retry-button">Try Again</button>
        </div>
      ) : !wordData ? (
        <div className="loading-container">
          <p>Waiting for word data...</p>
          <button onClick={fetchNewWord} className="retry-button">Load Word</button>
        </div>
      ) : (
        <>
          <div className="timer">{formatTime(timer)}</div>
          
          <div className="define-boxes-container">
            <span className="un-prefix">Un ·</span>
            <div className="define-boxes">
              {['D', 'E', 'F', 'I', 'N', 'E'].map((letter, index) => {
                const isRevealed = revealedHints.includes(index);
                const isCorrect = guessResults[index] === 'correct';
                const isIncorrect = guessResults[index] === 'incorrect';
                
                return (
                  <div
                    key={index}
                    className={`define-box ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''} ${isRevealed ? 'hint-revealed' : ''}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          </div>
          
          {!isGameOver ? (
            <div className="game-container">
              <div className="hints-container game-summary">
                <div className="summary-content">
                  {/* All hints are always rendered, but only visible when revealed */}
                  <p className="definition-entry visible">
                    <strong>Definition:</strong> {wordData.definition}
                  </p>

                  <p className={`etymology-entry ${revealedHints.includes(HINT_INDICES.E) ? 'visible' : ''}`}>
                    <strong>Etymology:</strong> {wordData.etymology || 'No etymology available'}
                  </p>

                  <p className={`first-letter-entry ${revealedHints.includes(HINT_INDICES.F) ? 'visible' : ''}`}>
                    <strong>First Letter:</strong> {wordData.first_letter}
                  </p>

                  <p className={`sentence-entry ${revealedHints.includes(HINT_INDICES.I) ? 'visible' : ''}`}>
                    <strong>Example:</strong> {wordData.in_a_sentence?.replace(wordData.word, '_'.repeat(wordData.word.length)) || 'No example sentence available'}
                  </p>

                  <p className={`letter-count-entry ${revealedHints.includes(HINT_INDICES.N) ? 'visible' : ''}`}>
                    <strong>Number of Letters:</strong> {wordData.number_of_letters}
                  </p>

                  <p className={`synonyms-entry ${revealedHints.includes(HINT_INDICES.E2) ? 'visible' : ''}`}>
                    <strong>Synonyms:</strong> {wordData.equivalents || 'No synonyms available'}
                  </p>
                </div>

                <form onSubmit={handleGuess} className="guess-form">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guess}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={getInputPlaceholder()}
                    disabled={isGameOver}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    maxLength={getInputMaxLength()}
                  />
                  <button 
                    type="submit" 
                    disabled={!isGuessValid()}
                  >
                    Guess
                  </button>
                </form>

                <div className="remaining-guesses">
                  Remaining guesses: {remainingGuesses}
                </div>
              </div>
            </div>
          ) : (
            renderGameSummary()
          )}
          
          {showLeaderboard && <Leaderboard gameId={gameId} />}
          
          {error && <div className="error">{error}</div>}
          {message && <div className="message">{message}</div>}
        </>
      )}
    </div>
  );
}

export default App;
