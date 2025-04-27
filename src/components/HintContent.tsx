import { getSynonyms, isWordData, type Word, type HintIndex, HINT_INDICES } from '@undefine/shared-types';

export interface HintContentProps {
  wordData: Word;
  revealedHints: number[];
  onHintReveal: (hintIndex: HintIndex) => void;
  isGameOver: boolean;
  hasWon: boolean;
  guessResults: ("correct" | "incorrect" | null)[];
} 