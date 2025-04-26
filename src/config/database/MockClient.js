import { Result, unwrapResult, isError } from '@undefine/shared-types';

/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export class MockClient {
    connected = false;
    words = [];
    gameSessions = {};
    leaderboard = [];
    dailyMetrics = {
        totalGames: 0,
        averageTime: 0,
        averageGuesses: 0,
        uniquePlayers: 0,
        completionRate: 0
    };
    streakLeaders = [];
    users = {};
    constructor() {
        this.leaderboard = [];
        this.streakLeaders = [];
    }
    // Connection methods
    async connect() {
        console.log('MockClient: Connecting to mock database');
        try {
            // Initialize mock data
            this.words = [
                {
                    id: '1',
                    word: 'define',
                    definition: 'To state or describe exactly the nature, scope, or meaning of something',
                    etymology: 'From Latin "definire", meaning "to limit, determine, explain"',
                    first_letter: 'd',
                    in_a_sentence: 'Can you define what success means to you?',
                    number_of_letters: 6,
                    equivalents: ['explain', 'specify', 'establish', 'determine'],
                    difficulty: 'Easy',
                    times_used: 0,
                    last_used_at: null
                },
                {
                    id: '2',
                    word: 'undefine',
                    definition: 'To remove or eliminate the definition or limits of something',
                    etymology: 'Combination of prefix "un-" (meaning not or reverse) and "define"',
                    first_letter: 'u',
                    in_a_sentence: 'The artist sought to undefine traditional boundaries in art.',
                    number_of_letters: 8,
                    equivalents: ['remove limits', 'broaden', 'expand'],
                    difficulty: 'Medium',
                    times_used: 0,
                    last_used_at: null
                }
            ];
            this.connected = true;
            console.log('MockClient: Connected successfully');
        }
        catch (error) {
            console.error('MockClient: Failed to connect:', error);
            throw error;
        }
    }
    async disconnect() {
        console.log('MockClient: Disconnecting from mock database');
        this.connected = false;
        return Promise.resolve();
    }
    async initializeDatabase() {
        console.log('MockClient: Database initialized');
    }
    async setupTables() {
        console.log('MockClient: Tables set up');
    }
    // Word management
    async getWords() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        return Result.ok(this.words);
    }
    async getWord(wordId) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const word = this.words.find(w => w.id === wordId);
        if (!word) {
            return Result.error(new Error('Word not found'));
        }
        return Result.ok(word);
    }
    async addWord(word) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!word || !word.word || !word.definition) {
            return Result.error(new Error('Invalid word data'));
        }

        const newWord = {
            ...word,
            id: (this.words.length + 1).toString(),
            timesUsed: 0,
            lastUsedAt: null,
            firstLetter: word.word[0],
            numberOfLetters: word.word.length
        };
        this.words.push(newWord);
        return Result.ok(newWord);
    }
    async updateWord(wordId, word) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const existingWord = this.words.find(w => w.id === wordId);
        if (!existingWord) {
            return Result.error(new Error('Word not found'));
        }
        const updatedWord = {
            ...existingWord,
            ...word
        };
        return Result.ok(updatedWord);
    }
    async deleteWord(wordId) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const initialLength = this.words.length;
        this.words = this.words.filter(w => w.id !== wordId);
        return Result.ok(this.words.length < initialLength);
    }
    async searchWords(query) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!query) {
            return Result.error(new Error('Search query is required'));
        }

        const results = this.words.filter(w => 
            w.word.toLowerCase().includes(query.toLowerCase()) ||
            w.definition.toLowerCase().includes(query.toLowerCase())
        );
        return Result.ok(results);
    }
    async getRandomWord() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (this.words.length === 0) {
            return Result.error(new Error('No words available'));
        }
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return Result.ok(this.words[randomIndex]);
    }
    async getDailyWord(date) {
        if (this.words.length === 0) {
            return Result.error(new Error('No words available in database'));
        }
        // Get a random word for development, first word for production
        const word = process.env.NODE_ENV === 'development'
            ? this.words[Math.floor(Math.random() * this.words.length)]
            : this.words[0];
        if (!word) {
            return Result.error(new Error('Failed to get word from database'));
        }
        console.log('Retrieved word from database:', {
            id: word.id,
            length: word.word.length,
            hasDefinition: !!word.definition
        });
        return Result.ok(word);
    }
    async setDailyWord(wordId, date) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const word = this.words.find(w => w.id === wordId);
        if (!word) {
            return Result.error(new Error('Word not found'));
        }
        return Result.ok(word);
    }
    async getNextUnusedWord() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const word = this.words.find(w => !w.timesUsed);
        return Result.ok(word || null);
    }
    async markAsUsed(wordId) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const word = this.words.find(w => w.id === wordId);
        if (!word) {
            return Result.error(new Error('Word not found'));
        }
        word.timesUsed = (word.timesUsed || 0) + 1;
        word.lastUsedAt = new Date().toISOString();
        return Result.ok(word);
    }
    // User management
    async getUserByEmail(email) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!email) {
            return Result.error(new Error('Email is required'));
        }
        const user = this.users[email];
        if (!user) {
            return Result.error(new Error('User not found'));
        }
        return Result.ok(user);
    }
    async getUserByUsername(username) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!username) {
            return Result.error(new Error('Username is required'));
        }
        const user = this.users[username];
        if (!user) {
            return Result.error(new Error('User not found'));
        }
        return Result.ok(user);
    }
    async createUser(username) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!username) {
            return Result.error(new Error('Username is required'));
        }
        if (this.users[username]) {
            return Result.error(new Error('Username already exists'));
        }

        const user = {
            id: crypto.randomUUID(),
            username,
            createdAt: new Date().toISOString()
        };
        this.users[username] = user;
        return Result.ok(user);
    }
    // Leaderboard management
    async addLeaderboardEntry(entry) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!entry || !entry.username || !entry.gameId) {
            return Result.error(new Error('Invalid leaderboard entry'));
        }

        const newEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        this.leaderboard.push(newEntry);
        return Result.ok(newEntry);
    }
    async getDailyLeaderboard() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }

        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.leaderboard.filter(entry => 
            entry.createdAt.startsWith(today)
        );

        return Result.ok({
            entries: todayEntries,
            userRank: 0 // Mock implementation
        });
    }
    async getLeaderboardRank(gameId) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!gameId) {
            return Result.error(new Error('Game ID is required'));
        }

        const index = this.leaderboard.findIndex(e => e.id === gameId);
        if (index === -1) {
            return Result.error(new Error('Game not found in leaderboard'));
        }
        return Result.ok(index + 1);
    }
    // Stats management
    async getUserStats(username) {
        return Result.ok({
            username,
            gamesPlayed: 0,
            gamesWon: 0,
            averageGuesses: 0,
            averageTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastPlayedAt: new Date().toISOString()
        });
    }
    async updateUserStats(username, won, guessesUsed, timeTaken) {
        // Mock implementation - no need to store stats
        return Promise.resolve();
    }
    async getDailyStats() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }

        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.leaderboard.filter(entry => 
            entry.createdAt.startsWith(today)
        );

        const stats = {
            totalGames: todayEntries.length,
            uniquePlayers: new Set(todayEntries.map(e => e.username)).size,
            averageGuesses: todayEntries.reduce((acc, e) => acc + e.guessesUsed, 0) / todayEntries.length || 0,
            averageTime: todayEntries.reduce((acc, e) => acc + e.timeTaken, 0) / todayEntries.length || 0,
            completionRate: (todayEntries.filter(e => e.won).length / todayEntries.length) * 100 || 0
        };

        return Result.ok(stats);
    }
    async getTodayMetrics() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        return Result.ok(this.dailyMetrics);
    }
    async getTopStreaks() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }

        const sortedLeaders = [...this.streakLeaders]
            .sort((a, b) => b.streak - a.streak)
            .map(leader => ({
                username: leader.username,
                streak: leader.streak,
                lastPlayedAt: leader.lastPlayedAt || new Date().toISOString()
            }));

        return Result.ok(sortedLeaders);
    }
    async updateLastLogin(username) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!username) {
            return Result.error(new Error('Username is required'));
        }

        const user = this.users[username];
        if (!user) {
            return Result.error(new Error('User not found'));
        }

        user.lastLoginAt = new Date().toISOString();
        return Result.ok(user);
    }
    // Helper function for text normalization
    normalize(text) {
        if (!text)
            return '';
        return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    }
    async processGuess(gameId, guess, session) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!session) {
            return Result.error(new Error('Game session not found'));
        }
        if (!session.word) {
            return Result.error(new Error('Word not found in session'));
        }

        const normalizedGuess = this.normalize(guess);
        const normalizedWord = this.normalize(session.word.word);
        const isCorrect = normalizedGuess === normalizedWord;
        const gameOver = isCorrect || session.guesses.length >= 5;

        return Result.ok({
            guess: normalizedGuess,
            isCorrect,
            gameOver,
            correctWord: gameOver ? normalizedWord : undefined
        });
    }
    async startGame() {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const wordResult = await this.getDailyWord();
        if (isError(wordResult)) {
            return wordResult;
        }
        const word = wordResult.data;
        
        const session = {
            id: crypto.randomUUID(),
            word,
            guesses: [],
            startTime: new Date().toISOString()
        };
        
        this.gameSessions[session.id] = session;
        return Result.ok(session);
    }
    async getGameSession(gameId) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        const session = this.gameSessions[gameId];
        if (!session) {
            return Result.error(new Error('Game session not found'));
        }
        return Result.ok(session);
    }
    async checkGuess(wordId, guess) {
        const word = this.words.find(w => w.id === wordId);
        if (!word)
            return false;
        return this.normalize(guess) === this.normalize(word.word);
    }
    async createGameSession(wordId, word) {
        const gameId = Math.random().toString(36).substr(2, 9);
        // Create empty clue status
        const clue_status = {
            D: 'neutral',
            E: 'neutral',
            F: 'neutral',
            I: 'neutral',
            N: 'neutral',
            E2: 'neutral'
        };
        const session = {
            id: gameId,
            word_id: wordId,
            word,
            start_time: new Date().toISOString(),
            guesses: [],
            guesses_used: 0,
            revealed_clues: [],
            clue_status: clue_status,
            is_complete: false,
            is_won: false,
            state: 'active'
        };
        this.gameSessions[gameId] = session;
        return session;
    }
    async endGame(gameId, won) {
        const session = this.gameSessions[gameId];
        if (session) {
            session.is_complete = true;
            session.is_won = won;
            session.end_time = new Date().toISOString();
        }
    }
    async getClue(session, clueType) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!session || !session.word) {
            return Result.error(new Error('Game session or word not found'));
        }

        const word = session.word;
        let clue = '';

        switch (clueType) {
            case 'D':
                clue = word.definition;
                break;
            case 'E':
                clue = word.etymology || 'No etymology available';
                break;
            case 'F':
                clue = word.first_letter || '';
                break;
            case 'I':
                clue = word.in_a_sentence || 'No example sentence available';
                break;
            case 'N':
                clue = word.number_of_letters?.toString() || '0';
                break;
            case 'E2':
                clue = word.equivalents?.join(', ') || 'No equivalents available';
                break;
            default:
                return Result.error(new Error('Invalid clue type'));
        }

        return Result.ok(clue);
    }
    async getNextHint(session) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!session || !session.word) {
            return Result.error(new Error('Game session or word not found'));
        }

        const availableHints = ['D', 'E', 'F', 'I', 'N', 'E2'];
        const usedHints = session.guesses.map(g => g.hintType);
        const remainingHints = availableHints.filter(h => !usedHints.includes(h));

        if (remainingHints.length === 0) {
            return Result.error(new Error('No more hints available'));
        }

        const hintType = remainingHints[Math.floor(Math.random() * remainingHints.length)];
        const clueResult = await this.getClue(session, hintType);
        
        if (isError(clueResult)) {
            return clueResult;
        }

        const hint = {
            type: hintType,
            clue: clueResult.data,
            timestamp: new Date().toISOString()
        };

        session.guesses.push(hint);
        return Result.ok(hint);
    }
    async submitScore(score) {
        if (!this.connected) {
            return Result.error(new Error('Database not connected'));
        }
        if (!score || !score.gameId || !score.username) {
            return Result.error(new Error('Invalid score data'));
        }

        const session = this.gameSessions[score.gameId];
        if (!session) {
            return Result.error(new Error('Game session not found'));
        }

        const entry = {
            id: crypto.randomUUID(),
            username: score.username,
            gameId: score.gameId,
            guessesUsed: session.guesses.length,
            timeTaken: score.timeTaken,
            won: score.won,
            timestamp: new Date().toISOString()
        };

        this.leaderboard.push(entry);
        return Result.ok(entry);
    }
}
