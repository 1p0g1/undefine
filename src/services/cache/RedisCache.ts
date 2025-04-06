import Redis from 'ioredis';
import { DailyLeaderboardResponse, UserStats, Word } from '../../config/database/types.js';

export class RedisCache {
  private redis: Redis;
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }

  // Daily leaderboard caching
  async getDailyLeaderboard(): Promise<DailyLeaderboardResponse | null> {
    const data = await this.redis.get('daily_leaderboard');
    return data ? JSON.parse(data) : null;
  }

  async setDailyLeaderboard(leaderboard: DailyLeaderboardResponse): Promise<void> {
    await this.redis.setex('daily_leaderboard', this.CACHE_TTL, JSON.stringify(leaderboard));
  }

  // User stats caching
  async getUserStats(userId: string): Promise<UserStats | null> {
    const data = await this.redis.get(`user_stats:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async setUserStats(userId: string, stats: UserStats): Promise<void> {
    await this.redis.setex(`user_stats:${userId}`, this.CACHE_TTL, JSON.stringify(stats));
  }

  // Random word pool caching (keep a pool of random words ready)
  async addToRandomWordPool(word: Word): Promise<void> {
    await this.redis.lpush('random_word_pool', JSON.stringify(word));
    await this.redis.ltrim('random_word_pool', 0, 99); // Keep 100 words in pool
  }

  async getRandomWord(): Promise<Word | null> {
    const data = await this.redis.rpop('random_word_pool');
    return data ? JSON.parse(data) : null;
  }

  // Error rate limiting
  async incrementErrorCount(errorType: string): Promise<number> {
    const key = `error_count:${errorType}:${new Date().toISOString().split('T')[0]}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, this.CACHE_TTL);
    return count;
  }

  // Cache invalidation
  async invalidateUserCache(userId: string): Promise<void> {
    await this.redis.del(`user_stats:${userId}`);
  }

  async invalidateDailyLeaderboard(): Promise<void> {
    await this.redis.del('daily_leaderboard');
  }

  // Connection management
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
} 