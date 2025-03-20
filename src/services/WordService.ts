import { connectionManager } from '../config/snowflake.js';

// Constants
const WORD_COLUMNS = `
  WORD_ID,
  WORD,
  PART_OF_SPEECH as "partOfSpeech",
  DEFINITION,
  ALTERNATE_DEFINITION as "alternateDefinition",
  TIMES_USED as "timesUsed",
  LAST_USED_DATE as "lastUsedDate",
  CREATED_AT as "createdAt",
  UPDATED_AT as "updatedAt"
`;

const MAX_SEARCH_RESULTS = 100;
const MAX_WORD_LENGTH = 100;
const MAX_DEFINITION_LENGTH = 1000;

export interface IWord {
  wordId: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  alternateDefinition?: string;
  timesUsed: number;
  lastUsedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Input validation
const validateWordInput = (wordData: Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>): void => {
  if (!wordData.word || wordData.word.length > MAX_WORD_LENGTH) {
    throw new Error(`Word must be between 1 and ${MAX_WORD_LENGTH} characters`);
  }
  if (!wordData.partOfSpeech || wordData.partOfSpeech.length > MAX_WORD_LENGTH) {
    throw new Error(`Part of speech must be between 1 and ${MAX_WORD_LENGTH} characters`);
  }
  if (!wordData.definition || wordData.definition.length > MAX_DEFINITION_LENGTH) {
    throw new Error(`Definition must be between 1 and ${MAX_DEFINITION_LENGTH} characters`);
  }
};

export class WordService {
  static async getWords(page: number = 1, limit: number = 10): Promise<{ words: IWord[], total: number }> {
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const [words, totalResult] = await Promise.all([
        connectionManager.executeQuery<IWord>(`
          SELECT ${WORD_COLUMNS}
          FROM WORDS
          ORDER BY WORD
          LIMIT :1 OFFSET :2
        `, [limit, (page - 1) * limit], connection),
        connectionManager.executeQuery<{total: number}>('SELECT COUNT(*) as "total" FROM WORDS', [], connection)
      ]);

      return { words, total: totalResult[0].total };
    } catch (error) {
      console.error('Error fetching words:', error);
      throw new Error('Failed to fetch words from database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async getWord(word: string): Promise<IWord | null> {
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const result = await connectionManager.executeQuery<IWord>(`
        SELECT ${WORD_COLUMNS}
        FROM WORDS
        WHERE WORD = :1
      `, [word], connection);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error fetching word:', error);
      throw new Error('Failed to fetch word from database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async addWord(wordData: Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>): Promise<IWord> {
    validateWordInput(wordData);
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const result = await connectionManager.executeQuery<IWord>(`
        INSERT INTO WORDS (
          WORD,
          PART_OF_SPEECH,
          DEFINITION,
          ALTERNATE_DEFINITION,
          TIMES_USED,
          CREATED_AT,
          UPDATED_AT
        ) VALUES (:1, :2, :3, :4, 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
        RETURNING ${WORD_COLUMNS}
      `, [
        wordData.word,
        wordData.partOfSpeech,
        wordData.definition,
        wordData.alternateDefinition || null
      ], connection);

      return result[0];
    } catch (error) {
      console.error('Error adding word:', error);
      throw new Error('Failed to add word to database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async updateWord(wordId: string, wordData: Partial<Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>>): Promise<IWord> {
    if (wordData.word) {
      validateWordInput({
        word: wordData.word,
        partOfSpeech: wordData.partOfSpeech || '',
        definition: wordData.definition || ''
      });
    }

    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (wordData.word) {
        updates.push(`WORD = :${paramCount}`);
        values.push(wordData.word);
        paramCount++;
      }
      if (wordData.partOfSpeech) {
        updates.push(`PART_OF_SPEECH = :${paramCount}`);
        values.push(wordData.partOfSpeech);
        paramCount++;
      }
      if (wordData.definition) {
        updates.push(`DEFINITION = :${paramCount}`);
        values.push(wordData.definition);
        paramCount++;
      }
      if (wordData.alternateDefinition !== undefined) {
        updates.push(`ALTERNATE_DEFINITION = :${paramCount}`);
        values.push(wordData.alternateDefinition);
        paramCount++;
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push('UPDATED_AT = CURRENT_TIMESTAMP()');
      values.push(wordId);

      const result = await connectionManager.executeQuery<IWord>(`
        UPDATE WORDS
        SET ${updates.join(', ')}
        WHERE WORD_ID = :${paramCount}
        RETURNING ${WORD_COLUMNS}
      `, values, connection);

      if (result.length === 0) {
        throw new Error('Word not found');
      }

      return result[0];
    } catch (error) {
      console.error('Error updating word:', error);
      throw new Error('Failed to update word in database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async deleteWord(wordId: string): Promise<boolean> {
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const result = await connectionManager.executeQuery<{ deleted: number }>(`
        DELETE FROM WORDS
        WHERE WORD_ID = :1
        RETURNING 1 as deleted
      `, [wordId], connection);

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting word:', error);
      throw new Error('Failed to delete word from database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async searchWords(query: string): Promise<IWord[]> {
    if (!query || query.length > MAX_WORD_LENGTH) {
      throw new Error(`Search query must be between 1 and ${MAX_WORD_LENGTH} characters`);
    }

    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const words = await connectionManager.executeQuery<IWord>(`
        SELECT ${WORD_COLUMNS}
        FROM WORDS 
        WHERE CONTAINS(WORD, :1) 
           OR CONTAINS(DEFINITION, :1)
        ORDER BY 
          CASE 
            WHEN WORD ILIKE :2 THEN 1
            WHEN WORD ILIKE :3 || '%' THEN 2
            ELSE 3
          END,
          WORD
        LIMIT :4
      `, [query, query, query, MAX_SEARCH_RESULTS], connection);

      return words;
    } catch (error) {
      console.error('Error searching words:', error);
      throw new Error('Failed to search words in database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async getRandomWord(): Promise<IWord | null> {
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const word = await connectionManager.executeQuery<IWord>(`
        SELECT ${WORD_COLUMNS}
        FROM WORDS 
        ORDER BY RANDOM() 
        LIMIT 1
      `, [], connection);

      if (word[0]) {
        await WordService.markAsUsed(word[0].wordId);
      }

      return word[0] || null;
    } catch (error) {
      console.error('Error getting random word:', error);
      throw new Error('Failed to get random word from database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async checkGuess(wordId: string, guess: string): Promise<boolean> {
    if (!guess || guess.length > MAX_WORD_LENGTH) {
      return false;
    }

    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      const word = await connectionManager.executeQuery<IWord>(`
        SELECT WORD 
        FROM WORDS 
        WHERE WORD_ID = :1
      `, [wordId], connection);
      
      return word.length > 0 && word[0].word.toLowerCase() === guess.toLowerCase();
    } catch (error) {
      console.error('Error checking guess:', error);
      throw new Error('Failed to check guess in database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }

  static async markAsUsed(wordId: string): Promise<void> {
    const connection = await connectionManager.getConnection();
    
    try {
      // Set the context
      await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
      await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

      await connectionManager.executeQuery(`
        UPDATE WORDS 
        SET 
          TIMES_USED = COALESCE(TIMES_USED, 0) + 1,
          LAST_USED_DATE = CURRENT_TIMESTAMP(),
          UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE WORD_ID = :1
      `, [wordId], connection);
    } catch (error) {
      console.error('Error marking word as used:', error);
      throw new Error('Failed to mark word as used in database');
    } finally {
      await connectionManager.releaseConnection(connection);
    }
  }
} 