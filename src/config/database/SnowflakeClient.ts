import { connectionManager } from '../snowflake.js';
import { DatabaseClient, Word, LeaderboardEntry, UserStats, DailyMetrics, StreakLeader, DailyStatsResponse, DailyLeaderboardResponse } from './index.js';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from 'snowflake-sdk';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QUERIES, TABLES, COLUMNS } from './queries.js';
import NodeCache from 'node-cache';

// Cache configuration
const CACHE_TTL = 300; // 5 minutes
const cache = new NodeCache({ stdTTL: CACHE_TTL });

interface DeleteResult {
  affected_rows: number;
}

export class SnowflakeClient implements DatabaseClient {
  private connection = connectionManager;
  private readonly serviceName = 'SnowflakeClient';

  async connect(): Promise<void> {
    await this.connection.getConnection();
  }

  async disconnect(): Promise<void> {
    await this.connection.cleanup();
  }

  // Word methods
  async getWords(): Promise<Word[]> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<Word>(`
        SELECT 
          ID as wordId,
          WORD as word,
          DEFINITION as definition,
          PART_OF_SPEECH as partOfSpeech
        FROM WORDS
        ORDER BY CREATED_AT DESC;
      `, [], connection);
      return result;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getWord(id: string): Promise<Word | null> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<Word>(`
        SELECT 
          ID as wordId,
          WORD as word,
          DEFINITION as definition,
          PART_OF_SPEECH as partOfSpeech
        FROM WORDS
        WHERE ID = ?;
      `, [id], connection);
      return result[0] || null;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<Word>(`
        INSERT INTO WORDS (WORD, DEFINITION, PART_OF_SPEECH, CREATED_AT)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP())
        RETURNING ID as wordId, WORD as word, DEFINITION as definition, PART_OF_SPEECH as partOfSpeech;
      `, [word.word, word.definition, word.partOfSpeech], connection);
      return result[0];
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const connection = await this.connection.getConnection();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (word.word) {
        updates.push('WORD = ?');
        values.push(word.word);
      }
      if (word.definition) {
        updates.push('DEFINITION = ?');
        values.push(word.definition);
      }
      if (word.partOfSpeech) {
        updates.push('PART_OF_SPEECH = ?');
        values.push(word.partOfSpeech);
      }
      
      values.push(id);
      
      const result = await this.connection.executeQuery<Word>(`
        UPDATE WORDS
        SET ${updates.join(', ')}
        WHERE ID = ?
        RETURNING ID as wordId, WORD as word, DEFINITION as definition, PART_OF_SPEECH as partOfSpeech;
      `, values, connection);
      
      if (!result.length) {
        throw new Error('Word not found');
      }
      
