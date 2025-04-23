import { Request, Response } from 'express';
import { SupabaseClient } from '../config/database/SupabaseClient.js';
import type { GameSession } from '@undefine/shared-types';

const db = SupabaseClient.getInstance();

export async function handler(req: Request, res: Response) {
  try {
    const { gameId, guess } = req.body;

    if (!gameId || !guess) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Get game session and process guess
      const session = await db.getGameSession(gameId);
      if (!session) {
        return res.status(404).json({ error: 'Game session not found' });
      }

      // Process the guess
      const result = await db.processGuess(gameId, guess, session);

      // Return result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing guess:', error);
      return res.status(500).json({ error: 'Failed to process guess' });
    }
  } catch (error) {
    console.error('Error in guess handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 