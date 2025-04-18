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
        return this.words;
    }
    async getWord(wordId) {
        return this.words.find(w => w.id === wordId) || null;
    }
    async addWord(word) {
        const newWord = {
            ...word,
            id: (this.words.length + 1).toString(),
            times_used: 0,
            last_used_at: null,
            first_letter: word.word[0],
            number_of_letters: word.word.length
        };
        this.words.push(newWord);
        return newWord;
    }
    async updateWord(wordId, word) {
        const existingWord = this.words.find(w => w.id === wordId);
        if (!existingWord)
            throw new Error('Word not found');
        const updatedWord = {
            ...existingWord,
            ...word
        };
        return updatedWord;
    }
    async deleteWord(wordId) {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        const initialLength = this.words.length;
        this.words = this.words.filter(w => w.id !== wordId);
        return this.words.length < initialLength;
    }
    async searchWords(query) {
        return this.words.filter(w => w.word.toLowerCase().includes(query.toLowerCase()) ||
            w.definition.toLowerCase().includes(query.toLowerCase()));
    }
    async getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }
    async getDailyWord(date) {
        if (this.words.length === 0) {
            console.error('No words available in database');
            throw new Error('No words available in database');
        }
        // Get a random word for development, first word for production
        const word = process.env.NODE_ENV === 'development'
            ? this.words[Math.floor(Math.random() * this.words.length)]
            : this.words[0];
        if (!word) {
            console.error('Failed to get word from database');
            throw new Error('Failed to get word from database');
        }
        console.log('Retrieved word from database:', {
            id: word.id,
            length: word.word.length,
            hasDefinition: !!word.definition
        });
        return word;
    }
    async setDailyWord(wordId, date) {
        // No-op for mock
    }
    async getNextUnusedWord() {
        return this.words.find(w => !w.times_used) || null;
    }
    async markAsUsed(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (word) {
            word.times_used = (word.times_used || 0) + 1;
            word.last_used_at = new Date().toISOString();
        }
    }
    // User management
    async getUserByEmail(email) {
        return this.users[email] || null;
    }
    async getUserByUsername(username) {
        return this.users[username] || null;
    }
    async createUser(username) {
        const user = {
            id: crypto.randomUUID(),
            username,
            created_at: new Date().toISOString()
        };
        this.users[username] = user;
        return user;
    }
    // Leaderboard management
    async addLeaderboardEntry(entry) {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        const newEntry = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        return newEntry;
    }
    async getDailyLeaderboard() {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        return {
            entries: [],
            userRank: 0
        };
    }
    async getLeaderboardRank(gameId) {
        const index = this.leaderboard.findIndex(e => e.id === gameId);
        return index === -1 ? null : index + 1;
    }
    // Stats management
    async getUserStats(username) {
        return {
            username,
            games_played: 0,
            games_won: 0,
            average_guesses: 0,
            average_time: 0,
            current_streak: 0,
            longest_streak: 0,
            last_played_at: new Date().toISOString()
        };
    }
    async updateUserStats(username, won, guessesUsed, timeTaken) {
        // Mock implementation - no need to store stats
        return Promise.resolve();
    }
    async getDailyStats() {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        return {
            totalGames: this.leaderboard.length,
            uniquePlayers: new Set(this.leaderboard.map(e => e.username)).size,
            averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length || 0,
            averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length || 0,
            completionRate: (this.leaderboard.filter(e => e.guessesUsed > 0).length / this.leaderboard.length) * 100 || 0
        };
    }
    async getTodayMetrics() {
        return this.dailyMetrics;
    }
    async getTopStreaks() {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        // Sort streakLeaders by streak in descending order
        return this.streakLeaders.map(leader => ({
            username: leader.username,
            streak: leader.streak,
            lastPlayedAt: leader.lastPlayedAt || new Date().toISOString()
        }));
    }
    async updateLastLogin(username) {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        // In a real implementation, this would update the user's last login time
        // For mock purposes, we'll just return void
    }
    // Helper function for text normalization
    normalize(text) {
        if (!text)
            return '';
        return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    }
    async processGuess(gameId, guess, session) {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        const wordObj = this.words.find(w => w.id === session.word_id);
        if (!wordObj) {
            throw new Error('Word not found');
        }
        const word = wordObj.word;
        const isCorrect = guess.toLowerCase() === word.toLowerCase();
        const result = {
            isCorrect,
            guess,
            gameOver: isCorrect || session.guesses_used >= 5,
        };
        if (result.gameOver && !isCorrect) {
            result.correctWord = word;
        }
        return result;
    }
    async startGame() {
        if (!this.connected) {
            throw new Error('Database not connected');
        }
        // Get random word
        const word = await this.getRandomWord();
        // Create empty clue status
        const clue_status = {
            D: 'neutral',
            E: 'neutral',
            F: 'neutral',
            I: 'neutral',
            N: 'neutral',
            E2: 'neutral'
        };
        // Create a new game session
        const gameId = Math.random().toString(36).substr(2, 9);
        const session = {
            id: gameId,
            word_id: word.id,
            word: word.word,
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
    async getGameSession(gameId) {
        return this.gameSessions[gameId] || null;
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
        const word = await this.getWord(session.word_id);
        if (!word) {
            return null;
        }
        switch (clueType) {
            case 'D': return word.definition;
            case 'E': return word.etymology || null;
            case 'F': return word.first_letter;
            case 'I': return word.in_a_sentence || null;
            case 'N': return word.number_of_letters;
            case 'E2': return Array.isArray(word.equivalents) ? word.equivalents.join(', ') : null;
            default: return null;
        }
    }
    async getNextHint(session) {
        // Collect all available hint types that aren't revealed yet
        const availableHints = ['E', 'F', 'I', 'N', 'E2'].filter(type => !(session.revealed_clues || []).includes(type));
        // If all hints are already revealed, return a fallback hint
        if (availableHints.length === 0) {
            return {
                hint: "No more hints available!",
                type: 'D' // Definition is always available
            };
        }
        // Pick a random hint type
        const randomType = availableHints[Math.floor(Math.random() * availableHints.length)];
        let hintText = '';
        // Get the actual word
        const word = this.words.find(w => w.id === session.word_id) || this.words[0];
        // Generate hint text based on type
        switch (randomType) {
            case 'E':
                hintText = word.etymology || "Etymology unavailable";
                break;
            case 'F':
                hintText = word.first_letter || word.word.charAt(0);
                break;
            case 'I':
                hintText = word.in_a_sentence || "Example sentence unavailable";
                break;
            case 'N':
                hintText = `This word has ${word.number_of_letters || word.word.length} letters`;
                break;
            case 'E2':
                hintText = word.equivalents && word.equivalents.length > 0
                    ? `Similar words: ${word.equivalents.join(', ')}`
                    : "No synonyms available";
                break;
            default:
                hintText = "Hint unavailable";
        }
        return {
            hint: hintText,
            type: randomType
        };
    }
    async submitScore(score) {
        // Mock implementation - just log the score
        console.log('Mock submitScore called with:', score);
        return Promise.resolve();
    }
}
