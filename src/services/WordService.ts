import { db, Word as DbWord } from '../config/database/index.js';

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

// Helper to adapt database Word to IWord for API responses
const adaptDbWordToIWord = (dbWord: DbWord): Partial<IWord> => {
  return {
    wordId: dbWord.wordId,
    word: dbWord.word,
    definition: dbWord.definition,
    partOfSpeech: dbWord.partOfSpeech,
    // Add additional fields if available in the database response
  };
};

export class WordService {
  static async getWords(page: number = 1, limit: number = 10): Promise<{ words: Partial<IWord>[], total: number }> {
    try {
      const words = await db.getWords();
      const total = words.length;
      const paginatedWords = words.slice((page - 1) * limit, page * limit);
      
      return {
        words: paginatedWords.map(adaptDbWordToIWord),
        total
      };
    } catch (error) {
      console.error('Error fetching words:', error);
      throw new Error('Failed to fetch words from database');
    }
  }

  static async getWord(wordId: string): Promise<IWord | null> {
    try {
      const word = await db.getWord(wordId);
      if (!word) return null;
      
      return adaptDbWordToIWord(word) as IWord;
    } catch (error) {
      console.error('Error fetching word:', error);
      throw new Error('Failed to fetch word from database');
    }
  }

  static async addWord(wordData: Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>): Promise<IWord> {
    validateWordInput(wordData);
    
    try {
      const newWord = await db.addWord({
        word: wordData.word,
        definition: wordData.definition,
        partOfSpeech: wordData.partOfSpeech
      });
      
      return adaptDbWordToIWord(newWord) as IWord;
    } catch (error) {
      console.error('Error adding word:', error);
      throw new Error('Failed to add word to database');
    }
  }

  static async updateWord(wordId: string, wordData: Partial<Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>>): Promise<IWord> {
    if (wordData.word || wordData.partOfSpeech || wordData.definition) {
      validateWordInput({
        word: wordData.word || '',
        partOfSpeech: wordData.partOfSpeech || '',
        definition: wordData.definition || ''
      });
    }

    try {
      const updatedWord = await db.updateWord(wordId, {
        word: wordData.word,
        definition: wordData.definition,
        partOfSpeech: wordData.partOfSpeech
      });
      
      return adaptDbWordToIWord(updatedWord) as IWord;
    } catch (error) {
      console.error('Error updating word:', error);
      throw new Error('Failed to update word in database');
    }
  }

  static async deleteWord(wordId: string): Promise<boolean> {
    try {
      await db.deleteWord(wordId);
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      throw new Error('Failed to delete word from database');
    }
  }

  static async searchWords(query: string): Promise<IWord[]> {
    if (!query || query.length > MAX_WORD_LENGTH) {
      throw new Error(`Search query must be between 1 and ${MAX_WORD_LENGTH} characters`);
    }

    try {
      const words = await db.searchWords(query);
      return words.map(adaptDbWordToIWord) as IWord[];
    } catch (error) {
      console.error('Error searching words:', error);
      throw new Error('Failed to search words in database');
    }
  }

  static async getRandomWord(): Promise<IWord | null> {
    try {
      const word = await db.getRandomWord();
      return adaptDbWordToIWord(word) as IWord;
    } catch (error) {
      console.error('Error getting random word:', error);
      throw new Error('Failed to get random word from database');
    }
  }

  static async checkGuess(wordId: string, guess: string): Promise<boolean> {
    try {
      const word = await db.getWord(wordId);
      if (!word) {
        throw new Error('Word not found');
      }
      
      return word.word.toLowerCase() === guess.toLowerCase();
    } catch (error) {
      console.error('Error checking guess:', error);
      throw new Error('Failed to check guess against database');
    }
  }
} 