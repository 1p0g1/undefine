import { Router } from 'express';
import { getDb } from '../config/database/db.js';
import type { Word, ClueType } from '@undefine/shared-types';
import { unwrapResult, isError } from '@undefine/shared-types';

const router = Router();

// Hint types mapped to their corresponding word fields
const HINT_TYPES: Record<string, keyof Word> = {
  'first-letter': 'first_letter',
  'in-a-sentence': 'in_a_sentence',
  'num-letters': 'number_of_letters',
  'equivalents': 'equivalents'
};

// GET /api/hint/:gameId/:hintType
router.get('/:gameId/:hintType', async (req, res) => {
  const { gameId, hintType } = req.params;
  
  try {
    // Get the current game session
    const gameResult = await getDb().getGameSession(gameId);
    if (isError(gameResult)) {
      return res.status(404).json({ error: gameResult.error.message || 'Game not found' });
    }
    const game = gameResult.data;
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if the requested hint type is valid
    if (!HINT_TYPES[hintType]) {
      return res.status(400).json({ error: 'Invalid hint type' });
    }
    
    // Check if the user has already requested this hint
    const hintField = HINT_TYPES[hintType];
    
    // Since there's no getWord method, we can use the getClue method
    const clueType = hintType === 'first-letter' ? 'F' :
                    hintType === 'in-a-sentence' ? 'I' :
                    hintType === 'num-letters' ? 'N' :
                    hintType === 'equivalents' ? 'E2' : 'D' as ClueType;
    
    const clueResult = await getDb().getClue(game, clueType);
    if (isError(clueResult)) {
      return res.status(500).json({ error: clueResult.error.message || 'Failed to get hint' });
    }
    const hint = clueResult.data;
    
    // Return the hint
    return res.json({ 
      hint,
      hintType
    });
  } catch (error) {
    console.error('Error getting hint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get hint' });
  }
});

export default router; 