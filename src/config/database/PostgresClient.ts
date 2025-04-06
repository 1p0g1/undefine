import pg from 'pg';
const { Pool } = pg;
import type { 
  DatabaseClient, 
  Word, 
  LeaderboardEntry, 
  DailyLeaderboardResponse, 
  UserStats, 
  DailyStatsResponse,
  DailyMetrics,
  StreakLeader,
  User,
  UserCredentials,
  AuthResult
} from './types.js';

export class PostgresClient implements DatabaseClient {
  private pool: InstanceType<typeof Pool>;
  private connected: boolean;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    this.connected = false;
  }

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
    try {
      await this.setupTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async setupTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create words table
      await client.query(`
        CREATE TABLE IF NOT EXISTS words (
          word_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          word VARCHAR(255) NOT NULL,
          definition TEXT NOT NULL,
          etymology TEXT,
          first_letter CHAR(1) NOT NULL,
          example_sentence TEXT,
          num_letters INTEGER NOT NULL,
          synonyms TEXT[],
          difficulty VARCHAR(50),
          times_used INTEGER DEFAULT 0,
          last_used_at TIMESTAMP WITH TIME ZONE
        );
      `);

      // Create daily_words table
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_words (
          id SERIAL PRIMARY KEY,
          word_id UUID REFERENCES words(word_id),
          date DATE NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create leaderboard table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leaderboard (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) NOT NULL,
          word_id UUID REFERENCES words(word_id),
          word VARCHAR(255) NOT NULL,
          time_taken INTEGER NOT NULL,
          guesses_used INTEGER NOT NULL,
          fuzzy_matches INTEGER NOT NULL,
          hints_used INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create user_stats table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_stats (
          username VARCHAR(255) PRIMARY KEY,
          games_played INTEGER DEFAULT 0,
          games_won INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          average_time INTEGER DEFAULT 0,
          average_guesses FLOAT DEFAULT 0,
          last_played_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query('COMMIT');
      console.log('Tables created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getWords(): Promise<Word[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
        FROM words
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting words:', error);
      throw error;
    }
  }

  async getWord(wordId: string): Promise<Word | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
        FROM words 
        WHERE word_id = $1
      `, [wordId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting word:', error);
      throw error;
    }
  }

  async getRandomWord(): Promise<Word | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
        FROM words 
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting random word:', error);
      throw error;
    }
  }

  async getDailyWord(date: string): Promise<Word | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          w.word_id as "wordId",
          w.word,
          w.definition,
          w.etymology,
          w.first_letter as "firstLetter",
          w.example_sentence as "exampleSentence",
          w.num_letters as "numLetters",
          w.synonyms,
          w.difficulty,
          w.times_used as "timesUsed",
          w.last_used_at as "lastUsedAt"
        FROM words w
        JOIN daily_words dw ON w.word_id = dw.word_id
        WHERE dw.date = $1
      `, [date]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting daily word:', error);
      throw error;
    }
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO daily_words (word_id, date)
        VALUES ($1, $2)
        ON CONFLICT (date) DO UPDATE
        SET word_id = $1
      `, [wordId, date]);
      
      console.log(`Set daily word for ${date} to word ID ${wordId}`);
    } catch (error) {
      console.error('Error setting daily word:', error);
      throw error;
    }
  }

  async getNextUnusedWord(): Promise<Word | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
        FROM words w
        WHERE NOT EXISTS (
          SELECT 1 FROM daily_words dw WHERE dw.word_id = w.word_id
        )
        ORDER BY RANDOM()
        LIMIT 1
      `);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting next unused word:', error);
      throw error;
    }
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    try {
      const result = await this.pool.query(`
        INSERT INTO words (
          word,
          definition,
          etymology,
          first_letter,
          example_sentence,
          num_letters,
          synonyms,
          difficulty,
          times_used,
          last_used_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
      `, [
        word.word,
        word.definition,
        word.etymology,
        word.word[0],
        word.exampleSentence,
        word.word.length,
        word.synonyms,
        word.difficulty,
        0,
        null
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  }

  async updateWord(wordId: string, word: Partial<Word>): Promise<Word> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (word.word) {
        updates.push(`word = $${paramCount}`);
        values.push(word.word);
        paramCount++;
      }
      if (word.definition) {
        updates.push(`definition = $${paramCount}`);
        values.push(word.definition);
        paramCount++;
      }
      if (word.etymology) {
        updates.push(`etymology = $${paramCount}`);
        values.push(word.etymology);
        paramCount++;
      }
      if (word.exampleSentence) {
        updates.push(`example_sentence = $${paramCount}`);
        values.push(word.exampleSentence);
        paramCount++;
      }
      if (word.synonyms) {
        updates.push(`synonyms = $${paramCount}`);
        values.push(word.synonyms);
        paramCount++;
      }
      if (word.difficulty) {
        updates.push(`difficulty = $${paramCount}`);
        values.push(word.difficulty);
        paramCount++;
      }
      if (word.timesUsed !== undefined) {
        updates.push(`times_used = $${paramCount}`);
        values.push(word.timesUsed);
        paramCount++;
      }
      if (word.lastUsedAt) {
        updates.push(`last_used_at = $${paramCount}`);
        values.push(word.lastUsedAt);
        paramCount++;
      }

      values.push(wordId);

      const result = await this.pool.query(`
        UPDATE words 
        SET ${updates.join(', ')}
        WHERE word_id = $${paramCount}
        RETURNING 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Word not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  }

  async deleteWord(wordId: string): Promise<void> {
    try {
      const result = await this.pool.query('DELETE FROM words WHERE word_id = $1', [wordId]);
      if (result.rowCount === 0) {
        throw new Error('Word not found');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  }

  async searchWords(query: string): Promise<Word[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          word_id as "wordId",
          word,
          definition,
          etymology,
          first_letter as "firstLetter",
          example_sentence as "exampleSentence",
          num_letters as "numLetters",
          synonyms,
          difficulty,
          times_used as "timesUsed",
          last_used_at as "lastUsedAt"
        FROM words 
        WHERE word ILIKE $1 OR definition ILIKE $1
      `, [`%${query}%`]);
      
      return result.rows;
    } catch (error) {
      console.error('Error searching words:', error);
      throw error;
    }
  }

  async markAsUsed(wordId: string): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE words 
        SET times_used = times_used + 1, last_used_at = CURRENT_TIMESTAMP
        WHERE word_id = $1
      `, [wordId]);
    } catch (error) {
      console.error('Error marking word as used:', error);
      throw error;
    }
  }

  // User management
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    try {
      const result = await this.pool.query(`
        SELECT 
          id,
          email,
          username,
          created_at as "createdAt"
        FROM users 
        WHERE email = $1 AND password_hash = crypt($2, password_hash)
      `, [credentials.email, credentials.password]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true, user: result.rows[0] };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          id,
          email,
          username,
          created_at as "createdAt"
        FROM users 
        WHERE email = $1
      `, [email]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Leaderboard management
  async addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO leaderboard (
          username,
          word_id,
          word,
          time_taken,
          guesses_used,
          fuzzy_matches,
          hints_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        entry.username,
        entry.wordId,
        entry.word,
        entry.timeTaken,
        entry.guessesUsed,
        entry.fuzzyMatches,
        entry.hintsUsed
      ]);
    } catch (error) {
      console.error('Error adding leaderboard entry:', error);
      throw error;
    }
  }

  async getDailyLeaderboard(): Promise<DailyLeaderboardResponse> {
    try {
      const result = await this.pool.query(`
        SELECT 
          l.id,
          l.username,
          l.word_id as "wordId",
          l.word,
          l.time_taken as "timeTaken",
          l.guesses_used as "guessesUsed",
          l.fuzzy_matches as "fuzzyMatches",
          l.hints_used as "hintsUsed",
          l.created_at as "createdAt"
        FROM leaderboard l
        WHERE DATE(l.created_at) = CURRENT_DATE
        ORDER BY l.time_taken ASC, l.guesses_used ASC
      `);

      const entries = result.rows;
      const userStats = await this.pool.query(`
        SELECT
          username,
          games_played as "gamesPlayed",
          games_won as "gamesWon",
          current_streak as "currentStreak",
          longest_streak as "longestStreak",
          average_time as "averageTime",
          average_guesses as "averageGuesses",
          last_played_at as "lastPlayedAt",
          updated_at as "updatedAt"
        FROM user_stats
        WHERE username = $1
      `, ['user1']); // TODO: Get actual username

      const userRank = 1; // TODO: Calculate actual user rank

      return {
        entries,
        userRank,
        userStats: userStats.rows[0] || null
      };
    } catch (error) {
      console.error('Error getting daily leaderboard:', error);
      throw error;
    }
  }

  async getLeaderboardRank(gameId: string): Promise<number | null> {
    try {
      const result = await this.pool.query(`
        WITH ranked_entries AS (
          SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY time_taken ASC, guesses_used ASC) as rank
          FROM leaderboard
          WHERE DATE(created_at) = CURRENT_DATE
        )
        SELECT rank
        FROM ranked_entries
        WHERE id = $1
      `, [gameId]);

      return result.rows[0]?.rank || null;
    } catch (error) {
      console.error('Error getting leaderboard rank:', error);
      throw error;
    }
  }

  // Stats management
  async updateUserStats(
    username: string,
    won: boolean = false,
    guessCount: number = 0,
    timeTaken: number = 0
  ): Promise<UserStats> {
    try {
      const result = await this.pool.query(`
        INSERT INTO user_stats (
          username,
          games_played,
          games_won,
          current_streak,
          longest_streak,
          average_time,
          average_guesses,
          last_played_at,
          updated_at
        ) VALUES (
          $1, 1, $2, $2, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (username) DO UPDATE
        SET
          games_played = user_stats.games_played + 1,
          games_won = user_stats.games_won + $2::int,
          current_streak = CASE
            WHEN $2::boolean THEN user_stats.current_streak + 1
            ELSE 0
          END,
          longest_streak = CASE
            WHEN $2::boolean THEN GREATEST(user_stats.longest_streak, user_stats.current_streak + 1)
            ELSE user_stats.longest_streak
          END,
          average_time = (user_stats.average_time * user_stats.games_played + $3) / (user_stats.games_played + 1),
          average_guesses = (user_stats.average_guesses * user_stats.games_played + $4) / (user_stats.games_played + 1),
          last_played_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          username,
          games_played as "gamesPlayed",
          games_won as "gamesWon",
          current_streak as "currentStreak",
          longest_streak as "longestStreak",
          average_time as "averageTime",
          average_guesses as "averageGuesses",
          last_played_at as "lastPlayedAt",
          updated_at as "updatedAt"
      `, [username, won, timeTaken, guessCount]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  async getDailyStats(): Promise<DailyStatsResponse> {
    try {
      const metricsResult = await this.pool.query(`
        SELECT
          COUNT(*) as "totalGames",
          AVG(time_taken) as "averageTime",
          AVG(guesses_used) as "averageGuesses",
          COUNT(DISTINCT username) as "uniquePlayers",
          CAST(COUNT(CASE WHEN guesses_used > 0 THEN 1 END) AS FLOAT) / COUNT(*) as "completionRate"
        FROM leaderboard
        WHERE DATE(created_at) = CURRENT_DATE
      `);

      const streakLeadersResult = await this.pool.query(`
        SELECT
          username,
          current_streak as streak
        FROM user_stats
        WHERE current_streak > 0
        ORDER BY current_streak DESC
        LIMIT 10
      `);

      return {
        metrics: metricsResult.rows[0],
        streakLeaders: streakLeadersResult.rows
      };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      throw error;
    }
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    try {
      const result = await this.pool.query(`
        SELECT
          COUNT(*) as "totalGames",
          AVG(time_taken) as "averageTime",
          AVG(guesses_used) as "averageGuesses",
          COUNT(DISTINCT username) as "uniquePlayers",
          CAST(COUNT(CASE WHEN guesses_used > 0 THEN 1 END) AS FLOAT) / COUNT(*) as "completionRate"
        FROM leaderboard
        WHERE DATE(created_at) = CURRENT_DATE
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting today metrics:', error);
      throw error;
    }
  }

  async getTopStreaks(limit: number): Promise<StreakLeader[]> {
    try {
      const result = await this.pool.query(`
        SELECT
          username,
          current_streak as streak
        FROM user_stats
        WHERE current_streak > 0
        ORDER BY current_streak DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting top streaks:', error);
      throw error;
    }
  }
} 