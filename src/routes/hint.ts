import { Router } from 'express';
import { db } from '../config/database/db.js';
import type { Word } from '../config/database/types.js';

const router = Router();

// Define the DEFINE sequence
const DEFINE_SEQUENCE = [
  { letter: 'D', type: 'definition', getter: (word: Word) => word.definition },
  { letter: 'E', type: 'etymology', getter: (word: Word) => word.etymology || 'No etymology available' },
  { letter: 'F', type: 'firstLetter', getter: (word: Word) => `The word starts with "${word.firstLetter}"` },
  { letter: 'I', type: 'sentence', getter: (word: Word) => word.exampleSentence || 'No example sentence available' },
  { letter: 'N', type: 'length', getter: (word: Word) => `The word has ${word.numLetters} letters` },
  { letter: 'E', type: 'equivalents', getter: (word: Word) => word.synonyms?.join(', ') || 'No synonyms available' }
] as const;

type HintType = typeof DEFINE_SEQUENCE[number]['type'];

interface HintResponse {
  clueType: HintType;
  clueText: string;
  revealedHints: string[];
}

router.get('/:gameId', async (req, res) => {
  const { gameId } = req.params;
  
  // Get the active game from the server's game store
  const game = (req.app.locals.activeGames || new Map()).get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Check if game is over
  if (game.guessCount >= 6) {
    return res.status(400).json({ error: 'Game over' });
  }

  // Get the word details from the database
  const word = await db.getWord(game.wordId);
  if (!word) {
    return res.status(404).json({ error: 'Word not found' });
  }

  // Initialize revealed hints if not exists
  game.revealedHints = game.revealedHints || new Set<string>();

  // Determine which hint to show based on incorrect guesses
  const hintIndex = Math.min(game.guessCount, DEFINE_SEQUENCE.length - 1);
  const currentHint = DEFINE_SEQUENCE[hintIndex];

  // Track hint usage
  game.hintsUsed = (game.hintsUsed || 0) + 1;
  game.revealedHints.add(currentHint.letter);

  const response: HintResponse = {
    clueType: currentHint.type,
    clueText: currentHint.getter(word),
    revealedHints: Array.from(game.revealedHints)
  };

  res.json(response);
});

export default router; 