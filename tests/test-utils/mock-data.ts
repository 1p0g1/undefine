import { WordData } from '../../packages/shared-types/src/utils/word.js';
import { assertNoUndefined } from './check-undefined.js';

/**
 * Default mock WordData with all optional fields set to null
 */
const DEFAULT_WORD_DATA: WordData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  word: 'test',
  definition: 'A test definition',
  etymology: null,
  first_letter: 't',
  in_a_sentence: null,
  number_of_letters: 4,
  equivalents: null,
  difficulty: null,
  created_at: null,
  updated_at: null,
  clues: {
    D: 'A test definition',
    E: null,
    F: 't',
    I: null,
    N: 4,
    E2: null
  }
};

/**
 * Creates a mock WordData object with enforced null defaults for optional fields
 * This ensures that no undefined values can sneak into test data.
 * 
 * @param overrides - Optional overrides for the default values
 * @returns A mock WordData object with all optional fields explicitly set to null if not overridden
 */
export function createMockWordData(overrides: Partial<WordData> = {}): WordData {
  const mockData = {
    ...DEFAULT_WORD_DATA,
    ...overrides,
    clues: {
      ...DEFAULT_WORD_DATA.clues,
      ...(overrides.clues || {})
    }
  };

  // Verify no undefined values in the created mock data
  assertNoUndefined(mockData, 'Created mock word data contains undefined values');

  return mockData;
} 