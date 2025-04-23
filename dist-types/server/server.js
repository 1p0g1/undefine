import express from 'express';
import cors from 'cors';
import { SupabaseClient } from '../src/config/database/SupabaseClient.js';
import dotenv from 'dotenv';
// Unused imports commented out
// import crypto from 'crypto';
// import { GameService } from './services/GameService.js';
// import { StatsService } from './services/StatsService.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Initialize Supabase client
const db = SupabaseClient.getInstance();
// Middleware
app.use(cors());
app.use(express.json());
// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});
// Get word endpoint
app.get('/api/word', async (req, res) => {
    try {
        const word = await db.getDailyWord();
        if (!word) {
            res.status(404).json({ error: 'No word found for today' });
            return;
        }
        res.json({ word });
    }
    catch (error) {
        console.error('Error fetching word:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get random word endpoint (alias for daily word)
app.get('/api/word/random', async (req, res) => {
    try {
        const session = await db.startGame();
        if (!session) {
            res.status(404).json({ error: 'Failed to create game session' });
            return;
        }
        const word = await db.getDailyWord();
        if (!word) {
            res.status(404).json({ error: 'No word found for today' });
            return;
        }
        res.json({
            word,
            gameId: session.id
        });
    }
    catch (error) {
        console.error('Error fetching word:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Submit guess endpoint
app.post('/api/guess', async (req, res) => {
    const { gameId, guess } = req.body;
    if (!gameId || !guess) {
        res.status(400).json({ error: 'Missing gameId or guess' });
        return;
    }
    try {
        const session = await db.getGameSession(gameId);
        if (!session) {
            res.status(404).json({ error: 'Game session not found' });
            return;
        }
        const result = await db.processGuess(gameId, guess, session);
        res.json(result);
    }
    catch (error) {
        console.error('Error processing guess:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
