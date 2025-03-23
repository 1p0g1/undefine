import express from 'express';
import cors from 'cors';

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Sample word data (for demonstration)
const wordData = {
  word: "ponder",
  definition: "To reason, argue, or think carefully and thoroughly.",
  partOfSpeech: "verb"
};

// Store active games
const activeGames = new Map();

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('[/api/test] Received test request');
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    message: 'API is accessible',
    timestamp: new Date().toISOString()
  });
});

// Get a random word
app.get('/api/word', (req, res) => {
  console.log('[/api/word] Fetching word');
  
  const gameId = `game-${Date.now()}`;
  
  // Store the game data
  activeGames.set(gameId, {
    word: wordData.word,
    startTime: new Date(),
    guessCount: 0
  });
  
  // Return the game response
  res.json({
    gameId: gameId,
    word: {
      id: '12345',
      definition: wordData.definition,
      partOfSpeech: wordData.partOfSpeech
    }
  });
});

// Process a guess
app.post('/api/guess', (req, res) => {
  const { gameId, guess } = req.body;
  
  console.log(`[/api/guess] Processing guess: ${guess} for game: ${gameId}`);
  
  if (!gameId) {
    return res.status(400).json({ error: 'Missing gameId parameter' });
  }
  
  if (!guess) {
    return res.status(400).json({ error: 'Missing guess parameter' });
  }
  
  // Get the game state
  const gameState = activeGames.get(gameId);
  if (!gameState) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Process the guess
  gameState.guessCount++;
  
  const isCorrect = guess.toLowerCase() === gameState.word.toLowerCase();
  const isFuzzy = !isCorrect && (
    gameState.word.toLowerCase().includes(guess.toLowerCase()) ||
    guess.toLowerCase().includes(gameState.word.toLowerCase().substring(0, 3))
  );
  
  // Calculate fuzzy positions if it's a fuzzy match
  const fuzzyPositions = isFuzzy ? 
    guess.split('').map((char, i) => 
      gameState.word.toLowerCase()[i] === char.toLowerCase() ? i : null
    ).filter(pos => pos !== null) : [];

  const response = {
    isCorrect,
    correctWord: isCorrect || gameState.guessCount >= 6 ? gameState.word : undefined,
    guessedWord: guess,
    isFuzzy,
    fuzzyPositions: fuzzyPositions.length > 0 ? fuzzyPositions : [0],
    remainingGuesses: 6 - gameState.guessCount,
  };
  
  // If game is over, clean up
  if (isCorrect || gameState.guessCount >= 6) {
    activeGames.delete(gameId);
  }
  
  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Simple API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log(`  GET  /api/test - Test the API`);
  console.log(`  GET  /api/word - Get a random word`);
  console.log(`  POST /api/guess - Submit a guess`);
}); 