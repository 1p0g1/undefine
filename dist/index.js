"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const words_1 = require("./data/words");
// Debug logging
console.log('Starting server initialization...');
const app = (0, express_1.default)();
const port = 3000; // Change to a standard development port
// Keep track of server instance
let server = null;
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
    }
    else {
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
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use(express_1.default.json());
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
let currentWord;
try {
    console.log('Initializing first word...');
    currentWord = (0, words_1.getRandomWord)();
    console.log('Initial word selected:', currentWord);
}
catch (error) {
    console.error('Error selecting initial word:', error);
    process.exit(1);
}
// Check if words are similar using fuzzy matching
function isFuzzyMatch(guess, correct) {
    try {
        const normalizedGuess = guess.toLowerCase();
        const normalizedCorrect = correct.toLowerCase();
        // If the guess is the start of the correct word (or vice versa)
        if (normalizedCorrect.startsWith(normalizedGuess) || normalizedGuess.startsWith(normalizedCorrect)) {
            return true;
        }
        // If they share a significant common prefix
        const minLength = Math.min(normalizedGuess.length, normalizedCorrect.length);
        const commonPrefixLength = [...Array(minLength)].findIndex((_, i) => normalizedGuess[i] !== normalizedCorrect[i]);
        if (commonPrefixLength > 4) {
            return true;
        }
        // Calculate edit distance
        const matrix = [];
        for (let i = 0; i <= normalizedGuess.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= normalizedCorrect.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= normalizedGuess.length; i++) {
            for (let j = 1; j <= normalizedCorrect.length; j++) {
                if (normalizedGuess[i - 1] === normalizedCorrect[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        const distance = matrix[normalizedGuess.length][normalizedCorrect.length];
        const maxLength = Math.max(normalizedGuess.length, normalizedCorrect.length);
        // More lenient threshold for longer words
        const threshold = Math.max(2, Math.floor(maxLength * 0.3));
        return distance <= threshold;
    }
    catch (error) {
        console.error('Error in fuzzy matching:', error);
        return false;
    }
}
// Get a random word and its definition
app.get('/api/word', (req, res) => {
    try {
        currentWord = (0, words_1.getRandomWord)();
        console.log('New word selected:', currentWord);
        res.json({
            definition: currentWord.definition,
            totalGuesses: 5,
            partOfSpeech: currentWord.partOfSpeech,
            alternateDefinition: currentWord.alternateDefinition,
            synonyms: currentWord.synonyms
        });
    }
    catch (error) {
        console.error('Error in /api/word:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Check if a guess is correct
app.post('/api/guess', (req, res) => {
    try {
        const { guess, remainingGuesses } = req.body;
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
        console.log('Guess attempt:', {
            guess,
            correctWord: currentWord.word,
            isCorrect,
            isFuzzy,
            isGameOver
        });
        res.json({
            isCorrect,
            correctWord: isGameOver ? currentWord.word : undefined,
            guessedWord: guess,
            isFuzzy
        });
    }
    catch (error) {
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
}
catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
