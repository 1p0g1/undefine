import { useState, useEffect } from 'react'
import './App.css'

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
}

function App() {
  const [definition, setDefinition] = useState<string>('');
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState<number>(5);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
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
      setRemainingGuesses(5);
      setIsGameOver(false);
      setTimer(0);
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
      
      if (data.isCorrect) {
        setMessage('Correct! Well done! 🎉');
        setIsCorrect(true);
        setIsGameOver(true);
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

  return (
    <div className="app-container">
      <div className="title-container">
        <span className="book-icon">📚</span>
        <h1>Daily Define</h1>
      </div>
      <div className="game-container">
        <div className="timer">{formatTime(timer)}</div>
        <div className="guesses-remaining">
          {remainingGuesses} Guesses Left
        </div>

        <form onSubmit={handleGuess} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            disabled={isGameOver}
            autoComplete="off"
          />
          <button type="submit" disabled={isGameOver || !guess.trim()}>
            Submit Guess
          </button>
        </form>

        <div className="definition-box">
          <h2>Definition:</h2>
          <p>{definition}</p>
        </div>

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
            <div className="hint-content">
              <strong>Part of Speech:</strong> {wordData.partOfSpeech}
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
            <div className="hint-content">
              <strong>Alternate Definition:</strong> {wordData.alternateDefinition}
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
            <div className="hint-content">
              <strong>Synonyms:</strong> {wordData.synonyms.join(', ')}
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {message}
          </div>
        )}

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
                        Fuzzy alert! 🚨 You were close 🤏
                      </span>
                    )}
                  </div>
                  <span className="guess-icon">
                    {guess.isCorrect ? '✅' : '❌'}
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
