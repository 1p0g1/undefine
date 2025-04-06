import { useState, useEffect } from 'react'
import './App.css'
import Confetti from 'react-confetti'
import Leaderboard from './Leaderboard'
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';

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

interface WordData {
  wordId: string;
  word: string;
  definition: string;
  etymology?: string;
  firstLetter?: string;
  isPlural?: boolean;
  numSyllables?: number;
  exampleSentence?: string;
  partOfSpeech: string;
}

// Add this type at the top with other type definitions
type GuessResult = 'correct' | 'incorrect' | null;

// Define the hint types that correspond to DEFINE
type HintType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

// Update the Hint interface to track revealed hints
interface Hint {
  D: boolean;  // Definition (always revealed)
  E: boolean;  // Etymology
  F: boolean;  // First Letter
  I: boolean;  // Is Plural
  N: boolean;  // Number of Syllables
  E2: boolean; // Example Sentence
}

function App() {
  const [definition, setDefinition] = useState<string>('');
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState<number>(6);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([null, null, null, null, null, null]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [correctWord, setCorrectWord] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [fuzzyCount, setFuzzyCount] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { state: gameState, updateGameStats, hasPlayedToday } = useLocalGameState();
  const username = gameState.nickname || 'anonymous';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  useEffect(() => {
    console.log('App component mounted - initializing game...');
    
    if (hasPlayedToday()) {
      console.log('Game already played today, showing results...');
      // Show today's results
      setMessage('You have already played today. Come back tomorrow for a new word!');
      setIsGameOver(true);
      setShowLeaderboard(true);
      return;
    }
    
    if (!definition) {
      console.log('No definition found - fetching new word...');
      fetchNewWord();
    } else {
      console.log('Definition already exists, skipping initial fetch');
    }
  }, []);

  const fetchNewWord = async () => {
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const attemptFetch = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching new word from API...');
        const apiUrl = getApiUrl('/api/word');
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log('Word API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Word data received:', {
          gameId: data.gameId,
          wordId: data.word?.wordId || data.wordId,
          word: data.word?.word || data.word,
          definition: data.word?.definition || data.definition,
          etymology: data.word?.etymology,
          firstLetter: data.word?.firstLetter,
          isPlural: data.word?.isPlural,
          numSyllables: data.word?.numSyllables,
          exampleSentence: data.word?.exampleSentence,
          partOfSpeech: data.word?.partOfSpeech || data.partOfSpeech,
        });

        // Store the gameId from the response
        if (data.gameId) {
          console.log('Game ID received:', data.gameId);
          setGameId(data.gameId);
        } else {
          console.warn('No gameId found in response');
          setMessage('Warning: No game ID received. Guesses may not work correctly.');
        }
        
        // Handle the response based on its structure
        if (data.word) {
          // Handle new response format with word object
          setDefinition(data.word.definition);
          setWordData(data.word);
          setCorrectWord(data.word.word?.toLowerCase() || '');
        } else if (data.definition) {
          // Handle legacy response format (direct properties)
          setDefinition(data.definition);
          setWordData(data);
          setCorrectWord(data.word?.toLowerCase() || '');
        } else {
          console.error('Unexpected response structure:', data);
          throw new Error('Unexpected response format from API');
        }
        
        // Reset game state
        setIsCorrect(false);
        setMessage('');
        setGuess('');
        setGuessHistory([]);
        setRemainingGuesses(6);
        setIsGameOver(false);
        setTimer(0);
        setGuessResults([null, null, null, null, null, null]);
        setFuzzyMatchPositions([]);
      } catch (error) {
        console.error('Error fetching word:', error);
        
        // If we have retries left, try again
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retry attempt ${retryCount}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return attemptFetch();
        }
        
        setMessage(`Error fetching word (after ${MAX_RETRIES} attempts). Using fallback data.`);
        
        // Fallback to hardcoded data for development/demo purposes
        console.log('FALLING BACK TO HARDCODED DATA due to API error');
        const fallbackData: WordData = {
          wordId: '123',
          word: 'cogitate',
          definition: "To reason, argue, or think carefully and thoroughly.",
          partOfSpeech: "verb",
          etymology: "From Latin cogitare, to think, consider, or deliberate.",
          firstLetter: "c",
          isPlural: false,
          numSyllables: 3,
          exampleSentence: "He cogitated on the problem for hours."
        };
        
        // Generate a fallback gameId so the game still works
        const fallbackGameId = `fallback-game-${Date.now()}`;
        setGameId(fallbackGameId);
        
        setDefinition(fallbackData.definition);
        setWordData(fallbackData);
        setCorrectWord(fallbackData.word.toLowerCase());
      } finally {
        setLoading(false);
      }
    };
    
    return attemptFetch();
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGameOver || isCorrect || !guess.trim() || loading) {
      return;
    }
    
    try {
      console.log('Submitting guess:', guess);
      
      if (!gameId) {
        setMessage('No active game. Please refresh to start a new game.');
        return;
      }
      
      const newRemainingGuesses = remainingGuesses - 1;
      const currentGuessIndex = 5 - remainingGuesses;
      
      const newGuessResults = [...guessResults];
      const newHistory = [...guessHistory];
      newHistory.push({
        word: guess,
        isCorrect: false,
        isFuzzy: false
      });
      setGuessHistory(newHistory);
      
      const payload = {
        gameId,
        guess,
        remainingGuesses,
        timer,
        fuzzyCount: fuzzyMatchPositions.length,
        username,
        hintCount: currentGuessIndex + 1
      };
      
      const submittedGuess = guess.trim();
      setGuess('');
      
      const response = await fetch(getApiUrl('/api/guess'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${errorData.error || ''}`);
      }
      
      const data = await response.json();
      
      setRemainingGuesses(newRemainingGuesses);
      
      if (data.isFuzzy && data.fuzzyPositions && data.fuzzyPositions.length) {
        setFuzzyMatchPositions(data.fuzzyPositions);
      }
      
      if (data.isCorrect) {
        for (let i = 0; i <= 5; i++) {
          newGuessResults[i] = 'correct';
        }
        
        if (newHistory.length > 0) {
          const lastIndex = newHistory.length - 1;
          newHistory[lastIndex].isCorrect = true;
        }
        setGuessHistory(newHistory);
        
        setMessage('Correct! Well done! 🎉');
        setIsCorrect(true);
        setIsGameOver(true);
        setShowConfetti(true);
        setCorrectWord(data.correctWord);
        setFuzzyMatchPositions([]);
        
        if (data.leaderboardRank) {
          setLeaderboardRank(data.leaderboardRank);
        }
        
        // Update local game stats
        updateGameStats(true, 6 - newRemainingGuesses, timer);
        
        setTimeout(() => {
          setShowLeaderboard(true);
        }, 2000);
        
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        newGuessResults[currentGuessIndex] = 'incorrect';
        
        if (newRemainingGuesses <= 0) {
          setMessage(`Game Over! The word was: ${data.correctWord}`);
          setIsGameOver(true);
          setCorrectWord(data.correctWord);
          
          // Update local game stats for loss
          updateGameStats(false, 6, timer);
        } else {
          setMessage(`Not quite right. ${newRemainingGuesses} guesses remaining!`);
        }
      }
      
      setGuessResults(newGuessResults);
    } catch (error) {
      console.error('Error submitting guess:', error);
      setMessage('Error submitting guess. Please try again.');
    }
  };

  // Modify the DefineBoxes component to handle automatic hint revelation
  const DefineBoxes = () => {
    const defineLetters = ['D', 'E', 'F', 'I', 'N', 'E'];
    const [animatedBoxes, setAnimatedBoxes] = useState<boolean[]>([false, false, false, false, false, false]);
    
    useEffect(() => {
      // When guessResults changes, mark the corresponding box as animated
      const newAnimatedBoxes = [...animatedBoxes];
      guessResults.forEach((result, index) => {
        if (result === 'incorrect' && !newAnimatedBoxes[index]) {
          newAnimatedBoxes[index] = true;
        }
      });
      setAnimatedBoxes(newAnimatedBoxes);
    }, [guessResults]);

    // Calculate current guess index (0-5) based on remaining guesses (6-1)
    const currentGuessIndex = 6 - remainingGuesses;
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row' as const,
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.4rem',
        width: '100%'
      }}>
        <div className="un-prefix">Un</div>
        <div className="central-dot">·</div>
        {defineLetters.map((letter, index) => {
          // For correct guesses, show all boxes as correct
          if (isCorrect) {
            return (
              <div 
                key={index} 
                className="define-box correct"
              >
                {letter}
              </div>
            );
          }
          
          let boxClass = 'define-box';
          
          // Add hint-revealed class for the current letter being guessed
          if (index === currentGuessIndex && !isGameOver) {
            boxClass += ' hint-revealed';
          }
          
          // Add result classes for previous guesses
          if (index < currentGuessIndex || isGameOver) {
            if (guessResults[index] === 'correct') {
              boxClass += ' correct';
            } else if (guessResults[index] === 'incorrect') {
              boxClass += ' incorrect';
            }
          }
          
          // Add fuzzy match styling if applicable
          if (fuzzyMatchPositions.includes(index)) {
            boxClass += ' fuzzy';
          }
          
          // Add animation class
          if (animatedBoxes[index]) {
            boxClass += ' animated';
          }
          
          return (
            <div 
              key={index} 
              className={boxClass}
            >
              {letter}
            </div>
          );
        })}
      </div>
    );
  };

  // Component to display the correct word when game is over
  const GameOverMessage = () => {
    if (!isGameOver || isCorrect) return null;
    
    return (
      <div className="game-over-message">
        <p><em className="game-over-label">The word of the day was: </em> <span className="correct-word">{correctWord}</span></p>
      </div>
    );
  };

  const handleNextWord = () => {
    setGuess('');
    setGuessHistory([]);
    setGuessResults([null, null, null, null, null, null]);
    setFuzzyMatchPositions([]);
    
    fetchNewWord();
    setIsGameOver(false);
  };

  return (
    <div className="app-container">
      {showConfetti && <Confetti 
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />}
      
      {/* Add a loading indicator and error message */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading word data...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <h3>Error Loading Game</h3>
          <p>{error}</p>
          <button onClick={() => {
            setError('');
            fetchNewWord();
          }}>
            Retry
          </button>
          <p className="debug-info">
            <small>API URL: {window.API_BASE_URL || 'http://localhost:3001'}</small>
            <br />
            <small>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                if (window.testApiConnection) {
                  window.testApiConnection();
                } else {
                  console.log('Test function not available');
                }
              }}>
                Run API Connection Test
              </a>
            </small>
          </p>
        </div>
      )}
      
      <div className="timer-container">
        <div className="timer">{formatTime(timer)}</div>
      </div>
      <div className="title-container">
        <DefineBoxes />
      </div>
      <div className="definition-box">
        <p>{definition}</p>
        {isGameOver && !isCorrect && <GameOverMessage />}
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
              <span className="game-over-message">Game Over! The word was: <strong>{correctWord}</strong></span>
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

      {/* Leaderboard component */}
      {showLeaderboard && (
        <Leaderboard
          time={timer}
          guessCount={6 - remainingGuesses}
          fuzzyCount={fuzzyCount}
          hintCount={6 - remainingGuesses}
          word={correctWord}
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
