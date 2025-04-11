export interface WordData {
  id: string;
  word: string;
  definition: string;
  etymology: string | null;
  first_letter: string | null;
  in_a_sentence: string | null;
  number_of_letters: number | null;
  equivalents: string | null;
  difficulty: string | null;
}

export interface GameState {
  gameId: string;
  word: WordData;
  revealedHints: string[];
  guessCount: number;
  isComplete: boolean;
  isWon: boolean;
}

export interface GuessResult {
  isCorrect: boolean;
  gameOver: boolean;
  updatedSession: GameState;
} 