// ✅ This is the official SupabaseClient used across Un-Define
// Implements the DatabaseClient interface from shared/types.ts
// Do not duplicate this file — update here only
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
export class SupabaseClient {
    client;
    static instance;
    constructor(supabaseUrl, supabaseKey) {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }
        this.client = createClient(supabaseUrl, supabaseKey);
    }
    static getInstance() {
        if (!SupabaseClient.instance) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase environment variables');
            }
            SupabaseClient.instance = new SupabaseClient(supabaseUrl, supabaseKey);
        }
        return SupabaseClient.instance;
    }
    async connect() {
        try {
            await this.client.auth.getSession();
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONNECTION_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to connect'
                }
            };
        }
    }
    async disconnect() {
        return { success: true };
    }
    async getRandomWord() {
        try {
            const { data, error } = await this.client
                .from('words')
                .select('*')
                .order('RANDOM()')
                .limit(1)
                .single();
            if (error || !data) {
                throw new Error('Failed to fetch random word');
            }
            // Convert database row to WordData format
            return {
                success: true,
                data: {
                    id: data.id,
                    word: data.word,
                    definition: data.definition,
                    etymology: data.etymology,
                    first_letter: data.first_letter || data.word.charAt(0),
                    in_a_sentence: data.in_a_sentence,
                    number_of_letters: data.number_of_letters || data.word.length,
                    equivalents: data.equivalents ? data.equivalents.join(', ') : null,
                    difficulty: data.difficulty || 'Medium',
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    clues: {
                        D: data.definition,
                        E: data.etymology,
                        F: data.first_letter || data.word.charAt(0),
                        I: data.in_a_sentence,
                        N: data.number_of_letters || data.word.length,
                        E2: data.equivalents ? data.equivalents.join(', ') : null
                    }
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'WORD_FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch word'
                }
            };
        }
    }
    async getDailyWord() {
        return this.getRandomWord();
    }
    async processGuess(gameId, guess, session) {
        try {
            // Get the word from the database
            const { data: word, error } = await this.client
                .from('words')
                .select('*')
                .eq('id', session.wordId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
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
            const gameOver = isCorrect || (session.guessesUsed || 0) >= 6;
            // Update game session
            const { error: updateError } = await this.client
                .from('game_sessions')
                .update({
                guesses: [...(session.guesses || []), guess],
                guesses_used: (session.guessesUsed || 0) + 1,
                is_complete: gameOver,
                is_won: isCorrect,
                end_time: gameOver ? new Date().toISOString() : undefined
            })
                .eq('id', gameId);
            if (updateError) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: updateError.message,
                        details: updateError
                    }
                };
            }
            return {
                success: true,
                data: {
                    isCorrect,
                    guess,
                    isFuzzy: false,
                    fuzzyPositions: [],
                    gameOver,
                    correctWord: gameOver ? word.word : undefined
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to process guess',
                    details: error
                }
            };
        }
    }
    async getUserStats(username) {
        try {
            const { data: stats, error } = await this.client
                .from('user_stats')
                .select('*')
                .eq('username', username)
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            if (!stats) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: true,
                data: {
                    username: stats.username,
                    gamesPlayed: stats.games_played,
                    gamesWon: stats.games_won,
                    averageGuesses: stats.average_guesses,
                    averageTime: stats.average_time,
                    currentStreak: stats.current_streak,
                    longestStreak: stats.longest_streak,
                    lastPlayedAt: stats.last_played_at
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get user stats',
                    details: error
                }
            };
        }
    }
    async updateUserStats(username, won, guessesUsed, timeTaken) {
        try {
            const { error } = await this.client
                .from('user_stats')
                .upsert({
                username,
                games_played: 1,
                games_won: won ? 1 : 0,
                average_guesses: guessesUsed,
                average_time: timeTaken,
                current_streak: won ? 1 : 0,
                longest_streak: won ? 1 : 0,
                last_played_at: new Date().toISOString()
            });
            if (error)
                throw error;
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    async getGameSession(gameId) {
        try {
            const { data: session, error } = await this.client
                .from('game_sessions')
                .select('*')
                .eq('id', gameId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            if (!session) {
                return {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Game session not found'
                    }
                };
            }
            return {
                success: true,
                data: {
                    id: session.id,
                    userId: session.user_id,
                    wordId: session.word_id,
                    word: session.word,
                    startTime: session.start_time,
                    endTime: session.end_time || undefined,
                    guesses: session.guesses || [],
                    hintsRevealed: session.revealed_clues || [],
                    completed: session.is_complete,
                    won: session.is_won,
                    guessesUsed: session.guesses_used,
                    revealedClues: session.revealed_clues,
                    isComplete: session.is_complete,
                    isWon: session.is_won,
                    state: session.state
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get game session',
                    details: error
                }
            };
        }
    }
    async startGame() {
        try {
            // Get a random word
            const wordResult = await this.getRandomWord();
            if (!wordResult.success || !wordResult.data) {
                return {
                    success: false,
                    error: {
                        code: 'WORD_ERROR',
                        message: 'Failed to get random word',
                        details: wordResult.error
                    }
                };
            }
            const word = wordResult.data;
            // Create a new game session
            const { data: session, error } = await this.client
                .from('game_sessions')
                .insert({
                id: randomUUID(),
                user_id: 'anonymous', // TODO: Replace with actual user ID
                word_id: word.id,
                word: word.word,
                start_time: new Date().toISOString(),
                guesses: [],
                guesses_used: 0,
                revealed_clues: [],
                is_complete: false,
                is_won: false,
                state: 'active'
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return {
                success: true,
                data: {
                    id: session.id,
                    userId: session.user_id,
                    wordId: session.word_id,
                    word: session.word,
                    startTime: session.start_time,
                    endTime: session.end_time || undefined,
                    guesses: session.guesses || [],
                    hintsRevealed: session.revealed_clues || [],
                    completed: session.is_complete,
                    won: session.is_won,
                    guessesUsed: session.guesses_used,
                    revealedClues: session.revealed_clues,
                    isComplete: session.is_complete,
                    isWon: session.is_won,
                    state: session.state
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to start game',
                    details: error
                }
            };
        }
    }
    async getClue(session, clueType) {
        try {
            const { data: word, error } = await this.client
                .from('words')
                .select('*')
                .eq('id', session.wordId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            if (!word) {
                return {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Word not found'
                    }
                };
            }
            let clue = null;
            switch (clueType) {
                case 'D':
                    clue = word.definition;
                    break;
                case 'E':
                    clue = word.etymology;
                    break;
                case 'F':
                    clue = word.first_letter;
                    break;
                case 'I':
                    clue = word.in_a_sentence;
                    break;
                case 'N':
                    clue = word.number_of_letters?.toString() || null;
                    break;
                case 'E2':
                    clue = word.equivalents?.join(', ') || null;
                    break;
            }
            if (!clue) {
                return {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Clue not found'
                    }
                };
            }
            return {
                success: true,
                data: clue
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get clue',
                    details: error
                }
            };
        }
    }
    async endGame(gameId, won) {
        try {
            const { error } = await this.client
                .from('game_sessions')
                .update({
                is_complete: true,
                is_won: won,
                end_time: new Date().toISOString()
            })
                .eq('id', gameId);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to end game',
                    details: error
                }
            };
        }
    }
    async getUserByUsername(username) {
        try {
            const { data: user, error } = await this.client
                .from('users')
                .select('*')
                .eq('username', username)
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            if (!user) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email || undefined,
                    created_at: user.created_at,
                    last_login: user.last_login || undefined
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get user',
                    details: error
                }
            };
        }
    }
    async createUser(username) {
        try {
            const { data: user, error } = await this.client
                .from('users')
                .insert({
                id: randomUUID(),
                username,
                created_at: new Date().toISOString()
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email || undefined,
                    created_at: user.created_at,
                    last_login: user.last_login || undefined
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to create user',
                    details: error
                }
            };
        }
    }
    async getNextHint(gameId) {
        try {
            const { data: sessionData, error: sessionError } = await this.client
                .from('game_sessions')
                .select('*')
                .eq('id', gameId)
                .single();
            if (sessionError || !sessionData) {
                throw new Error('Game session not found');
            }
            const { data: wordData, error: wordError } = await this.client
                .from('words')
                .select('*')
                .eq('id', sessionData.word_id)
                .single();
            if (wordError || !wordData) {
                throw new Error('Word not found');
            }
            return {
                success: true,
                data: wordData.definition
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'HINT_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    async submitScore(gameId, score) {
        try {
            const { error } = await this.client
                .from('game_sessions')
                .update({ score })
                .eq('id', gameId);
            if (error) {
                throw error;
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SCORE_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to submit score'
                }
            };
        }
    }
    async checkGuess(wordId, guess) {
        try {
            const { data, error } = await this.client
                .from('words')
                .select('word')
                .eq('id', wordId)
                .single();
            if (error) {
                throw error;
            }
            return data.word.toLowerCase() === guess.toLowerCase();
        }
        catch (error) {
            console.error('Error in checkGuess:', error);
            throw error;
        }
    }
    async getLeaderboard(limit) {
        try {
            const { data, error } = await this.client
                .from('game_sessions')
                .select(`
          id,
          user_id,
          word_id,
          word,
          guesses_used,
          end_time,
          start_time,
          users!user_id(username)
        `)
                .eq('is_complete', true)
                .eq('is_won', true)
                .order('guesses_used', { ascending: true })
                .order('end_time', { ascending: true })
                .limit(limit || 10);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return {
                success: true,
                data: data.map((entry, index) => ({
                    username: entry.users[0].username,
                    score: 100 - (entry.guesses_used * 10),
                    rank: index + 1,
                    wordId: entry.word_id,
                    word: entry.word,
                    timeTaken: new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime(),
                    guessesUsed: entry.guesses_used
                }))
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get leaderboard',
                    details: error
                }
            };
        }
    }
    async getTopStreaks(limit) {
        try {
            const { data, error } = await this.client
                .from('user_stats')
                .select('username, current_streak, longest_streak')
                .order('current_streak', { ascending: false })
                .limit(limit || 10);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return {
                success: true,
                data: data.map(entry => ({
                    username: entry.username,
                    currentStreak: entry.current_streak,
                    longestStreak: entry.longest_streak,
                    streak: entry.current_streak
                }))
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to get top streaks',
                    details: error
                }
            };
        }
    }
    async addLeaderboardEntry(entry) {
        try {
            const { error } = await this.client
                .from('game_sessions')
                .update({
                score: entry.score,
                guesses_used: entry.guessesUsed,
                end_time: new Date().toISOString()
            })
                .eq('word_id', entry.wordId);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to add leaderboard entry',
                    details: error
                }
            };
        }
    }
    async markAsUsed(wordId) {
        try {
            const { error } = await this.client
                .from('words')
                .update({ last_used: new Date().toISOString() })
                .eq('id', wordId);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'DB_ERROR',
                        message: error.message,
                        details: error
                    }
                };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'Failed to mark word as used',
                    details: error
                }
            };
        }
    }
    /**
     * Search for words using case-insensitive matching
     * @param query The search query (minimum 2 characters)
     * @returns A list of matching words
     */
    async searchWords(query) {
        try {
            if (!query || query.length < 2) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_QUERY',
                        message: 'Search query must be at least 2 characters long'
                    }
                };
            }
            const { data, error } = await this.client
                .from('words')
                .select('*')
                .ilike('word', `%${query}%`)
                .limit(20);
            if (error) {
                return {
                    success: false,
                    error: {
                        code: 'SEARCH_ERROR',
                        message: error.message
                    }
                };
            }
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UNEXPECTED_ERROR',
                    message: error instanceof Error ? error.message : 'An unexpected error occurred'
                }
            };
        }
    }
}
//# sourceMappingURL=SupabaseClient.js.map