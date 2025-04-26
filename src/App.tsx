import React, { useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast.js';
import DefineHints from './components/DefineHints.js';
import DefineBoxes from './components/DefineBoxes.js';
import GameOverModal from './components/GameOverModal.js';
import { useGameState } from '../client/src/hooks/useGameState.js';
import { WordData, HintIndex } from './types/game.js';
import './App.css';

// TODO: Replace with actual API call
const mockWordData: WordData = {
  id: '1',
  word: 'example',
  clues: {
    D: 'A representative form or pattern',
    E: 'From Latin exemplum',
    F: 'e',
    I: 'This is an example sentence.',
    N: 7,
    E2: ['instance', 'sample', 'specimen']
  }
};

function Game() {
  const toast = useToast();
  const { state, startNewGame, revealHint, submitGuess, resetGame } = useGameState();

  useEffect(() => {
    // TODO: Replace with actual API call
    startNewGame(mockWordData);
  }, [startNewGame]);

  const handleHintReveal = (hintIndex: HintIndex) => {
    revealHint(hintIndex);
    toast.info('Hint revealed!');
  };

  const handleGuessSubmit = (guess: string) => {
    submitGuess(guess);
    if (state.hasWon) {
      toast.success('Congratulations! You got it!');
    } else if (state.isGameOver) {
      toast.error('Game Over! Better luck next time.');
    }
  };

  const handleNewGame = () => {
    resetGame();
    // TODO: Replace with actual API call
    startNewGame(mockWordData);
  };

  if (state.isLoading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!state.wordData) {
    return <div className="error">Error loading word data</div>;
  }

  return (
    <div className="game-container">
      <DefineBoxes
        revealedHints={state.revealedHints}
        onHintReveal={handleHintReveal}
        isGameOver={state.isGameOver}
        hasWon={state.hasWon}
        guessResults={state.guessResults}
      />
      
      <DefineHints
        word={state.wordData}
        revealedHints={state.revealedHints}
        guessCount={state.guessCount}
      />

      <GameOverModal
        isOpen={state.isGameOver}
        wordData={state.wordData}
        isCorrect={state.hasWon}
        onClose={handleNewGame}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Game />
    </ToastProvider>
  );
}

export default App; 