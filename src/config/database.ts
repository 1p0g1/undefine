// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import Redis from 'ioredis';
import dotenv from 'dotenv';
import { connectionManager } from './snowflake';
import { db } from './database/index';
import { DatabaseClient, Word, LeaderboardEntry, DailyLeaderboardResponse, UserStats } from './database/types';

export type { DatabaseClient, Word, LeaderboardEntry, DailyLeaderboardResponse, UserStats };

dotenv.config();

const REDIS_URI = process.env.REDIS_URI;
if (!REDIS_URI) {
  throw new Error('Missing REDIS_URI environment variable. Please check your .env file.');
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database connections...');
    
    // Use the database provider from the environment
    const DB_PROVIDER = process.env.DB_PROVIDER || 'mock';
    
    if (DB_PROVIDER.toLowerCase() === 'snowflake') {
      // Only initialize Snowflake connection if we're using Snowflake
      try {
        const connection = await connectionManager.getConnection();
        console.log('Snowflake connection initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Snowflake connection:', error);
        console.warn('Application may still work with mock data if configured to use mock client');
      }
    } else if (DB_PROVIDER.toLowerCase() === 'mock') {
      console.log('Using mock database client, no actual database connection needed');
    } else {
      console.log(`Database provider ${DB_PROVIDER} does not require special initialization`);
    }
    
    // Connect to the database client
    await db.connect();
    console.log(`Database client (${DB_PROVIDER}) connected successfully`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Redis Client
export const redisClient = new Redis(REDIS_URI, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Connected Successfully'));

// Cache TTL in seconds (24 hours)
export const CACHE_TTL = 24 * 60 * 60;

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  try {
    // Disconnect DB client
    await db.disconnect();
    console.log('Database client disconnected.');
    
    if (process.env.DB_PROVIDER?.toLowerCase() === 'snowflake') {
      await connectionManager.cleanup();
      console.log('Snowflake connections closed.');
    }
    
    await redisClient.quit();
    console.log('Redis connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default initializeDatabase; 