import Redis from 'ioredis';
import dotenv from 'dotenv';
import { connectionManager } from './snowflake.js';

dotenv.config();

const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

export const connectDB = async () => {
  try {
    await connectionManager.initialize();
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }
};

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
    await connectionManager.cleanup();
    await redisClient.quit();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default connectDB; 