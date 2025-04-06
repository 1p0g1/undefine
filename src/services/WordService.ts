import { db } from '../config/database/db.js';
import type { DbWord } from '../config/database/types.js';

// Constants
const WORD_COLUMNS = `
  WORD_ID,
  WORD,
  PART_OF_SPEECH as "partOfSpeech",
  DEFINITION,
  ETYMOLOGY,
  FIRST_LETTER as "firstLetter",
  IS_PLURAL as "isPlural",
  NUM_SYLLABLES as "numSyllables",
  EXAMPLE_SENTENCE as "exampleSentence",
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
  definition: string;      // D: First hint
  etymology?: string;      // E: Second hint
  firstLetter?: string;    // F: Third hint
  isPlural?: boolean;      // I: Fourth hint
  numSyllables?: number;   // N: Fifth hint
  exampleSentence?: string; // E: Sixth hint
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

const adaptDbWordToIWord = (dbWord: DbWord): IWord => {
  return {
    wordId: dbWord.wordId,
    word: dbWord.word,
    partOfSpeech: dbWord.partOfSpeech,
    definition: dbWord.definition,
    etymology: dbWord.etymology,
    firstLetter: dbWord.firstLetter,
    isPlural: dbWord.isPlural,
    numSyllables: dbWord.numSyllables,
    exampleSentence: dbWord.exampleSentence,
    timesUsed: dbWord.timesUsed,
    lastUsedDate: dbWord.lastUsedAt ? new Date(dbWord.lastUsedAt) : undefined,
    createdAt: new Date(dbWord.createdAt),
    updatedAt: new Date(dbWord.updatedAt)
  };
};

export class WordService {
  static async getWords(page: number = 1, limit: number = 10): Promise<{ words: IWord[], total: number }> {
    const result = await db.getWords(page, limit);
    return {
      words: result.words.map(adaptDbWordToIWord),
      total: result.total
    };
  }

  static async getWord(wordId: string): Promise<IWord | null> {
    const word = await db.getWord(wordId);
    return word ? adaptDbWordToIWord(word) : null;
  }

  static async addWord(wordData: Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>): Promise<IWord> {
    validateWordInput(wordData);
    const dbWordData = {
      ...wordData,
      numLetters: wordData.word.length,
      dateAdded: new Date().toISOString().split('T')[0],
      letterCount: {
        count: wordData.word.length,
        display: `${wordData.word.length} letters`
      },
      firstLetter: wordData.firstLetter || wordData.word[0],
      etymology: wordData.etymology || '',
      exampleSentence: wordData.exampleSentence || '',
      isPlural: wordData.isPlural || false,
      numSyllables: wordData.numSyllables || 1
    };
    const word = await db.addWord(dbWordData);
    return adaptDbWordToIWord(word);
  }

  static async updateWord(wordId: string, wordData: Partial<Omit<IWord, 'wordId' | 'timesUsed' | 'lastUsedDate' | 'createdAt' | 'updatedAt'>>): Promise<IWord> {
    if (wordData.word || wordData.partOfSpeech || wordData.definition) {
      validateWordInput({
        word: wordData.word || '',
        partOfSpeech: wordData.partOfSpeech || '',
        definition: wordData.definition || '',
        etymology: wordData.etymology,
        firstLetter: wordData.firstLetter,
        isPlural: wordData.isPlural,
        numSyllables: wordData.numSyllables,
        exampleSentence: wordData.exampleSentence
      });
    }
    const word = await db.updateWord(wordId, wordData);
    return adaptDbWordToIWord(word);
  }

  static async deleteWord(wordId: string): Promise<boolean> {
    return await db.deleteWord(wordId);
  }

  static async searchWords(query: string): Promise<IWord[]> {
    const words = await db.searchWords(query);
    return words.map(adaptDbWordToIWord);
  }

  static async getRandomWord(): Promise<IWord | null> {
    const word = await db.getRandomWord();
    return word ? adaptDbWordToIWord(word) : null;
  }

  static async getDailyWord(date?: string): Promise<IWord | null> {
    const word = await db.getDailyWord(date);
    return word ? adaptDbWordToIWord(word) : null;
  }

  static async checkGuess(wordId: string, guess: string): Promise<boolean> {
    return await db.checkGuess(wordId, guess);
  }
} 