import React, { useEffect, useState, useCallback } from 'react';
import { ToastProvider, useToast } from './components/Toast.js';
import DefineHints from './components/DefineHints.js';
import { type Word, type GuessResult, type HintIndex, HINT_INDICES } from '@undefine/shared-types';
import { getRandomWord, submitGuess } from './api.js';
import DefineBoxes from './components/DefineBoxes.js';
import { HintContent } from './components/HintContent.js';
import { Settings } from './components/Settings.js';
import { Stats } from './components/Stats.js';
import { useGameState } from './hooks/useGameState.js';
import './App.css';
import GameOverModal from './components/GameOverModal.js';

interface GameState {
  wordData: Word | null;
  isGameOver: boolean;
  isCorrect: boolean;
  guessCount: number;
  revealedHints: number[];
  guessResults: ("correct" | "incorrect" | null)[];
}

// TODO: Replace with actual API call
const mockWordData: Word = {
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

  const handleHintReveal = (hintIndex: number) => {
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