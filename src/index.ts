import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { db } from './config/database/index.js';
import { GameService } from './services/GameService.js';
import { StatsService } from './services/StatsService.js';

// Load environment variables
config();

const app = express();
let server: ReturnType<typeof app.listen>;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const initializeDatabase = async () => {
  try {
    await db.connect();
    await db.initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Get word endpoint
app.get('/api/word', async (req, res) => {
  try {
    const session = await db.startGame();
    const dailyWord = await db.getDailyWord();
    
    if (!dailyWord) {
      throw new Error('No word available');
    }

    res.json({
      gameId: session.id,
      word: {
        word: dailyWord.word,
        definition: dailyWord.definition,
        etymology: dailyWord.etymology,
        first_letter: dailyWord.first_letter,
        in_a_sentence: dailyWord.in_a_sentence,
        number_of_letters: dailyWord.number_of_letters,
        equivalents: dailyWord.equivalents
      }
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Failed to fetch word' });
  }
});

// Submit guess endpoint
app.post('/api/guess', async (req, res) => {
  try {
    const { gameId, guess } = req.body;
    if (!gameId || !guess) {
      return res.status(400).json({ error: 'Missing gameId or guess' });
    }

    const session = await db.getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const result = await db.processGuess(gameId, guess, session);
    
    // Ensure we have all required fields in the response
    const response = {
      ...result,
      correctWord: session.word,
      guessedWord: guess,
      gameOver: result.gameOver || session.guesses.length >= 5,
      updatedSession: {
        ...result.updatedSession,
        word: session.word
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

// Start server
const startServer = async () => {
  console.log('Starting server initialization...');
  
  try {
    await initializeDatabase();
    
    const serverPort = parseInt(process.env.PORT || '3001', 10);
    server = app.listen(serverPort, () => {
      console.log('\n=== Server Status ===');
      console.log(`Time: ${new Date().toISOString()}`);
      console.log(`Port: ${serverPort}`);
      console.log(`URL: http://localhost:${serverPort}`);
      console.log('\nTest these endpoints:');
      console.log(`1. http://localhost:${serverPort}/`);
      console.log(`2. http://localhost:${serverPort}/test`);
      console.log(`3. http://localhost:${serverPort}/health`);
      console.log('==================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 