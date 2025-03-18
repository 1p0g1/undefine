import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversedefine';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
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

// Export mongoose for use in other files
export { mongoose };

export default connectDB; 