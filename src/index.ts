import express from 'express';
import cors from 'cors';
import { getRandomWord, words, WordEntry } from './data/words';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from './auth/authMiddleware';
import { login } from './auth/authController';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug logging
console.log('Starting server initialization...');

const app = express();
const port = 3000; // Change to a standard development port

// Keep track of server instance
let server: any = null;

// Graceful shutdown function
function shutdown() {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.log('Forcing shutdown...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

console.log('Setting up middleware...');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

// Enable keep-alive
app.use((req, res, next) => {
  res.set('Connection', 'keep-alive');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Store current word in memory (in a real app, you'd use a session or database)
let currentWord: ReturnType<typeof getRandomWord>;

try {
  console.log('Initializing first word...');
  currentWord = getRandomWord();
  console.log('Initial word selected:', currentWord);
} catch (error) {
  console.error('Error selecting initial word:', error);
  process.exit(1);
}

// Check if words are similar using fuzzy matching
function isFuzzyMatch(guess: string, correct: string): boolean {
  try {
    const normalizedGuess = guess.toLowerCase();
    const normalizedCorrect = correct.toLowerCase();

    // If the guess is the start of the correct word (or vice versa)
    if (normalizedCorrect.startsWith(normalizedGuess) || normalizedGuess.startsWith(normalizedCorrect)) {
      return true;
    }

    // If they share a significant common prefix
    const minLength = Math.min(normalizedGuess.length, normalizedCorrect.length);
    const commonPrefixLength = [...Array(minLength)].findIndex((_, i) => 
      normalizedGuess[i] !== normalizedCorrect[i]
    );
    
    if (commonPrefixLength > 4) {
      return true;
    }

    // Calculate edit distance
    const matrix: number[][] = [];
    for (let i = 0; i <= normalizedGuess.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= normalizedCorrect.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= normalizedGuess.length; i++) {
      for (let j = 1; j <= normalizedCorrect.length; j++) {
        if (normalizedGuess[i-1] === normalizedCorrect[j-1]) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1, // substitution
            matrix[i][j-1] + 1,   // insertion
            matrix[i-1][j] + 1    // deletion
          );
        }
      }
    }

    const distance = matrix[normalizedGuess.length][normalizedCorrect.length];
    const maxLength = Math.max(normalizedGuess.length, normalizedCorrect.length);
    
    // More lenient threshold for longer words
    const threshold = Math.max(2, Math.floor(maxLength * 0.3));
    
    return distance <= threshold;
  } catch (error) {
    console.error('Error in fuzzy matching:', error);
    return false;
  }
}

// Get a random word and its definition
app.get('/api/word', (req, res) => {
  try {
    currentWord = getRandomWord();
    console.log('New word selected:', currentWord);
    res.json({ 
      definition: currentWord.definition,
      totalGuesses: 5,
      partOfSpeech: currentWord.partOfSpeech,
      alternateDefinition: currentWord.alternateDefinition,
      synonyms: currentWord.synonyms
    });
  } catch (error) {
    console.error('Error in /api/word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the leaderboard entry interface
interface LeaderboardEntry {
  id: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount?: number; // Number of hints used (optional)
  date: string;
  word: string;
  name?: string; // Optional name for display purposes
}

// In-memory leaderboard storage
let leaderboard: LeaderboardEntry[] = [];

// Function to generate dummy leaderboard data
function generateDummyLeaderboardData(word: string, count: number = 20): LeaderboardEntry[] {
  const dummyNames = [
    'SpeedyGuesser', 'WordWizard', 'LexiconMaster', 'QuickThinker', 
    'BrainiacPlayer', 'WordNinja', 'VocabVirtuoso', 'MindReader',
    'ThesaurusRex', 'DictionaryDiva', 'WordSmith', 'LinguistPro',
    'GuessingGuru', 'DefineDevil', 'SyntaxSage', 'EtymologyExpert',
    'PuzzlePro', 'VerbalVirtuoso', 'WordWanderer', 'LexicalLegend'
  ];
  
  const dummyEntries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random performance metrics
    const time = 20 + Math.floor(Math.random() * 120); // 20-140 seconds
    const guessCount = 1 + Math.floor(Math.random() * 6); // 1-6 guesses
    const fuzzyCount = Math.floor(Math.random() * 3); // 0-2 fuzzy matches
    const hintCount = Math.floor(Math.random() * 4); // 0-3 hints
    
    dummyEntries.push({
      id: `dummy-${i}-${Date.now()}`,
      time,
      guessCount,
      fuzzyCount,
      hintCount,
      date: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Random time in last 24h
      word,
      name: dummyNames[i % dummyNames.length] // Cycle through dummy names
    });
  }
  
  // Sort by the same criteria as real entries
  return dummyEntries.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
    return b.fuzzyCount - a.fuzzyCount;
  });
}

// Check if a guess is correct
app.post('/api/guess', (req, res) => {
  try {
    const { guess, remainingGuesses, timer, userId } = req.body;
    
    if (!currentWord || !currentWord.word) {
      console.error('No word selected!');
      res.status(500).json({ error: 'No word selected' });
      return;
    }
    
    // Log the current state
    console.log('Current word:', currentWord);
    console.log('Received guess:', guess);
    
    const isCorrect = guess.toLowerCase() === currentWord.word.toLowerCase();
    const isFuzzy = !isCorrect && isFuzzyMatch(guess, currentWord.word);
    const isGameOver = isCorrect || remainingGuesses <= 1;
    
    // Calculate fuzzy positions for the current guess
    const fuzzyPositions: number[] = [];
    if (isFuzzy) {
      // Simple implementation: mark positions where letters match
      const guessLetters = guess.toLowerCase().split('');
      const correctLetters = currentWord.word.toLowerCase().split('');
      
      // Check for exact matches
      guessLetters.forEach((letter: string, index: number) => {
        if (index < correctLetters.length && letter === correctLetters[index]) {
          fuzzyPositions.push(index);
        }
      });
      
      // If no exact matches but it's fuzzy, add at least one position
      if (fuzzyPositions.length === 0) {
        fuzzyPositions.push(0); // Default to first position
      }
    }
    
    console.log('Guess attempt:', {
      guess,
      correctWord: currentWord.word,
      isCorrect,
      isFuzzy,
      isGameOver,
      fuzzyPositions
    });
    
    // If the game is won, add to leaderboard
    if (isCorrect) {
      const guessCount = 6 - remainingGuesses + 1; // +1 because this guess counts
      const entry: LeaderboardEntry = {
        id: userId || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        time: timer || 0,
        guessCount,
        fuzzyCount: req.body.fuzzyCount || 0,
        hintCount: req.body.hintCount || 0,
        date: new Date().toISOString(),
        word: currentWord.word,
        name: req.body.userName || 'You' // Use provided username or default to 'You'
      };
      
      leaderboard.push(entry);
      console.log('Added to leaderboard:', entry);
      
      // Sort leaderboard by time, then by guess count (ascending), then by fuzzy count (descending)
      leaderboard = leaderboard
        .filter(entry => entry.word === currentWord.word) // Only keep entries for current word
        .sort((a, b) => {
          if (a.time !== b.time) return a.time - b.time;
          if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
          return b.fuzzyCount - a.fuzzyCount;
        });
    }
    
    res.json({ 
      isCorrect,
      correctWord: isGameOver ? currentWord.word : undefined,
      guessedWord: guess,
      isFuzzy,
      fuzzyPositions,
      leaderboardRank: isCorrect ? leaderboard.findIndex(e => e.id === (userId || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)) + 1 : undefined
    });
  } catch (error) {
    console.error('Error in /api/guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add basic test routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/login', login);

// Validate token endpoint
app.get('/api/auth/validate', authenticateAdmin, (req, res) => {
  res.json({ valid: true });
});

// Get all words - no auth required for now
app.get('/api/admin/words', (req, res) => {
  try {
    res.json({ words });
  } catch (error) {
    console.error('Error in /api/admin/words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new word - no auth required for now
app.post('/api/admin/words', (req, res) => {
  try {
    const newWord: WordEntry = req.body;
    
    // Validate the new word
    if (!newWord.word || !newWord.definition || !newWord.partOfSpeech) {
      return res.status(400).json({ error: 'Word, definition, and partOfSpeech are required' });
    }
    
    // Check if word already exists
    const wordExists = words.some(w => w.word.toLowerCase() === newWord.word.toLowerCase());
    if (wordExists) {
      return res.status(400).json({ error: 'Word already exists' });
    }
    
    // Add the new word to the array
    words.push(newWord);
    
    // Save the updated words array to the file
    saveWordsToFile();
    
    res.status(201).json({ message: 'Word added successfully', word: newWord });
  } catch (error) {
    console.error('Error in POST /api/admin/words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing word - no auth required for now
app.put('/api/admin/words/:word', (req, res) => {
  try {
    const wordToUpdate = req.params.word;
    const updatedWord: WordEntry = req.body;
    
    // Validate the updated word
    if (!updatedWord.word || !updatedWord.definition || !updatedWord.partOfSpeech) {
      return res.status(400).json({ error: 'Word, definition, and partOfSpeech are required' });
    }
    
    // Find the index of the word to update
    const index = words.findIndex(w => w.word.toLowerCase() === wordToUpdate.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    // Update the word
    words[index] = updatedWord;
    
    // Save the updated words array to the file
    saveWordsToFile();
    
    res.json({ message: 'Word updated successfully', word: updatedWord });
  } catch (error) {
    console.error(`Error in PUT /api/admin/words/${req.params.word}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a word - no auth required for now
app.delete('/api/admin/words/:word', (req, res) => {
  try {
    const wordToDelete = req.params.word;
    
    // Find the index of the word to delete
    const index = words.findIndex(w => w.word.toLowerCase() === wordToDelete.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    // Remove the word from the array
    const deletedWord = words.splice(index, 1)[0];
    
    // Save the updated words array to the file
    saveWordsToFile();
    
    res.json({ message: 'Word deleted successfully', word: deletedWord });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/words/${req.params.word}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to save words to file
function saveWordsToFile() {
  try {
    const wordsFilePath = path.join(__dirname, 'data', 'words.ts');
    
    // Create the content to write to the file
    const fileContent = `export interface WordEntry {
  word: string;
  partOfSpeech: string;
  synonyms?: string[];
  definition: string;
  alternateDefinition?: string;
  dateAdded?: string;
}

export const words: WordEntry[] = ${JSON.stringify(words, null, 2)};

export function getRandomWord(): WordEntry {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}`;
    
    // Write the content to the file
    fs.writeFileSync(wordsFilePath, fileContent);
    console.log('Words file updated successfully');
  } catch (error) {
    console.error('Error saving words to file:', error);
    throw error;
  }
}

// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
  try {
    // Get user's position from query parameter
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Filter to current word's leaderboard
    let currentLeaderboard = leaderboard.filter(entry => entry.word === currentWord.word);
    
    // For development/demo purposes: If we have fewer than 10 entries, generate dummy data
    const minEntries = 10;
    let userEntry = currentLeaderboard.find(entry => entry.id === userId);
    
    if (currentLeaderboard.length < minEntries || !userEntry) {
      // Generate dummy data
      const dummyData = generateDummyLeaderboardData(currentWord.word, 20);
      
      // If the user isn't in the real leaderboard, make sure they're included in the dummy data
      if (!userEntry) {
        // Find the user's entry from the full leaderboard (might be for a different word)
        userEntry = leaderboard.find(entry => entry.id === userId);
        
        if (userEntry) {
          // Clone the entry but update the word to match current word
          const clonedEntry = { ...userEntry, word: currentWord.word };
          dummyData.push(clonedEntry);
        }
      }
      
      // Combine real and dummy data, ensuring no duplicates by ID
      const combinedLeaderboard = [...currentLeaderboard];
      
      for (const dummyEntry of dummyData) {
        if (!combinedLeaderboard.some(entry => entry.id === dummyEntry.id)) {
          combinedLeaderboard.push(dummyEntry);
        }
      }
      
      // Sort the combined leaderboard
      currentLeaderboard = combinedLeaderboard.sort((a, b) => {
        // First sort by time
        if (a.time !== b.time) return a.time - b.time;
        
        // Then by guess count (fewer guesses is better)
        if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
        
        // Then by hint count (fewer hints is better)
        if ((a.hintCount || 0) !== (b.hintCount || 0)) return (a.hintCount || 0) - (b.hintCount || 0);
        
        // Finally by fuzzy count (more fuzzy matches is better)
        return (b.fuzzyCount || 0) - (a.fuzzyCount || 0);
      });
    }
    
    // Find user's position
    const userIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
    
    // If user not found, create a dummy entry
    if (userIndex === -1) {
      // Create a dummy entry for the user
      const dummyUserEntry: LeaderboardEntry = {
        id: userId,
        time: 60, // Default to 1 minute
        guessCount: 3, // Default to 3 guesses
        fuzzyCount: 0,
        hintCount: 0,
        date: new Date().toISOString(),
        word: currentWord.word,
        name: 'You'
      };
      currentLeaderboard.push(dummyUserEntry);
      
      // Re-sort the leaderboard
      currentLeaderboard.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
        if ((a.hintCount || 0) !== (b.hintCount || 0)) return (a.hintCount || 0) - (b.hintCount || 0);
        return (b.fuzzyCount || 0) - (a.fuzzyCount || 0);
      });
      
      // Find the user's position again
      const newUserIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
      if (newUserIndex !== -1) {
        // Get entries around the user (5 above and 5 below)
        const startIndex = Math.max(0, newUserIndex - 5);
        const endIndex = Math.min(currentLeaderboard.length, newUserIndex + 6);
        const leaderboardSlice = currentLeaderboard.slice(startIndex, endIndex);
        
        res.json({
          leaderboard: leaderboardSlice,
          userRank: newUserIndex + 1,
          totalEntries: currentLeaderboard.length,
          startRank: startIndex + 1
        });
        return;
      }
      
      // If we still can't find the user (shouldn't happen), return an error
      return res.status(404).json({ error: 'User not found in leaderboard' });
    }
    
    // Get entries around the user (5 above and 5 below)
    const startIndex = Math.max(0, userIndex - 5);
    const endIndex = Math.min(currentLeaderboard.length, userIndex + 6);
    const leaderboardSlice = currentLeaderboard.slice(startIndex, endIndex);
    
    res.json({
      leaderboard: leaderboardSlice,
      userRank: userIndex + 1,
      totalEntries: currentLeaderboard.length,
      startRank: startIndex + 1
    });
  } catch (error) {
    console.error('Error in /api/leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Modify server startup
console.log('Setting up server...');
try {
  server = app.listen(port, 'localhost', () => {
    console.log('\n=== Server Status ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${port}`);
    console.log(`URL: http://localhost:${port}`);
    console.log('\nTest these endpoints:');
    console.log(`1. http://localhost:${port}/`);
    console.log(`2. http://localhost:${port}/test`);
    console.log(`3. http://localhost:${port}/health`);
    console.log('==================\n');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
} 