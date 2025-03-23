const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockWord = {
  wordId: '1',
  gameId: 'game-123',
  word: 'undefine',
  definition: 'The act of removing a definition or making something undefined',
  partOfSpeech: 'verb',
  alternateDefinition: 'To cancel the definition of something previously defined',
  totalGuesses: 0,
  letterCount: { count: 8, display: '8 letters' },
  synonyms: ['remove', 'delete', 'clear']
};

// Routes
app.get('/', (req, res) => {
  res.send('Demo server is running!');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get word
app.get('/api/word', (req, res) => {
  console.log('GET /api/word called');
  res.json(mockWord);
});

// Start server
app.listen(PORT, () => {
  console.log(`Demo server running at http://localhost:${PORT}`);
}); 