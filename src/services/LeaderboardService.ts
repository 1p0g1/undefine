import { executeQuery } from '../config/snowflake.js';
import { v4 as uuidv4 } from 'uuid';

export interface LeaderboardEntry {
  username: string;
  word: string;
  guesses: number;
  completionTimeSeconds: number;
  usedHint: boolean;
  completed: boolean;
  time: number;
  date: string;
}

export interface UserStats {
  gamesPlayed: number;
  averageGuesses: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  topTenCount: number;
}

export class LeaderboardService {
  static async createLeaderboardTable(): Promise<void> {
    try {
      // Create LEADERBOARD table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS LEADERBOARD (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          word VARCHAR(255) NOT NULL,
          guesses INT NOT NULL,
          completion_time_seconds INT NOT NULL,
          used_hint BOOLEAN DEFAULT FALSE,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
      `);

      // Create LEADERBOARD_ARCHIVE table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS LEADERBOARD_ARCHIVE (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          word VARCHAR(255) NOT NULL,
          guesses INT NOT NULL,
          completion_time_seconds INT NOT NULL,
          used_hint BOOLEAN DEFAULT FALSE,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP_NTZ,
          archived_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
      `);

      // Create USER_STATS table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS USER_STATS (
          username VARCHAR(255) PRIMARY KEY,
          games_played INT DEFAULT 0,
          average_guesses FLOAT DEFAULT 0,
          average_time FLOAT DEFAULT 0,
          best_time INT DEFAULT NULL,
          current_streak INT DEFAULT 0,
          longest_streak INT DEFAULT 0,
          top_ten_count INT DEFAULT 0,
          last_updated TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
      `);

      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async addEntry(username: string, guesses: number, time: number): Promise<void> {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO LEADERBOARD (id, username, word, guesses, completion_time_seconds)
        VALUES (?, ?, (SELECT word FROM WORDS WHERE LIVE_DATE = CURRENT_DATE()), ?, ?);
      `;
      
      await executeQuery(sql, [id, username, guesses, time]);
      await this.updateUserStats(username);
    } catch (error) {
      console.error('Error adding leaderboard entry:', error);
      throw error;
    }
  }

  async getDailyLeaderboard(): Promise<{ entries: LeaderboardEntry[]; userStats: UserStats | null; userRank: number | null }> {
    try {
      // Get today's leaderboard entries
      const sql = `
        SELECT 
          username,
          word,
          guesses,
          completion_time_seconds as time,
          used_hint,
          completed,
          DATE(created_at) as date
        FROM LEADERBOARD
        WHERE DATE(created_at) = CURRENT_DATE()
        ORDER BY guesses ASC, completion_time_seconds ASC
        LIMIT 100;
      `;
      
      const entries = await executeQuery<LeaderboardEntry>(sql);
      
      // Get user stats if username is provided
      const userStats = null; // We'll implement this when we have user authentication
      
      // Calculate user rank if username is provided
      const userRank = null; // We'll implement this when we have user authentication
      
      return {
        entries,
        userStats,
        userRank
      };
    } catch (error) {
      console.error('Error getting daily leaderboard:', error);
      throw error;
    }
  }

  private async updateUserStats(username: string): Promise<void> {
    try {
      const sql = `
        MERGE INTO USER_STATS u
        USING (
          SELECT
            ?,
            COUNT(*) as games_played,
            AVG(guesses) as average_guesses,
            AVG(completion_time_seconds) as average_time,
            MIN(completion_time_seconds) as best_time,
            COUNT(CASE WHEN completed = TRUE THEN 1 END) as completed_games,
            COUNT(CASE WHEN guesses <= 3 THEN 1 END) as top_scores
          FROM LEADERBOARD
          WHERE username = ?
        ) s
        ON u.username = s.username
        WHEN MATCHED THEN
          UPDATE SET
            games_played = s.games_played,
            average_guesses = s.average_guesses,
            average_time = s.average_time,
            best_time = LEAST(u.best_time, s.best_time),
            top_ten_count = s.top_scores,
            last_updated = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (username, games_played, average_guesses, average_time, best_time, top_ten_count)
          VALUES (s.username, s.games_played, s.average_guesses, s.average_time, s.best_time, s.top_scores);
      `;
      
      await executeQuery(sql, [username, username]);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
} 