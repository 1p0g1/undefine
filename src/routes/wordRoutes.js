import { Router } from 'express';
import { getDb } from '../config/database/db.js';
import { unwrapResult, isError } from '@undefine/shared-types';

const router = Router();

router.get('/word', async (req, res) => {
    try {
        console.log('Attempting to get a word...');
        const wordResult = await getDb().getDailyWord();
        const word = unwrapResult(wordResult);
        
        console.log('Word found:', { id: word.id, word: word.word });
        const sessionResult = await getDb().startGame();
        const gameSession = unwrapResult(sessionResult);
        
        res.json({
            gameId: gameSession.id,
            word: {
                id: word.id,
                word: word.word,
                definition: word.definition,
                clues: {
                    D: word.definition,
                    E: word.etymology || 'No etymology available',
                    F: word.first_letter || '',
                    I: word.in_a_sentence || 'No example sentence available',
                    N: word.number_of_letters || 0,
                    E2: word.equivalents || []
                }
            }
        });
    }
    catch (error) {
        console.error('Error getting word:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get word' });
    }
});

router.post('/guess', async (req, res) => {
    try {
        const { gameId, guess } = req.body;
        if (!gameId || !guess) {
            return res.status(400).json({ error: 'Missing gameId or guess' });
        }
        
        const sessionResult = await getDb().getGameSession(gameId);
        if (isError(sessionResult)) {
            return res.status(404).json({ error: sessionResult.error.message });
        }
        const session = sessionResult.data;
        
        const result = await getDb().processGuess(gameId, guess, session);
        const guessResult = unwrapResult(result);
        
        res.json({
            guess: guessResult.guess,
            isCorrect: guessResult.isCorrect,
            gameOver: guessResult.gameOver,
            correctWord: guessResult.correctWord
        });
    }
    catch (error) {
        console.error('Error processing guess:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process guess' });
    }
});

router.get('/hint/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { type } = req.query;
        
        const sessionResult = await getDb().getGameSession(gameId);
        if (isError(sessionResult)) {
            return res.status(404).json({ error: sessionResult.error.message });
        }
        const session = sessionResult.data;
        
        const clueResult = await getDb().getClue(session, type);
        const clue = unwrapResult(clueResult);
        
        res.json({ clue });
    }
    catch (error) {
        console.error('Error getting hint:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get hint' });
    }
});

router.get('/streak-status', async (req, res) => {
    try {
        const { playerId } = req.query;
        if (!playerId) {
            return res.status(400).json({ error: 'Missing playerId' });
        }
        
        const statsResult = await getDb().getUserStats(playerId);
        const stats = unwrapResult(statsResult);
        
        res.json({
            currentStreak: stats?.current_streak || 0,
            longestStreak: stats?.longest_streak || 0
        });
    }
    catch (error) {
        console.error('Error getting streak status:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get streak status' });
    }
});

router.post('/submit-score', async (req, res) => {
    try {
        const { playerId, won, guessesUsed, timeTaken } = req.body;
        if (!playerId || typeof won !== 'boolean' || typeof guessesUsed !== 'number' || typeof timeTaken !== 'number') {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await getDb().updateUserStats(playerId, won, guessesUsed, timeTaken);
        unwrapResult(result);
        
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to submit score' });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

export default router;
