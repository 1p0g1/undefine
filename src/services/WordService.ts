import { executeQuery } from '../config/snowflake.js';
import { redisClient, CACHE_TTL } from '../config/database.js';

export interface IWord {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  alternateDefinition?: string;
  timesUsed: number;
  lastUsedDate?: Date;
}

export class WordService {
  static async getWords(page: number = 1, limit: number = 10): Promise<{ words: IWord[], total: number }> {
    const cacheKey = `words:${page}:${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const offset = (page - 1) * limit;
    
    const [words, totalResult] = await Promise.all([
      executeQuery<IWord>(`
        SELECT 
          WORD_ID as id,
          WORD,
          PART_OF_SPEECH as partOfSpeech,
          DEFINITION,
          ALTERNATE_DEFINITION as alternateDefinition,
          TIMES_USED as timesUsed,
          LAST_USED_DATE as lastUsedDate
        FROM WORDS
        ORDER BY WORD
        LIMIT ? OFFSET ?
      `, [limit, offset]),
      executeQuery<{total: number}>('SELECT COUNT(*) as total FROM WORDS')
    ]);

    const result = { words, total: totalResult[0].total };
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async addWord(wordData: Omit<IWord, 'id' | 'timesUsed' | 'lastUsedDate'>): Promise<IWord> {
    const result = await executeQuery<IWord>(`
      INSERT INTO WORDS (
        WORD,
        PART_OF_SPEECH,
        DEFINITION,
        ALTERNATE_DEFINITION,
        TIMES_USED
      ) VALUES (?, ?, ?, ?, 0)
      RETURNING *
    `, [
      wordData.word,
      wordData.partOfSpeech,
      wordData.definition,
      wordData.alternateDefinition || null
    ]);

    await WordService.invalidateCache();
    return result[0];
  }

  static async getRandomWord(): Promise<IWord | null> {
    const cacheKey = 'daily-word';
    const cachedWord = await redisClient.get(cacheKey);

    if (cachedWord) {
      return JSON.parse(cachedWord);
    }

    const word = await executeQuery<IWord>(`
      SELECT 
        WORD_ID as id,
        WORD,
        PART_OF_SPEECH as partOfSpeech,
        DEFINITION,
        ALTERNATE_DEFINITION as alternateDefinition,
        TIMES_USED as timesUsed,
        LAST_USED_DATE as lastUsedDate
      FROM WORDS 
      ORDER BY RANDOM() 
      LIMIT 1
    `);

    if (word[0]) {
      await WordService.markAsUsed(word[0].id);
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(word[0]));
    }

    return word[0] || null;
  }

  static async searchWords(query: string): Promise<IWord[]> {
    const cacheKey = `search:${query}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const words = await executeQuery<IWord>(`
      SELECT 
        WORD_ID as id,
        WORD,
        PART_OF_SPEECH as partOfSpeech,
        DEFINITION,
        ALTERNATE_DEFINITION as alternateDefinition,
        TIMES_USED as timesUsed,
        LAST_USED_DATE as lastUsedDate
      FROM WORDS 
      WHERE CONTAINS(WORD, ?) 
         OR CONTAINS(DEFINITION, ?) 
         OR CONTAINS(ALTERNATE_DEFINITION, ?)
      ORDER BY 
        CASE 
          WHEN WORD ILIKE ? THEN 1
          WHEN WORD ILIKE ? || '%' THEN 2
          ELSE 3
        END,
        WORD
    `, [query, query, query, query, query]);

    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(words));
    return words;
  }

  static async checkGuess(wordId: string, guess: string): Promise<boolean> {
    const word = await executeQuery<IWord>(`
      SELECT WORD 
      FROM WORDS 
      WHERE WORD_ID = ?
    `, [wordId]);
    
    if (!word[0]) return false;
    return word[0].word.toLowerCase() === guess.toLowerCase();
  }

  static async markAsUsed(wordId: string): Promise<void> {
    await executeQuery(`
      UPDATE WORDS 
      SET 
        TIMES_USED = TIMES_USED + 1,
        LAST_USED_DATE = CURRENT_TIMESTAMP()
      WHERE WORD_ID = ?
    `, [wordId]);
  }

  private static async invalidateCache(): Promise<void> {
    const keys = await redisClient.keys('words:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
} 