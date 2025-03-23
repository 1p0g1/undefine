import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './config/database.js';
import promClient from 'prom-client';
import { login } from './auth/authController.js';
import { GameService } from './services/GameService.js';
import { StatsService } from './services/StatsService.js';
import { authenticateUser } from './auth/authMiddleware.js';
// Environment variable validation
function validateEnvironmentVariables() {
    var _a;
    const requiredVars = [
        'PORT',
        'NODE_ENV',
        'REDIS_URI',
        'SNOWFLAKE_ACCOUNT',
        'SNOWFLAKE_USERNAME',
        'SNOWFLAKE_PASSWORD',
        'SNOWFLAKE_DATABASE',
        'SNOWFLAKE_WAREHOUSE',
        'SNOWFLAKE_POOL_SIZE',
        'SNOWFLAKE_CONNECTION_TIMEOUT',
        'JWT_SECRET',
        'DB_PROVIDER'
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => console.error(`   - ${varName}`));
        throw new Error('Missing required environment variables. Please check your .env file.');
    }
    const dbProvider = (_a = process.env.DB_PROVIDER) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (dbProvider && !['snowflake', 'mongodb'].includes(dbProvider)) {
        throw new Error(`Unsupported database provider: ${dbProvider}. Must be either 'snowflake' or 'mongodb'`);
    }
    console.log('✅ All environment variables validated. Server starting...');
}
// Debug logging
console.log('Starting server initialization...');
// Validate environment variables before proceeding
validateEnvironmentVariables();
const app = express();
const port = process.env.PORT;
if (!port) {
    throw new Error('Missing PORT environment variable. Please check your .env file.');
}
// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['route', 'method'],
});
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
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
// Add request logging middleware
app.use(morgan('combined'));
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ route: req.path, method: req.method });
    });
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
const activeGames = new Map();
// Get a random word and its definition
app.get('/api/word', authenticateUser, async (req, res) => {
    var _a, _b;
    try {
        console.log('[/api/word] Starting request for user:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.email);
        const gameResponse = await GameService.startGame(req.user.email);
        console.log('[/api/word] Successfully created game:', gameResponse.gameId);
        res.json(gameResponse);
    }
    catch (error) {
        console.error('[/api/word] Error details:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// In-memory leaderboard storage
let leaderboard = [];
// Function to generate dummy leaderboard data
function generateDummyLeaderboardData(word, count = 20) {
    const dummyNames = [
        'SpeedyGuesser', 'WordWizard', 'LexiconMaster', 'QuickThinker',
        'BrainiacPlayer', 'WordNinja', 'VocabVirtuoso', 'MindReader',
        'ThesaurusRex', 'DictionaryDiva', 'WordSmith', 'LinguistPro',
        'GuessingGuru', 'DefineDevil', 'SyntaxSage', 'EtymologyExpert',
        'PuzzlePro', 'VerbalVirtuoso', 'WordWanderer', 'LexicalLegend'
    ];
    const dummyEntries = [];
    for (let i = 0; i < count; i++) {
        const time = 20 + Math.floor(Math.random() * 120);
        const guessCount = 1 + Math.floor(Math.random() * 6);
        const fuzzyCount = Math.floor(Math.random() * 3);
        const hintCount = Math.floor(Math.random() * 4);
        dummyEntries.push({
            id: `dummy-${i}-${Date.now()}`,
            time,
            guessCount,
            fuzzyCount,
            hintCount,
            date: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
            word,
            name: dummyNames[i % dummyNames.length]
        });
    }
    return dummyEntries.sort((a, b) => {
        if (a.time !== b.time)
            return a.time - b.time;
        if (a.guessCount !== b.guessCount)
            return a.guessCount - b.guessCount;
        return b.fuzzyCount - a.fuzzyCount;
    });
}
// Check if a guess is correct
app.post('/api/guess', authenticateUser, async (req, res) => {
    try {
        const { guess, gameId } = req.body;
        const result = await GameService.processGuess(gameId, guess);
        res.json(result);
    }
    catch (error) {
        console.error('Error in /api/guess:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Clean up old game sessions periodically
setInterval(() => {
    GameService.cleanupOldGames();
}, 15 * 60 * 1000); // Run every 15 minutes
// Add basic test routes
app.get('/', (req, res) => {
    res.send('Server is running!');
});
app.get('/test', (req, res) => {
    const NODE_ENV = process.env.NODE_ENV;
    if (!NODE_ENV) {
        throw new Error('Missing NODE_ENV environment variable. Please check your .env file.');
    }
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: NODE_ENV
    });
});
// Authentication routes
app.post('/api/auth/login', login);
// Validate token endpoint
app.get('/api/auth/validate', (req, res) => {
    res.json({ valid: true });
});
// Get daily statistics
app.get('/api/stats/daily', async (req, res) => {
    try {
        const stats = await StatsService.getDailyStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting daily stats:', error);
        res.status(500).json({ error: 'Internal server error' });
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});