      return result[0];
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async deleteWord(id: string): Promise<void> {
    const connection = await this.connection.getConnection();
    try {
      await this.connection.executeQuery(`
        DELETE FROM WORDS
        WHERE ID = ?;
      `, [id], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async searchWords(query: string): Promise<Word[]> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<Word>(`
        SELECT 
          ID as wordId,
          WORD as word,
          DEFINITION as definition,
          PART_OF_SPEECH as partOfSpeech
        FROM WORDS
        WHERE WORD ILIKE ? OR DEFINITION ILIKE ?;
      `, [`%${query}%`, `%${query}%`], connection);
      return result;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getRandomWord(): Promise<Word> {
    console.log('[SnowflakeClient.getRandomWord] Attempting to fetch random word');
    let connection: Connection | null = null;
    try {
      connection = await this.connection.getConnection();
      console.log('[SnowflakeClient.getRandomWord] Successfully obtained database connection');

      // Check if we're in testing mode
      const isTestingMode = process.env.TESTING_MODE === 'true';
      
      // Use a different query based on testing mode
      const query = isTestingMode
        ? `
          SELECT 
            ID as wordId,
            WORD as word,
            DEFINITION as definition,
            PART_OF_SPEECH as partOfSpeech
          FROM WORDS
          ORDER BY RANDOM()
          LIMIT 1;
        `
        : `
          SELECT 
            ID as wordId,
            WORD as word,
            DEFINITION as definition,
            PART_OF_SPEECH as partOfSpeech
          FROM WORDS
          WHERE DATE(CREATED_AT) = CURRENT_DATE()
          ORDER BY RANDOM()
          LIMIT 1;
        `;

      console.log(`[SnowflakeClient.getRandomWord] Running in ${isTestingMode ? 'TESTING' : 'PRODUCTION'} mode`);
      
      const result = await this.connection.executeQuery<Word>(query, [], connection);

      console.log('[SnowflakeClient.getRandomWord] Query executed:', {
        resultCount: result.length,
        hasResults: result.length > 0
      });

      if (!result.length) {
        // If no words found for today in production mode, fall back to any random word
        if (!isTestingMode) {
          console.log('[SnowflakeClient.getRandomWord] No words found for today, falling back to any random word');
          const fallbackResult = await this.connection.executeQuery<Word>(`
            SELECT 
              ID as wordId,
              WORD as word,
              DEFINITION as definition,
              PART_OF_SPEECH as partOfSpeech
            FROM WORDS
            ORDER BY RANDOM()
            LIMIT 1;
          `, [], connection);
          
          if (fallbackResult.length) {
            return fallbackResult[0];
          }
        }
        
        console.error('[SnowflakeClient.getRandomWord] No words found');
        throw new Error('No words available');
      }

      console.log('[SnowflakeClient.getRandomWord] Successfully fetched word:', {
        wordId: result[0].wordId,
        hasDefinition: !!result[0].definition,
        hasPartOfSpeech: !!result[0].partOfSpeech
      });

      return result[0];
    } catch (error) {
      console.error('[SnowflakeClient.getRandomWord] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        connectionState: connection ? 'obtained' : 'not obtained'
      });
      throw error;
    } finally {
      if (connection) {
        console.log('[SnowflakeClient.getRandomWord] Releasing database connection');
        await this.connection.releaseConnection(connection);
      }
    }
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<LeaderboardEntry>(`
        SELECT 
          id,
          username,
          word,
          guesses,
          completion_time_seconds,
          used_hint,
          completed,
          created_at
        FROM LEADERBOARD
        ORDER BY guesses ASC, completion_time_seconds ASC;
      `, [], connection);
      return result;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
    const connection = await this.connection.getConnection();
    try {
      // Get today's leaderboard entries
      const entries = await this.connection.executeQuery<LeaderboardEntry>(`
        SELECT 
          id,
          username,
          word,
          guesses,
          completion_time_seconds,
          used_hint,
          completed,
          created_at
        FROM LEADERBOARD
        WHERE DATE(created_at) = CURRENT_DATE()
        ORDER BY guesses ASC, completion_time_seconds ASC
        LIMIT 100;
      `, [], connection);

      let userStats: UserStats | undefined;
      let userRank: number | undefined;

      if (userEmail) {
        // Get user stats
        const stats = await this.connection.executeQuery<UserStats>(`
          SELECT 
            games_played,
            average_guesses,
            average_time,
            best_time,
            current_streak,
            longest_streak,
            top_ten_count,
            last_result,
            last_updated
          FROM USER_STATS
          WHERE username = ?;
        `, [userEmail], connection);
        userStats = stats[0];

        // Calculate user rank
        const rank = await this.connection.executeQuery<{ rank: number }>(`
          WITH ranked_entries AS (
            SELECT 
              username,
              ROW_NUMBER() OVER (
                ORDER BY guesses ASC, completion_time_seconds ASC
              ) as rank
            FROM LEADERBOARD
            WHERE DATE(created_at) = CURRENT_DATE()
          )
          SELECT rank
          FROM ranked_entries
          WHERE username = ?;
        `, [userEmail], connection);
        userRank = rank[0]?.rank;
      }

      return {
        entries,
        userStats,
        userRank
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void> {
    const connection = await this.connection.getConnection();
    try {
      const id = uuidv4();
      await this.connection.executeQuery(`
        INSERT INTO LEADERBOARD (
          id,
          username,
          word,
          guesses,
          completion_time_seconds,
          used_hint,
          completed,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        id,
        entry.username,
        entry.word,
        entry.guesses,
        entry.completion_time_seconds,
        entry.used_hint,
        entry.completed,
        entry.created_at
      ], connection);
      await this.updateUserStats(entry.username);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getLeaderboardRank(gameId: string): Promise<number> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<{ rank: number }>(`
        WITH ranked_entries AS (
          SELECT 
            id,
            ROW_NUMBER() OVER (
              ORDER BY guesses ASC, completion_time_seconds ASC
            ) as rank
          FROM LEADERBOARD
          WHERE DATE(created_at) = CURRENT_DATE()
        )
        SELECT rank
        FROM ranked_entries
        WHERE id = ?;
      `, [gameId], connection);
      return result[0]?.rank || 0;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async updateUserStats(username: string): Promise<void> {
    const connection = await this.connection.getConnection();
    try {
      // Get current user stats
      const stats = await this.connection.executeQuery<{
        current_streak: number;
        longest_streak: number;
        last_result: string;
      }>(`
        SELECT 
          current_streak,
          longest_streak,
          last_result
        FROM USER_STATS
        WHERE username = ?;
      `, [username], connection);

      const currentStats = stats[0] || {
        current_streak: 0,
        longest_streak: 0,
        last_result: null
      };

      let newCurrentStreak = currentStats.current_streak;
      let newLongestStreak = currentStats.longest_streak;

      // If user won, increment current streak and update longest if needed
      newCurrentStreak++;
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      // Update user stats
      await this.connection.executeQuery(`
        MERGE INTO USER_STATS
        USING (SELECT ? as username) AS src
        ON USER_STATS.username = src.username
        WHEN MATCHED THEN
          UPDATE SET
            current_streak = ?,
            longest_streak = ?,
            last_result = ?,
            last_updated = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (username, current_streak, longest_streak, last_result)
          VALUES (?, ?, ?, ?);
      `, [
        username,
        newCurrentStreak,
        newLongestStreak,
        'win',
        username,
        newCurrentStreak,
        newLongestStreak,
        'win'
      ], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Stats methods
  async getDailyStats(): Promise<DailyStatsResponse> {
    const connection = await this.connection.getConnection();
    try {
      // Get today's metrics with rounded averages
      const metrics = await this.connection.executeQuery<DailyMetrics>(`
        SELECT 
          COUNT(*) as total_plays,
          COUNT(DISTINCT username) as unique_users,
          ROUND(AVG(guesses), 1) as avg_guesses,
          ROUND(AVG(completion_time_seconds), 1) as avg_completion_time
        FROM LEADERBOARD
        WHERE DATE(created_at) = CURRENT_DATE();
      `, [], connection);

      // Get streak leaders sorted by current_streak and longest_streak
      const streakLeaders = await this.connection.executeQuery<StreakLeader>(`
        SELECT 
          username,
          current_streak,
          longest_streak
        FROM USER_STATS
        WHERE current_streak > 0
        ORDER BY current_streak DESC, longest_streak DESC
        LIMIT 10;
      `, [], connection);

      return {
        metrics: metrics[0] || {
          total_plays: 0,
          unique_users: 0,
          avg_guesses: 0.0,
          avg_completion_time: 0.0
        },
        streakLeaders
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    const connection = await this.connection.getConnection();
    try {
      const metrics = await this.connection.executeQuery<DailyMetrics>(`
        SELECT 
          COUNT(*) as total_plays,
          COUNT(DISTINCT username) as unique_users,
          ROUND(AVG(guesses), 1) as avg_guesses,
          ROUND(AVG(completion_time_seconds), 1) as avg_completion_time
        FROM LEADERBOARD
        WHERE DATE(created_at) = CURRENT_DATE();
      `, [], connection);

      return metrics[0] || {
        total_plays: 0,
        unique_users: 0,
        avg_guesses: 0.0,
        avg_completion_time: 0.0
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getTopStreaks(limit: number): Promise<StreakLeader[]> {
    const connection = await this.connection.getConnection();
    try {
      return await this.connection.executeQuery<StreakLeader>(`
        SELECT 
          username,
          current_streak,
          longest_streak
        FROM USER_STATS
        WHERE current_streak > 0
        ORDER BY current_streak DESC, longest_streak DESC
        LIMIT ?;
      `, [limit], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getUserStats(username: string): Promise<UserStats> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<UserStats>(`
        SELECT 
          games_played,
          average_guesses,
          average_time,
          best_time,
          current_streak,
          longest_streak,
          top_ten_count,
          last_result,
          last_updated
        FROM USER_STATS
        WHERE username = ?;
      `, [username], connection);

      if (!result.length) {
        return {
          games_played: 0,
          average_guesses: 0,
          average_time: 0,
          best_time: 0,
          current_streak: 0,
          longest_streak: 0,
          top_ten_count: 0,
          last_result: 'loss',
          last_updated: new Date().toISOString()
        };
      }

      return result[0];
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Auth methods
  async authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; user: { email: string; id: string } }> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<{ id: string; email: string; password: string }>(`
        SELECT 
          ID as id,
          EMAIL as email,
          PASSWORD as password
        FROM USERS
        WHERE EMAIL = ?;
      `, [credentials.email], connection);

      if (!result.length) {
        throw new Error('Invalid credentials');
      }

      const user = result[0];
      const isValid = await bcrypt.compare(credentials.password, user.password);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          email: user.email,
          id: user.id
        }
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<{ id: string; email: string }>(`
        SELECT 
          ID as id,
          EMAIL as email
        FROM USERS
        WHERE EMAIL = ?;
      `, [email], connection);

      return result[0] || null;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  /**
   * Mark a word as used, incrementing its usage count and updating its last used date
   * @param wordId The ID of the word to mark as used
   */
  async markAsUsed(wordId: string): Promise<void> {
    const connection = await this.connection.getConnection();
    
    try {
      console.log(`[SnowflakeClient.markAsUsed] Marking word ${wordId} as used`);
      
      await this.connection.executeQuery(`
        UPDATE WORDS 
        SET 
          TIMES_USED = COALESCE(TIMES_USED, 0) + 1,
          LAST_USED_DATE = CURRENT_TIMESTAMP(),
          UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID = ?
      `, [wordId], connection);
      
      console.log(`[SnowflakeClient.markAsUsed] Successfully marked word ${wordId} as used`);
    } catch (error) {
      console.error('[SnowflakeClient.markAsUsed] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        wordId
      });
      throw new Error(`Failed to mark word as used in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Admin methods for database management
  /**
   * Get database information including version, current context, and table count
   * @returns Database information object
   */
  async getDatabaseInfo(): Promise<{
    version: string;
    database: string;
    schema: string;
    warehouse: string;
    tableCount: number;
  }> {
    const connection = await this.connection.getConnection();
    try {
      // Get current version
      const versionRows = await this.connection.executeQuery<{ VERSION: string }>('SELECT CURRENT_VERSION() AS VERSION', [], connection);
      
      // Get current database context
      const dbRows = await this.connection.executeQuery<{ 
        DATABASE: string;
        SCHEMA: string;
        WAREHOUSE: string;
      }>('SELECT CURRENT_DATABASE() AS DATABASE, CURRENT_SCHEMA() AS SCHEMA, CURRENT_WAREHOUSE() AS WAREHOUSE', 
      [], connection);
      
      // Get table count
      const tableRows = await this.connection.executeQuery<{ name: string }[]>('SHOW TABLES', [], connection);
      
      return {
        version: versionRows[0].VERSION,
        database: dbRows[0].DATABASE,
        schema: dbRows[0].SCHEMA,
        warehouse: dbRows[0].WAREHOUSE,
        tableCount: tableRows.length
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
  
  /**
   * Get a list of all tables in the database
   * @returns Array of table names
   */
  async listTables(): Promise<string[]> {
    const connection = await this.connection.getConnection();
    try {
      const rows = await this.connection.executeQuery<{ name: string }>('SHOW TABLES', [], connection);
      return rows.map(row => row.name);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
  
  /**
   * Count the number of rows in a specific table
   * @param tableName The name of the table to count rows in
   * @returns The row count
   */
  async countTableRows(tableName: string): Promise<number> {
    const connection = await this.connection.getConnection();
    try {
      const rows = await this.connection.executeQuery<{ COUNT: number }>(`SELECT COUNT(*) AS COUNT FROM ${tableName}`, [], connection);
      return rows[0].COUNT;
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
  
  /**
   * Get a sample of rows from a specific table
   * @param tableName The name of the table to sample
   * @param limit The maximum number of rows to return
   * @returns Array of row objects
   */
  async getSampleTableData(tableName: string, limit: number = 5): Promise<Record<string, any>[]> {
    const connection = await this.connection.getConnection();
    try {
      return await this.connection.executeQuery(`SELECT * FROM ${tableName} LIMIT ${limit}`, [], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
  
  /**
   * Get the structure of a specific table
   * @param tableName The name of the table to describe
   * @returns Array of column descriptors
   */
  async describeTable(tableName: string): Promise<{ name: string; type: string }[]> {
    const connection = await this.connection.getConnection();
    try {
      return await this.connection.executeQuery<{ name: string; type: string }>(`DESCRIBE TABLE ${tableName}`, [], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
  
  /**
   * Setup required tables and indexes for the application
   * Will create tables if they don't exist, but won't overwrite data
   * @param importInitialWords Whether to import initial words data
   */
  async setupTables(importInitialWords: boolean = false): Promise<void> {
    const connection = await this.connection.getConnection();
    try {
      // Create WORDS table if it doesn't exist
      await this.connection.executeQuery(`
        CREATE TABLE IF NOT EXISTS WORDS (
          ID VARCHAR(36) PRIMARY KEY,
          WORD VARCHAR(255) NOT NULL,
          PART_OF_SPEECH VARCHAR(50) NOT NULL,
          DEFINITION TEXT NOT NULL,
          ALTERNATE_DEFINITION TEXT,
          SYNONYMS TEXT,
          LETTER_COUNT INT,
          LETTER_COUNT_DISPLAY VARCHAR(255),
          TIMES_USED INT DEFAULT 0,
          LAST_USED_DATE TIMESTAMP_NTZ,
          CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
          UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
      `, [], connection);
      
      // Create performance indexes if they don't exist
      try {
        await this.connection.executeQuery(
          `CREATE INDEX IF NOT EXISTS idx_streaks ON USER_STATS (current_streak DESC, longest_streak DESC)`,
          [],
          connection
        );
      } catch (error) {
        console.log('Note: USER_STATS index may already exist or table not created yet.');
      }
      
      try {
        await this.connection.executeQuery(
          `CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON LEADERBOARD (created_at DESC)`,
          [],
          connection
        );
      } catch (error) {
        console.log('Note: LEADERBOARD index may already exist or table not created yet.');
      }
      
      try {
        await this.connection.executeQuery(
          `CREATE INDEX IF NOT EXISTS idx_metrics_date ON PLATFORM_METRICS (date DESC, timezone)`,
          [],
          connection
        );
      } catch (error) {
        console.log('Note: PLATFORM_METRICS index may already exist or table not created yet.');
      }
      
      // We don't import initial words here as that's a separate responsibility
      // and could accidentally overwrite existing data
      
      // Return the count of words in the database
      const result = await this.connection.executeQuery<{ count: number }>(`
        SELECT COUNT(*) as count FROM WORDS;
      `, [], connection);
      
      console.log('Total words in database:', result[0].count);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Add a general query method for direct SQL execution
  async executeQuery<T = any>(query: string, params: any[] = [], useConnection?: Connection): Promise<T[]> {
    const connection = useConnection || await this.connection.getConnection();
    const shouldRelease = !useConnection;
    try {
      return await this.connection.executeQuery<T>(query, params, connection);
    } finally {
      if (shouldRelease) {
        await this.connection.releaseConnection(connection);
      }
    }
  }

  // Record a game metric
  async saveGameMetric(metric: {
    gameId: string;
    userId: string;
    wordId: string;
    guess: string;
    isCorrect: boolean;
    isFuzzy: boolean;
    guessNumber: number;
    guessTimeSeconds: number;
    hintsUsed: number;
  }): Promise<void> {
    const connection = await this.connection.getConnection();
    try {
      await this.connection.executeQuery(`
        INSERT INTO GAME_METRICS (
          ID, GAME_ID, USER_ID, WORD_ID, GUESS, IS_CORRECT, IS_FUZZY, 
          GUESS_NUMBER, GUESS_TIME_SECONDS, HINTS_USED, CREATED_AT
        ) VALUES (UUID_STRING(), ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
      `, [
        metric.gameId,
        metric.userId,
        metric.wordId,
        metric.guess,
        metric.isCorrect,
        metric.isFuzzy,
        metric.guessNumber,
        metric.guessTimeSeconds,
        metric.hintsUsed
      ], connection);
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Get fuzzy guess metrics for a given word
  async getFuzzyGuessMetrics(wordId: string): Promise<{
    totalFuzzyGuesses: number;
    avgGuessNumber: number;
    uniqueUsers: number;
  }> {
    const connection = await this.connection.getConnection();
    try {
      const result = await this.connection.executeQuery<{
        TOTAL_FUZZY_GUESSES: number;
        AVG_GUESS_NUMBER: number;
        UNIQUE_USERS: number;
      }>(`
        SELECT 
          TOTAL_FUZZY_GUESSES,
          AVG_GUESS_NUMBER,
          UNIQUE_USERS
        FROM FUZZY_GUESS_ANALYSIS
        WHERE WORD_ID = ?
      `, [wordId], connection);

      if (!result.length) {
        return {
          totalFuzzyGuesses: 0,
          avgGuessNumber: 0,
          uniqueUsers: 0
        };
      }

      return {
        totalFuzzyGuesses: result[0].TOTAL_FUZZY_GUESSES,
        avgGuessNumber: result[0].AVG_GUESS_NUMBER,
        uniqueUsers: result[0].UNIQUE_USERS
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }

  // Get performance metrics for all players
  async getPlayerPerformanceMetrics(): Promise<{
    fastestPlayers: { username: string; avgTimeSeconds: number; gamesPlayed: number }[];
    fewestGuessesPlayers: { username: string; avgGuesses: number; gamesPlayed: number }[];
    leastHintsPlayers: { username: string; avgHintsUsed: number; gamesPlayed: number }[];
  }> {
    const connection = await this.connection.getConnection();
    try {
      // Get fastest players
      const fastestPlayers = await this.connection.executeQuery<{
        USERNAME: string;
        AVG_TIME: number;
        GAMES_PLAYED: number;
      }>(`
        SELECT 
          USERNAME,
          AVG(COMPLETION_TIME_SECONDS) AS AVG_TIME,
          COUNT(*) AS GAMES_PLAYED
        FROM LEADERBOARD
        WHERE COMPLETED = TRUE
        GROUP BY USERNAME
        HAVING COUNT(*) >= 5
        ORDER BY AVG_TIME ASC
        LIMIT 10
      `, [], connection);

      // Get players with fewest guesses
      const fewestGuessesPlayers = await this.connection.executeQuery<{
        USERNAME: string;
        AVG_GUESSES: number;
        GAMES_PLAYED: number;
      }>(`
        SELECT 
          USERNAME,
          AVG(GUESSES) AS AVG_GUESSES,
          COUNT(*) AS GAMES_PLAYED
        FROM LEADERBOARD
        WHERE COMPLETED = TRUE
        GROUP BY USERNAME
        HAVING COUNT(*) >= 5
        ORDER BY AVG_GUESSES ASC
        LIMIT 10
      `, [], connection);

      // Get players who use fewest hints
      const leastHintsPlayers = await this.connection.executeQuery<{
        USERNAME: string;
        AVG_HINTS: number;
        GAMES_PLAYED: number;
      }>(`
        WITH user_hints AS (
          SELECT 
            USER_ID AS USERNAME,
            GAME_ID,
            MAX(HINTS_USED) AS HINTS_USED
          FROM GAME_METRICS
          GROUP BY USER_ID, GAME_ID
        )
        SELECT
          USERNAME,
          AVG(HINTS_USED) AS AVG_HINTS,
          COUNT(DISTINCT GAME_ID) AS GAMES_PLAYED
        FROM user_hints
        GROUP BY USERNAME
        HAVING COUNT(DISTINCT GAME_ID) >= 5
        ORDER BY AVG_HINTS ASC
        LIMIT 10
      `, [], connection);

      return {
        fastestPlayers: fastestPlayers.map(p => ({
          username: p.USERNAME,
          avgTimeSeconds: p.AVG_TIME,
          gamesPlayed: p.GAMES_PLAYED
        })),
        fewestGuessesPlayers: fewestGuessesPlayers.map(p => ({
          username: p.USERNAME,
          avgGuesses: p.AVG_GUESSES,
          gamesPlayed: p.GAMES_PLAYED
        })),
        leastHintsPlayers: leastHintsPlayers.map(p => ({
          username: p.USERNAME,
          avgHintsUsed: p.AVG_HINTS,
          gamesPlayed: p.GAMES_PLAYED
        }))
      };
    } finally {
      await this.connection.releaseConnection(connection);
    }
  }
} 