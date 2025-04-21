import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WordService } from '../src/services/WordService';
import { GameWord } from '../packages/shared-types/src/index.js';
import { SupabaseClient } from '../src/config/database/SupabaseClient';

const mockWordData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  word: 'test',
  definition: 'a test word',
  etymology: null,
  first_letter: 't',
  in_a_sentence: null,
  number_of_letters: 4,
  equivalents: 'exam,trial',
  difficulty: null,
  created_at: null,
  updated_at: null,
  clues: {
    D: 'a test word',
    E: null,
    F: 't',
    I: null,
    N: 4,
    E2: 'exam,trial'
  }
};

const mockGameSession = {
  id: '123',
  word_id: mockWordData.id,
  word: mockWordData.word,
  start_time: new Date().toISOString(),
  guesses: [],
  guesses_used: 0,
  revealed_clues: [],
  clue_status: {
    D: 'neutral',
    E: 'grey',
    F: 'grey',
    I: 'grey',
    N: 'grey',
    E2: 'grey'
  },
  is_complete: false,
  is_won: false,
  state: 'active',
  words: mockWordData
};

let nextGameSession = mockGameSession;

const mockSupabaseClient = {
  getGameSession: vi.fn().mockImplementation(async () => nextGameSession),
  getInstance: vi.fn().mockReturnThis()
} as unknown as SupabaseClient;

describe('WordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextGameSession = mockGameSession;
    WordService.supabase = mockSupabaseClient;
  });

  describe('getWord', () => {
    it('should convert string format back to array', async () => {
      const result = await WordService.getWord('123');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(mockWordData.id);
      expect(result?.word).toBe(mockWordData.word);
      expect(result?.definition).toBe(mockWordData.definition);
      expect(result?.clues).toEqual({
        D: mockWordData.definition,
        E: '',
        F: mockWordData.first_letter,
        I: '',
        N: mockWordData.number_of_letters,
        E2: mockWordData.equivalents
      });
    });

    it('should handle malformed equivalents string', async () => {
      const malformedWordData = {
        ...mockWordData,
        equivalents: 'word1,,word2, ,word3',
        clues: {
          ...mockWordData.clues,
          E2: 'word1,,word2, ,word3'
        }
      };
      
      nextGameSession = {
        ...mockGameSession,
        words: malformedWordData
      };
      
      const result = await WordService.getWord('123');
      
      expect(result).toBeDefined();
      expect(result?.clues.E2).toBe('word1,,word2, ,word3');
    });
  });
}); 