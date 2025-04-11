import { useState, useEffect } from 'react'
import './App.css'
import Confetti from 'react-confetti'
import Leaderboard from './Leaderboard'
import DefineHints from './components/DefineHints'
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';
import type { WordData, GameState, GuessResult } from './types';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<string[]>(['D']); // Definition always revealed
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

  const { state: gameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const username = gameState.nickname || 'anonymous';

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
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const attemptFetch = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(getApiUrl('/api/word'));
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.gameId || !data.word) {
          throw new Error('Invalid response format from API');
        }

        setGameId(data.gameId);
        setWordData(data.word);
        setRevealedHints(['D']); // Reset to only show definition
        setGuessCount(0);
        setIsCorrect(false);
        setMessage('');
        setGuess('');
        setIsGameOver(false);
        setTimer(0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching word:', error);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          await attemptFetch();
        } else {
          setError('Failed to fetch word. Please try again later.');
          setLoading(false);
        }
      }
    };

    await attemptFetch();
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wordData || !gameId) return;
    
    try {
      const response = await fetch(getApiUrl('/api/guess'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, guess })
      });

      if (!response.ok) {
        throw new Error('Failed to submit guess');
      }

      const result = await response.json() as GuessResult;
      
      setGuessCount(prev => prev + 1);
      setGuess('');

      // Update guess results
      const newGuessResults = [...guessResults];
      newGuessResults[guessCount] = result.isCorrect ? 'correct' : 'incorrect';
      setGuessResults(newGuessResults);

      if (result.isCorrect) {
        setIsCorrect(true);
        setIsGameOver(true);
        setMessage('Congratulations! You found the word!');
        setShowConfetti(true);
        updateGameStats(true, guessCount + 1, timer);
      } else {
        // Reveal next hint based on DEFINE order
        const hintOrder = ['D', 'E', 'F', 'I', 'N', 'E2'];
        const nextHintIndex = revealedHints.length;
        if (nextHintIndex < hintOrder.length) {
          setRevealedHints(prev => [...prev, hintOrder[nextHintIndex]]);
        }

        if (guessCount + 1 >= 6) {
          setIsGameOver(true);
          setMessage(`Game Over! The word was: ${wordData.word}`);
          updateGameStats(false, 6, timer);
        }
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
      <div className="define-boxes">
        <div className="un-prefix">Un</div>
        <div className="central-dot">·</div>
        {defineLetters.map((letter, index) => {
          let boxClass = 'define-box';
          
          // For correct guesses, show all boxes as correct
          if (isCorrect) {
            boxClass += ' correct';
          } else if (index < guessCount) {
            // Add result classes for previous guesses
            boxClass += ' incorrect';
          } else if (index === guessCount && !isGameOver) {
            // Add hint-revealed class for the current letter being guessed
            boxClass += ' hint-revealed';
          }
          
          return (
            <div key={index} className={boxClass}>
              {letter}
            </div>
          );
        })}
      </div>
    );
  };

  // Hint content component
  const HintContent = () => {
    if (!wordData) return null;

    const getHintContent = (type: HintType): string => {
      switch (type) {
        case 'D':
          return wordData.definition;
        case 'E':
          return wordData.etymology || 'No etymology available';
        case 'F':
          return wordData.first_letter || 'No first letter hint';
        case 'I':
          return wordData.in_a_sentence || 'No example sentence available';
        case 'N':
          return wordData.number_of_letters ? `${wordData.number_of_letters} letters` : 'No letter count available';
        case 'E2':
          return wordData.equivalents || 'No synonyms available';
        default:
          return 'Unknown hint type';
      }
    };

    return (
      <div className="hint-content">
        {(['D', 'E', 'F', 'I', 'N', 'E2'] as HintType[]).map((type) => (
          revealedHints.includes(type) && (
            <div key={type} className="hint-item">
              <span className="hint-type">{type}</span>
              <span className="hint-text">{getHintContent(type)}</span>
            </div>
          )
        ))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!wordData) return null;

  return (
    <div className="app-container">
      {showConfetti && <Confetti 
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />}
      
      <div className="timer-container">
        <div className="timer">{formatTime(timer)}</div>
      </div>
      <div className="title-container">
        <DefineBoxes />
      </div>
      <div className="game-container">
        <form onSubmit={handleGuess} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            disabled={isGameOver}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          
          {/* Display floating guesses here, between input and submit button */}
          {guessHistory.length > 0 && (
            <div className="floating-guesses">
              {guessHistory.map((guess, index) => (
                <span 
                  key={index} 
                  className={`floating-guess ${guess.isCorrect ? 'correct' : (guess.isFuzzy ? 'fuzzy' : 'incorrect')}`}
                >
                  {guess.word}
                  {guess.isCorrect && <span className="guess-emoji">✓</span>}
                </span>
              ))}
            </div>
          )}
          
          {/* Display remaining guesses counter */}
          <div className="remaining-guesses">
            {!isGameOver && (
              <span>Guesses remaining: <strong>{remainingGuesses}</strong></span>
            )}
            {isGameOver && !isCorrect && (
              <span className="game-over-message">Game Over! The word was: <strong>{wordData.word}</strong></span>
            )}
            {isGameOver && isCorrect && (
              <span className="success-message">Correct! Well done!</span>
            )}
          </div>
          
          <button type="submit" disabled={isGameOver || !guess.trim()}>
            Submit Guess
          </button>
        </form>

        {isGameOver && (
          <button onClick={handleNextWord} className="next-word-btn">
            Next Word
          </button>
        )}
      </div>

      {/* Hint content below the input */}
      <div className="hints-container">
        <HintContent />
      </div>

      {/* Leaderboard component */}
      {showLeaderboard && (
        <Leaderboard
          time={timer}
          guessCount={6 - remainingGuesses}
          fuzzyCount={fuzzyCount}
          hintCount={6 - remainingGuesses}
          word={wordData.word}
          guessResults={guessResults}
          fuzzyMatchPositions={fuzzyMatchPositions}
          hints={{
            D: true,
            E: false,
            F: false,
            I: false,
            N: false,
            E2: false
          }}
          onClose={() => setShowLeaderboard(false)}
          username={username}
        />
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Reverse Define Game</p>
        </div>
      </footer>
    </div>
  )
}

export default App
