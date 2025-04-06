import { Pool, PoolClient } from 'pg';
import {
  DatabaseClient,
  Word,
  LeaderboardEntry,
  UserStats,
  DailyLeaderboardResponse,
  User,
  UserCredentials,
  AuthResult,
  DailyMetrics,
  StreakLeader,
  DailyStatsResponse,
} from '../../config/database/types.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class PostgresClient implements DatabaseClient {
  private pool: Pool;
  private connected = false;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
    });
  }

  // Connection methods
  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      this.connected = true;
      console.log('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.connected = false;
      console.log('Disconnected from PostgreSQL database');
    } catch (error) {
      console.error('Failed to disconnect from PostgreSQL:', error);
      throw error;
    }
  }

  async initializeDatabase(): Promise<void> {
    await this.setupTables();
  }

  async setupTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create words table
      await client.query(`
        CREATE TABLE IF NOT EXISTS words (
          word_id TEXT PRIMARY KEY,
          word TEXT NOT NULL,
          definition TEXT NOT NULL,
          etymology TEXT,
          first_letter CHAR(1) NOT NULL,
          example_sentence TEXT,
          num_letters INTEGER NOT NULL,
          synonyms TEXT[],
          difficulty TEXT,
          times_used INTEGER DEFAULT 0,
          last_used_at TIMESTAMP,
          part_of_speech TEXT,
          is_plural BOOLEAN,
          num_syllables INTEGER
        )
      `);

      // Create daily_words table
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_words (
          date DATE PRIMARY KEY,
          word_id TEXT NOT NULL REFERENCES words(word_id)
        )
      `);

      // Create leaderboard table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leaderboard (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          word_id TEXT NOT NULL REFERENCES words(word_id),
          word TEXT NOT NULL,
          time_taken INTEGER NOT NULL,
          guesses_used INTEGER NOT NULL,
          fuzzy_matches INTEGER NOT NULL,
          hints_used INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_stats table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_stats (
          username TEXT PRIMARY KEY,
          games_played INTEGER NOT NULL DEFAULT 0,
          games_won INTEGER NOT NULL DEFAULT 0,
          current_streak INTEGER NOT NULL DEFAULT 0,
          longest_streak INTEGER NOT NULL DEFAULT 0,
          average_time FLOAT NOT NULL DEFAULT 0,
          average_guesses FLOAT NOT NULL DEFAULT 0,
          last_played_at TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Word methods
  async getWords(): Promise<Word[]> {
    const result = await this.pool.query<Word>('SELECT * FROM words');
    return result.rows.map(row => this.mapWordFromDB(row));
  }

  async getWord(wordId: string): Promise<Word | null> {
    const result = await this.pool.query<Word>('SELECT * FROM words WHERE word_id = $1', [wordId]);
    if (result.rows.length === 0) return null;
    return this.mapWordFromDB(result.rows[0]);
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    const wordId = Math.random().toString(36).substring(7);
    const result = await this.pool.query<Word>(
      `INSERT INTO words (
        word_id, word, definition, etymology, first_letter, example_sentence,
        num_letters, synonyms, difficulty, times_used, last_used_at,
        part_of_speech, is_plural, num_syllables
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        wordId,
        word.word,
        word.definition,
        word.etymology || null,
        word.firstLetter,
        word.exampleSentence || null,
        word.numLetters,
        word.synonyms || null,
        word.difficulty || null,
        0,
        null,
        word.partOfSpeech || null,
        word.isPlural || false,
        word.numSyllables || null,
      ]
    );
    return this.mapWordFromDB(result.rows[0]);
  }

  async updateWord(wordId: string, update: Partial<Word>): Promise<Word> {
    const setClauses: string[] = [];
    const values: any[] = [wordId];
    let paramIndex = 2;

    if (update.word !== undefined) {
      setClauses.push(`word = $${paramIndex++}`);
      values.push(update.word);
    }
    if (update.definition !== undefined) {
      setClauses.push(`definition = $${paramIndex++}`);
      values.push(update.definition);
    }
    if (update.etymology !== undefined) {
      setClauses.push(`etymology = $${paramIndex++}`);
      values.push(update.etymology);
    }
    if (update.firstLetter !== undefined) {
      setClauses.push(`first_letter = $${paramIndex++}`);
      values.push(update.firstLetter);
    }
    if (update.exampleSentence !== undefined) {
      setClauses.push(`example_sentence = $${paramIndex++}`);
      values.push(update.exampleSentence);
    }
    if (update.numLetters !== undefined) {
      setClauses.push(`num_letters = $${paramIndex++}`);
      values.push(update.numLetters);
    }
    if (update.synonyms !== undefined) {
      setClauses.push(`synonyms = $${paramIndex++}`);
      values.push(update.synonyms);
    }
    if (update.difficulty !== undefined) {
      setClauses.push(`difficulty = $${paramIndex++}`);
      values.push(update.difficulty);
    }
    if (update.timesUsed !== undefined) {
      setClauses.push(`times_used = $${paramIndex++}`);
      values.push(update.timesUsed);
    }
    if (update.lastUsedAt !== undefined) {
      setClauses.push(`last_used_at = $${paramIndex++}`);
      values.push(update.lastUsedAt);
    }
    if (update.partOfSpeech !== undefined) {
      setClauses.push(`part_of_speech = $${paramIndex++}`);
      values.push(update.partOfSpeech);
    }
    if (update.isPlural !== undefined) {
      setClauses.push(`is_plural = $${paramIndex++}`);
      values.push(update.isPlural);
    }
    if (update.numSyllables !== undefined) {
      setClauses.push(`num_syllables = $${paramIndex++}`);
      values.push(update.numSyllables);
    }

    if (setClauses.length === 0) {
      return (await this.getWord(wordId))!;
    }

    const result = await this.pool.query<Word>(
      `UPDATE words SET ${setClauses.join(', ')} WHERE word_id = $1 RETURNING *`,
      values
    );
    return this.mapWordFromDB(result.rows[0]);
  }

  async deleteWord(wordId: string): Promise<void> {
    await this.pool.query('DELETE FROM words WHERE word_id = $1', [wordId]);
  }

  async searchWords(query: string): Promise<Word[]> {
    const result = await this.pool.query<Word>(
      'SELECT * FROM words WHERE word ILIKE $1 OR definition ILIKE $1',
      [`%${query}%`]
    );
    return result.rows.map(row => this.mapWordFromDB(row));
  }

  async getRandomWord(): Promise<Word | null> {
    const result = await this.pool.query<Word>('SELECT * FROM words ORDER BY RANDOM() LIMIT 1');
    if (result.rows.length === 0) return null;
    return this.mapWordFromDB(result.rows[0]);
  }

  async getDailyWord(date: string): Promise<Word | null> {
    const result = await this.pool.query<Word>(
      `SELECT w.* FROM words w
       JOIN daily_words dw ON w.word_id = dw.word_id
       WHERE dw.date = $1`,
      [date]
    );
    if (result.rows.length === 0) return null;
    return this.mapWordFromDB(result.rows[0]);
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO daily_words (date, word_id) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET word_id = $2',
      [date, wordId]
    );
  }

  async getNextUnusedWord(): Promise<Word | null> {
    const result = await this.pool.query<Word>(
      'SELECT * FROM words WHERE times_used = 0 OR times_used IS NULL ORDER BY RANDOM() LIMIT 1'
    );
    if (result.rows.length === 0) return null;
    return this.mapWordFromDB(result.rows[0]);
  }

  async markAsUsed(wordId: string): Promise<void> {
    await this.pool.query(
      'UPDATE words SET times_used = COALESCE(times_used, 0) + 1, last_used_at = CURRENT_TIMESTAMP WHERE word_id = $1',
      [wordId]
    );
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await this.pool.query(
      'SELECT * FROM leaderboard ORDER BY time_taken ASC'
    );
    return result.rows.map(this.mapLeaderboardEntryFromDB);
  }

  async getDailyLeaderboard(): Promise<DailyLeaderboardResponse> {
    const result = await this.pool.query(
      `SELECT 
        id,
        username,
        word_id as "wordId",
        word,
        time_taken as "timeTaken",
        guesses_used as "guessesUsed",
        fuzzy_matches as "fuzzyMatches",
        hints_used as "hintsUsed",
        created_at as "createdAt"
      FROM leaderboard
      WHERE DATE(created_at) = CURRENT_DATE
      ORDER BY time_taken ASC, guesses_used ASC`
    );

    const entries = result.rows.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    }));

    const userStats = await this.getUserStats(entries[0]?.username);

    return {
      entries,
      userRank: entries.length > 0 ? 1 : 0,
      userStats,
    };
  }

  async addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void> {
    await this.pool.query(
      `INSERT INTO leaderboard (
        username, word_id, word, time_taken,
        guesses_used, fuzzy_matches, hints_used, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        entry.username,
        entry.wordId,
        entry.word,
        entry.timeTaken,
        entry.guessesUsed,
        entry.fuzzyMatches,
        entry.hintsUsed
      ]
    );
  }

  async getLeaderboardRank(gameId: string): Promise<number | null> {
    const result = await this.pool.query(
      `SELECT COUNT(*) + 1 as rank
       FROM leaderboard
       WHERE DATE(created_at) = CURRENT_DATE
       AND (time_taken, guesses_used) < (
         SELECT time_taken, guesses_used
         FROM leaderboard
         WHERE id = $1
       )`,
      [gameId]
    );
    return result.rows[0]?.rank || null;
  }

  async addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>): Promise<void> {
    await this.pool.query(
      `INSERT INTO leaderboard (
        username, word_id, word, time_taken, guesses_used,
        fuzzy_matches, hints_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.username,
        entry.wordId,
        entry.word,
        entry.timeTaken,
        entry.guessesUsed,
        entry.fuzzyMatches,
        entry.hintsUsed
      ]
    );
  }

  // User stats methods
  async getUserStats(username: string): Promise<UserStats | null> {
    const result = await this.pool.query<UserStats>(
      'SELECT * FROM user_stats WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUserStatsFromDB(result.rows[0]);
  }

  async updateUserStats(
    username: string,
    won: boolean = false,
    guessCount: number = 0,
    timeTaken: number = 0
  ): Promise<UserStats> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current stats or create new ones
      let result = await client.query<UserStats>(
        'SELECT * FROM user_stats WHERE username = $1 FOR UPDATE',
        [username]
      );

      let stats: UserStats;
      if (result.rows.length === 0) {
        // Create new stats
        result = await client.query<UserStats>(
          `INSERT INTO user_stats (
            username, games_played, games_won, current_streak,
            longest_streak, average_time, average_guesses,
            last_played_at, updated_at
          ) VALUES ($1, 1, $2, $2, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [username, won ? 1 : 0, timeTaken, guessCount]
        );
        stats = this.mapUserStatsFromDB(result.rows[0]);
      } else {
        // Update existing stats
        const currentStats = this.mapUserStatsFromDB(result.rows[0]);
        const newGamesPlayed = currentStats.gamesPlayed + 1;
        const newGamesWon = currentStats.gamesWon + (won ? 1 : 0);
        const newCurrentStreak = won ? currentStats.currentStreak + 1 : 0;
        const newLongestStreak = Math.max(currentStats.longestStreak, newCurrentStreak);
        const newAverageTime = ((currentStats.averageTime * (newGamesPlayed - 1)) + timeTaken) / newGamesPlayed;
        const newAverageGuesses = ((currentStats.averageGuesses * (newGamesPlayed - 1)) + guessCount) / newGamesPlayed;

        result = await client.query<UserStats>(
          `UPDATE user_stats SET
            games_played = $2,
            games_won = $3,
            current_streak = $4,
            longest_streak = $5,
            average_time = $6,
            average_guesses = $7,
            last_played_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE username = $1
          RETURNING *`,
          [
            username,
            newGamesPlayed,
            newGamesWon,
            newCurrentStreak,
            newLongestStreak,
            newAverageTime,
            newAverageGuesses,
          ]
        );
        stats = this.mapUserStatsFromDB(result.rows[0]);
      }

      await client.query('COMMIT');
      return stats;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Stats operations
  async getDailyStats(): Promise<DailyStatsResponse> {
    const metricsResult = await this.pool.query<DailyMetrics>(
      `SELECT
        COUNT(*) as total_games,
        AVG(time_taken) as average_time,
        AVG(guesses_used) as average_guesses,
        COUNT(DISTINCT username) as unique_players,
        COUNT(CASE WHEN guesses_used > 0 THEN 1 END)::float / COUNT(*)::float as completion_rate
      FROM leaderboard
      WHERE DATE(created_at) = CURRENT_DATE`
    );

    const streakLeadersResult = await this.pool.query<StreakLeader>(
      `SELECT
        username,
        current_streak as streak
      FROM user_stats
      WHERE current_streak > 0
      ORDER BY current_streak DESC, last_played_at DESC
      LIMIT 10`
    );

    return {
      metrics: this.mapDailyMetricsFromDB(metricsResult.rows[0]),
      streakLeaders: streakLeadersResult.rows.map(row => this.mapStreakLeaderFromDB(row)),
    };
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    const result = await this.pool.query<DailyMetrics>(
      `SELECT
        COUNT(*) as total_games,
        AVG(time_taken) as average_time,
        AVG(guesses_used) as average_guesses,
        COUNT(DISTINCT username) as unique_players,
        COUNT(CASE WHEN guesses_used > 0 THEN 1 END)::float / COUNT(*)::float as completion_rate
      FROM leaderboard
      WHERE DATE(created_at) = CURRENT_DATE`
    );
    return this.mapDailyMetricsFromDB(result.rows[0]);
  }

  async getTopStreaks(limit: number): Promise<StreakLeader[]> {
    const result = await this.pool.query<StreakLeader>(
      `SELECT
        username,
        current_streak as streak
      FROM user_stats
      WHERE current_streak > 0
      ORDER BY current_streak DESC, last_played_at DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapStreakLeaderFromDB(row));
  }

  // Authentication methods
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    const result = await this.pool.query<User>(
      'SELECT id, email, username, created_at FROM users WHERE email = $1',
      [credentials.email]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = this.mapUserFromDB(result.rows[0]);
    return { success: true, user };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? this.mapUserFromDB(result.rows[0]) : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  // Helper methods
  private mapWordFromDB(row: any): Word {
    return {
      wordId: row.word_id,
      word: row.word,
      definition: row.definition,
      etymology: row.etymology,
      firstLetter: row.first_letter,
      exampleSentence: row.example_sentence,
      numLetters: row.num_letters,
      synonyms: row.synonyms,
      difficulty: row.difficulty,
      timesUsed: row.times_used || 0,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
      partOfSpeech: row.part_of_speech,
      isPlural: row.is_plural,
      numSyllables: row.num_syllables,
    };
  }

  private mapLeaderboardEntryFromDB(row: any): LeaderboardEntry {
    return {
      id: row.id,
      username: row.username,
      wordId: row.word_id,
      word: row.word,
      timeTaken: row.time_taken,
      guessesUsed: row.guesses_used,
      fuzzyMatches: row.fuzzy_matches,
      hintsUsed: row.hints_used,
      createdAt: row.created_at.toISOString()
    };
  }

  private mapUserStatsFromDB(row: any): UserStats {
    return {
      username: row.username,
      gamesPlayed: row.games_played,
      gamesWon: row.games_won,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      averageTime: row.average_time,
      averageGuesses: row.average_guesses,
      lastPlayedAt: row.last_played_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
  }

  private mapUserFromDB(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      createdAt: row.created_at.toISOString()
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private mapDailyMetricsFromDB(row: any): DailyMetrics {
    return {
      totalGames: parseInt(row.total_games) || 0,
      averageTime: parseFloat(row.average_time) || 0,
      averageGuesses: parseFloat(row.average_guesses) || 0,
      uniquePlayers: parseInt(row.unique_players) || 0,
      completionRate: parseFloat(row.completion_rate) || 0
    };
  }

  private mapStreakLeaderFromDB(row: any): StreakLeader {
    return {
      username: row.username,
      streak: parseInt(row.streak) || 0
    };
  }
} 