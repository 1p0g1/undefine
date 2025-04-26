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
        // Initialize with some mock data
    }
    async connect() {
        this.connected = true;
        return { success: true };
    }
    async disconnect() {
        this.connected = false;
        return { success: true };
    }
    async getRandomWord() {
        if (this.words.length === 0) {
            return {
                success: false,
                error: {
                    code: 'NO_WORDS',
                    message: 'No words available'
                }
            };
        }
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return {
            success: true,
            data: this.words[randomIndex]
        };
    }
    async getDailyWord() {
        return this.getRandomWord();
    }
    async processGuess(gameId, guess, session) {
        const word = this.words.find(w => w.id === session.word_id);
        if (!word) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Word not found'
                }
            };
        }
        const isCorrect = guess.toLowerCase() === word.word.toLowerCase();
        const isFuzzy = false; // TODO: Implement fuzzy matching
        const fuzzyPositions = [];
        return {
            success: true,
            data: {
                isCorrect,
                guess,
                isFuzzy,
                fuzzyPositions,
                gameOver: isCorrect || session.guesses.length >= 6
            }
        };
    }
    async getLeaderboard(limit) {
        return {
            success: true,
            data: this.leaderboard.slice(0, limit).map((entry, index) => ({
                username: entry.username,
                score: entry.timeTaken,
                rank: index + 1
            }))
        };
    }
    async getTopStreaks(limit) {
        return {
            success: true,
            data: this.streakLeaders.slice(0, limit)
        };
    }
    async getNextHint(gameId) {
        const session = this.gameSessions[gameId];
        if (!session) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Game session not found'
                }
            };
        }
        const word = this.words.find(w => w.id === session.word_id);
        if (!word) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Word not found'
                }
            };
        }
        return {
            success: true,
            data: word.definition
        };
    }
    async submitScore(gameId, score) {
        const session = this.gameSessions[gameId];
        if (!session) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Game session not found'
                }
            };
        }
        session.score = score;
        return {
            success: true
        };
    }
    async createGameSession(wordId, word) {
        const session = {
            id: crypto.randomUUID(),
            user_id: 'mock-user',
            word_id: wordId,
            word,
            start_time: new Date().toISOString(),
            guesses: [],
            hints_revealed: [],
            completed: false,
            won: false
        };
        this.gameSessions[session.id] = session;
        return session;
    }
    async getUserStats(username) {
        return {
            success: true,
            data: {
                username,
                games_played: 0,
                games_won: 0,
                average_guesses: 0,
                average_time: 0,
                current_streak: 0,
                longest_streak: 0,
                last_played_at: new Date().toISOString()
            }
        };
    }
}
//# sourceMappingURL=MockClient.js.map