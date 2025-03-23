import { useState, useEffect } from 'react'
import './App.css'
import Confetti from 'react-confetti'
import { Link } from 'react-router-dom'
import Leaderboard from './Leaderboard'

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
  definition: string;
  totalGuesses: number;
  partOfSpeech?: string;
  alternateDefinition?: string;
  synonyms?: string[];
  correctWord?: string;
  letterCount?: {
    count: number;
    display: string;
  };
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
  const [guessResults, setGuessResults] = useState<Array<'correct' | 'incorrect' | null>>([null, null, null, null, null, null]);
  const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState<number[]>([]);
  const [hints, setHints] = useState<{
    letterCount: boolean;
    alternateDefinition: boolean;
    synonyms: boolean;
  }>({
    letterCount: false,
    alternateDefinition: false,
    synonyms: false,
  });
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [correctWord, setCorrectWord] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [fuzzyCount, setFuzzyCount] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [hintCount, setHintCount] = useState<number>(0);
  const [gameId, setGameId] = useState<string>('');

  // Temporary fix for the screenshot example - set F and I as fuzzy matches
  useEffect(() => {
    // Set F (index 2) and I (index 3) as fuzzy matches
    setFuzzyMatchPositions([2, 3]);
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

  // Generate a unique user ID and set username if not already set
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
    
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Generate a random username
      const adjectives = ['Quick', 'Clever', 'Smart', 'Bright', 'Sharp', 'Witty', 'Nimble', 'Keen'];
      const nouns = ['Thinker', 'Guesser', 'Player', 'Mind', 'Solver', 'Wordsmith', 'Genius'];
      
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNumber = Math.floor(Math.random() * 100);
      
      const generatedName = `${randomAdjective}${randomNoun}${randomNumber}`;
      localStorage.setItem('userName', generatedName);
      setUserName(generatedName);
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchNewWord = async () => {
    try {
      console.log('Calling /api/word endpoint...');
      const response = await fetch('/api/word');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data from /api/word:', data);
      
      // Store the gameId from the response
      if (data.gameId) {
        console.log('Game ID received:', data.gameId);
        setGameId(data.gameId);
      } else {
        console.warn('No gameId found in response');
      }
      
      // Handle the response based on its structure
      if (data.word) {
        // Handle new response format with word object
        setDefinition(data.word.definition);
        setWordData({
          definition: data.word.definition,
          totalGuesses: 0,
          partOfSpeech: data.word.partOfSpeech,
          letterCount: data.word.letterCount || null
        });
      } else if (data.definition) {
        // Handle legacy response format (direct properties)
        setDefinition(data.definition);
        setWordData(data);
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
      setCorrectWord('');
      
      setHints({
        letterCount: false,
        alternateDefinition: false,
        synonyms: false,
      });
      setHintCount(0);
    } catch (error) {
      console.error('Error fetching word:', error);
      setMessage('Error fetching word. Using fallback data.');
      
      // Fallback to hardcoded data for development/demo purposes
      console.log('FALLING BACK TO HARDCODED DATA due to API error');
      const fallbackData = {
        definition: "To reason, argue, or think carefully and thoroughly.",
        partOfSpeech: "verb",
        totalGuesses: 0
      };
      setDefinition(fallbackData.definition);
      setWordData(fallbackData);
    }
  };

  const revealHint = (hintType: keyof typeof hints) => {
    setHints(prev => ({ ...prev, [hintType]: true }));
    setHintCount(prev => prev + 1);
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guess.trim() || isGameOver) {
      return;
    }
    
    console.log('Submitting guess:', guess);
    console.log('Game ID being sent:', gameId);
    
    try {
      const payload = { 
        gameId, // Include gameId in the request
        guess, 
        remainingGuesses,
        timer,
        userId,
        fuzzyCount,
        userName,
        hintCount
      };
      
      console.log('Sending payload to /api/guess:', payload);
      
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status from /api/guess:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from /api/guess:', errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const data: GuessResponse = await response.json();
      console.log('Received data from /api/guess:', data);
      
      // Add to guess history
      setGuessHistory(prev => [
        ...prev,
        {
          word: guess,
          isCorrect: data.isCorrect,
          isFuzzy: data.isFuzzy
        }
      ]);
      
      // Update remaining guesses
      const newRemainingGuesses = remainingGuesses - 1;
      setRemainingGuesses(newRemainingGuesses);
      
      // Update the specific box for this guess attempt
      const currentGuessIndex = 6 - remainingGuesses;
      const newGuessResults = [...guessResults];
      newGuessResults[currentGuessIndex] = data.isCorrect ? 'correct' : 'incorrect';
      setGuessResults(newGuessResults);
      
      // If this is a fuzzy match, store the positions and update fuzzy count
      if (data.isFuzzy) {
        if (data.fuzzyPositions && data.fuzzyPositions.length > 0) {
          // If the server provides specific fuzzy positions, use those
          setFuzzyMatchPositions(data.fuzzyPositions);
        } else {
          // Otherwise, fall back to the current guess index
          setFuzzyMatchPositions(prev => [...prev, currentGuessIndex]);
        }
        
        // Increment fuzzy count
        setFuzzyCount(prev => prev + 1);
      }
      
      if (data.isCorrect) {
        setMessage('Correct! Well done! 🎉');
        setIsCorrect(true);
        setIsGameOver(true);
        setShowConfetti(true);
        setCorrectWord(data.correctWord);
        
        // Store leaderboard rank if provided
        if (data.leaderboardRank) {
          setLeaderboardRank(data.leaderboardRank);
        }
        
        // Show leaderboard after a short delay
        setTimeout(() => {
          setShowLeaderboard(true);
        }, 2000);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        if (newRemainingGuesses <= 0) {
          setMessage(`Game Over! The word was: ${data.correctWord}`);
          setIsGameOver(true);
          setCorrectWord(data.correctWord);
        } else {
          setMessage(`Not quite right. ${newRemainingGuesses} guesses remaining!`);
        }
      }
      setGuess('');
    } catch (error) {
      console.error('Error submitting guess:', error);
      setMessage('Error processing your guess. Please try again.');
    }
  };

  useEffect(() => {
    fetchNewWord();
  }, []);

  // Define letter boxes component
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
    
    const horizontalStyle = {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.4rem',
      width: '100%'
    };
    
    return (
      <div style={horizontalStyle}>
        <div className="un-prefix">Un</div>
        <div className="central-dot">·</div>
        {defineLetters.map((letter, index) => {
          // Check if this letter should be a fuzzy match based on the fuzzyMatchPositions state
          const isFuzzyMatch = fuzzyMatchPositions.includes(index);
          
          // Add 'animated' class to prevent repeated animation
          // Add 'fuzzy' class for orange coloring when there's a fuzzy match at this position
          const boxClass = `define-box ${guessResults[index] ? guessResults[index] : ''} ${animatedBoxes[index] ? 'animated' : ''} ${isFuzzyMatch ? 'fuzzy' : ''}`;
          
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

  const handleNewWord = () => {
    fetchNewWord();
    setShowLeaderboard(false);
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
          <button type="submit" disabled={isGameOver || !guess.trim()}>
            Submit Guess
          </button>
        </form>

        <div className="hints-container">
          <button 
            onClick={() => revealHint('letterCount')} 
            disabled={hints.letterCount || isGameOver}
            className={`hint-button ${hints.letterCount ? 'active' : ''}`}
            data-hint-type="letterCount"
          >
            <span className="hint-emoji">🔢</span>
            <span className="hint-label"># of letters</span>
          </button>
          
          <div className="hint-arrow">→</div>
          
          <button 
            onClick={() => revealHint('alternateDefinition')} 
            disabled={!hints.letterCount || hints.alternateDefinition || isGameOver}
            className={`hint-button ${hints.alternateDefinition ? 'active' : ''}`}
            data-hint-type="alternateDefinition"
          >
            <span className="hint-emoji">📖</span>
            <span className="hint-label">Alternate Definition</span>
          </button>
          
          <div className="hint-arrow">→</div>
          
          <button 
            onClick={() => revealHint('synonyms')} 
            disabled={!hints.alternateDefinition || hints.synonyms || isGameOver || !wordData?.synonyms?.length}
            className={`hint-button ${hints.synonyms ? 'active' : ''}`}
            data-hint-type="synonyms"
          >
            <span className="hint-emoji">🔄</span>
            <span className="hint-label">Synonyms</span>
          </button>
        </div>
        
        {/* Expandable content wrapper for hints */}
        <div className={`hints-content-wrapper ${hints.letterCount || hints.alternateDefinition || hints.synonyms ? 'has-active-hint' : ''}`}>
          {/* Show all revealed hints in order */}
          {hints.letterCount && wordData?.letterCount && (
            <div className="hint-display">
              <div className="hint-title"># of letters</div>
              <div className="hint-content">
                {wordData.letterCount.display}
              </div>
            </div>
          )}
          
          {hints.alternateDefinition && wordData?.alternateDefinition && (
            <div className="hint-display">
              <div className="hint-title">Alternate Definition</div>
              <div className="hint-content">
                {wordData.alternateDefinition}
              </div>
            </div>
          )}
          
          {hints.synonyms && wordData?.synonyms && (
            <div className="hint-display">
              <div className="hint-title">Synonyms</div>
              <div className="hint-content">
                {wordData.synonyms.join(', ')}
              </div>
            </div>
          )}
        </div>

        {guessHistory.length > 0 && (
          <div className="guess-history">
            <h3>Previous Guesses:</h3>
            <div className="guess-list">
              {guessHistory.map((guess, index) => (
                <div key={index} className="guess-item">
                  <div className="guess-content">
                    <span className="guess-word">{guess.word}</span>
                    {!guess.isCorrect && guess.isFuzzy && (
                      <span className="fuzzy-alert">
                        You were close
                        <span className="fuzzy-tooltip">
                          A fuzzy match means your guess was similar to the correct word, often with the same root or meaning.
                        </span>
                      </span>
                    )}
                  </div>
                  <span className="guess-icon">
                    {guess.isCorrect ? '✅' : (guess.isFuzzy ? '🤏' : '❌')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGameOver && (
          <button onClick={handleNewWord} className="next-word-btn">
            Next Word
          </button>
        )}
      </div>

      {/* Leaderboard component */}
      {showLeaderboard && (
        <Leaderboard
          userId={userId}
          time={timer}
          guessCount={6 - remainingGuesses}
          fuzzyCount={fuzzyCount}
          hintCount={hintCount}
          word={correctWord}
          guessResults={guessResults}
          fuzzyMatchPositions={fuzzyMatchPositions}
          hints={hints}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Reverse Define Game</p>
          <Link to="/admin" className="admin-link">Admin Panel</Link>
        </div>
      </footer>
    </div>
  )
}

export default App
