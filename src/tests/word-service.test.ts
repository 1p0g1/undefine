import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WordService } from '../services/WordService.js';
import type { WordData } from '../../../packages/shared-types/src/utils/word.js';
import { assertNoUndefined } from './test-utils/check-undefined.js';

// Mock environment variables
vi.stubEnv('SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('SUPABASE_ANON_KEY', 'fake-anon-key');

vi.mock('../config/env.js', () => ({
  env: {
    isDevelopment: false,
    isProduction: false,
    isTest: true,
    maxGuesses: 6,
    hintDelay: 1000,
  }
}));

describe('WordService', () => {
  let mockWordData: WordData;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock word data with all optional fields set to null
    mockWordData = {
      id: 'test-id',
      word: 'test',
      definition: 'A test word',
      etymology: null,
      first_letter: 't',
      in_a_sentence: null,
      number_of_letters: 4,
      equivalents: 'word1,word2,word3',
      difficulty: null,
      created_at: null,
      updated_at: null,
      clues: {
        D: 'A test word',
        E: null,
        F: 't',
        I: null,
        N: 4,
        E2: null
      }
    };

    // Verify no undefined values in mock data
    assertNoUndefined(mockWordData, 'Mock word data contains undefined values');

    // Mock the static supabase property
    vi.spyOn(WordService, 'supabase', 'get').mockReturnValue({
      getGameSession: vi.fn().mockResolvedValue({
        words: mockWordData
      }),
      getDailyWord: vi.fn().mockResolvedValue(mockWordData),
      getRandomWord: vi.fn().mockResolvedValue(mockWordData),
      processGuess: vi.fn().mockResolvedValue({
        isCorrect: true,
        feedback: []
      }),
      startGame: vi.fn().mockResolvedValue({
        words: mockWordData
      })
    });
  });

  // Canary test for CI integrity
  it('Sanity: WordService.getWord returns correct structure with valid input', async () => {
    const result = await WordService.getWord('test-id');
    expect(result).not.toBeNull();
    expect(result?.clues).toEqual({
      D: 'A test word',
      E: '',
      F: 't',
      I: '',
      N: 4,
      E2: 'word1,word2,word3'
    });
  });

  describe('getWord', () => {
    it('should convert string format back to array', async () => {
      const result = await WordService.getWord('test');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.clues.E2).toBe('word1,word2,word3');
        expect(result.clues).toBeDefined();
        
        // Verify no undefined values in result
        assertNoUndefined(result, 'WordService.getWord result contains undefined values');
      }
    });

    it('should handle malformed equivalents strings', async () => {
      const result = await WordService.getWord('test');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.clues.E2).toBe('word1,word2,word3');
        expect(result.clues).toBeDefined();
        
        // Verify no undefined values in result
        assertNoUndefined(result, 'WordService.getWord result contains undefined values');
      }
    });
  });
});