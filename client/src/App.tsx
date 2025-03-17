import { useState, useEffect } from 'react'
import './App.css'
import Confetti from 'react-confetti'

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
}

interface WordData {
  definition: string;
  totalGuesses: number;
  partOfSpeech?: string;
  alternateDefinition?: string;
  synonyms?: string[];
  correctWord?: string;
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
  const [fuzzyMatchPosition, setFuzzyMatchPosition] = useState<number | null>(null);
  const [hints, setHints] = useState<{
    partOfSpeech: boolean;
    alternateDefinition: boolean;
    synonyms: boolean;
  }>({
    partOfSpeech: false,
    alternateDefinition: false,
    synonyms: false,
  });
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [correctWord, setCorrectWord] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchNewWord = async () => {
    try {
      const response = await fetch('/api/word');
      const data: WordData = await response.json();
      setDefinition(data.definition);
      setWordData(data);
      setIsCorrect(false);
      setMessage('');
      setGuess('');
      setGuessHistory([]);
      setRemainingGuesses(6);
      setIsGameOver(false);
      setTimer(0);
      setGuessResults([null, null, null, null, null, null]);
      setFuzzyMatchPosition(null);
      setCorrectWord('');
      
      setHints({
        partOfSpeech: false,
        alternateDefinition: false,
        synonyms: false,
      });
    } catch (error) {
      console.error('Error fetching word:', error);
      setMessage('Error fetching word. Please try again.');
    }
  };

  const revealHint = (hintType: keyof typeof hints) => {
    setHints(prev => ({ ...prev, [hintType]: true }));
    // Optionally: deduct points or add time penalty here
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isGameOver) return;

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          guess: guess.trim(),
          remainingGuesses: remainingGuesses 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GuessResponse = await response.json();
      
      // Store the correct word when we receive it
      setCorrectWord(data.correctWord);
      
      // Debug logging
      console.log('Guess response:', {
        data,
        remainingGuesses
      });
      
      const newRemainingGuesses = remainingGuesses - 1;
      setRemainingGuesses(newRemainingGuesses);
      
      // Add to guess history
      setGuessHistory(prev => [...prev, { 
        word: guess.trim(), 
        isCorrect: data.isCorrect,
        isFuzzy: data.isFuzzy
      }]);
      
      // Update the specific box for this guess attempt
      const currentGuessIndex = 6 - remainingGuesses;
      const newGuessResults = [...guessResults];
      newGuessResults[currentGuessIndex] = data.isCorrect ? 'correct' : 'incorrect';
      setGuessResults(newGuessResults);
      
      // If this is a fuzzy match, store the current position
      if (data.isFuzzy) {
        setFuzzyMatchPosition(currentGuessIndex);
      }
      
      if (data.isCorrect) {
        setMessage('Correct! Well done! 🎉');
        setIsCorrect(true);
        setIsGameOver(true);
        setShowConfetti(true);
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        if (newRemainingGuesses <= 0) {
          setMessage(`Game Over! The word was: ${data.correctWord}`);
          setIsGameOver(true);
        } else {
          setMessage(`Not quite right. ${newRemainingGuesses} guesses remaining!`);
        }
      }
      setGuess('');
    } catch (error) {
      console.error('Error submitting guess:', error);
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
        <div className="un-prefix">UN</div>
        <div className="central-dot">·</div>
        {defineLetters.map((letter, index) => {
          // Check if this specific position had a fuzzy match, regardless of whether it's now correct or incorrect
          const isFuzzyMatch = index === fuzzyMatchPosition;
          
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
            onClick={() => revealHint('partOfSpeech')} 
            disabled={hints.partOfSpeech || isGameOver}
            className="hint-button"
            data-hint-type="partOfSpeech"
          >
            Reveal Part of Speech
          </button>
          {hints.partOfSpeech && wordData?.partOfSpeech && (
            <div className="hint-display">
              <div className="hint-title">Part of Speech</div>
              <div className="hint-content">
                {wordData.partOfSpeech}
              </div>
            </div>
          )}

          <button 
            onClick={() => revealHint('alternateDefinition')} 
            disabled={!hints.partOfSpeech || hints.alternateDefinition || isGameOver}
            className="hint-button"
            data-hint-type="alternateDefinition"
          >
            Reveal Alternate Definition
          </button>
          {hints.alternateDefinition && wordData?.alternateDefinition && (
            <div className="hint-display">
              <div className="hint-title">Alternate Definition</div>
              <div className="hint-content">
                {wordData.alternateDefinition}
              </div>
            </div>
          )}

          <button 
            onClick={() => revealHint('synonyms')} 
            disabled={!hints.alternateDefinition || hints.synonyms || isGameOver || !wordData?.synonyms?.length}
            className="hint-button"
            data-hint-type="synonyms"
          >
            Reveal Synonyms
          </button>
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
          <button onClick={fetchNewWord} className="next-word-btn">
            Next Word
          </button>
        )}
      </div>
    </div>
  )
}

export default App
