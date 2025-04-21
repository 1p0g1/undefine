import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WordService } from '../../src/services/WordService.js';
import { createMockWordData } from '../test-utils/mock-data.js';
import { assertNoUndefined } from '../test-utils/check-undefined.js';

// Mock the WordService
vi.mock('../../src/services/WordService.js', () => ({
  WordService: {
    getRandomWord: vi.fn(),
    startGame: vi.fn()
  }
}));

describe('GET /api/word', () => {
  const mockWordData = createMockWordData({
    id: '123',
    word: 'test',
    definition: 'A test definition',
    first_letter: 't',
    number_of_letters: 4,
    clues: {
      D: 'A test definition',
      E: null,
      F: 't',
      I: null,
      N: 4,
      E2: null
    }
  });

  const mockGameSession = {
    id: 'game-123',
    words: mockWordData
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a complete GameWord object with game session', async () => {
    // Setup mocks
    vi.mocked(WordService.getRandomWord).mockResolvedValue(mockWordData);
    vi.mocked(WordService.startGame).mockResolvedValue(mockGameSession);

    // Make request
    const response = await fetch('/api/word');
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data).toEqual({
      gameId: mockGameSession.id,
      word: {
        id: mockWordData.id,
        word: mockWordData.word,
        definition: mockWordData.definition,
        clues: {
          D: mockWordData.definition,
          E: 'No etymology available',
          F: mockWordData.first_letter,
          I: 'No example sentence available',
          N: mockWordData.number_of_letters,
          E2: []
        }
      }
    });

    // Verify no undefined values
    assertNoUndefined(data, 'Response contains undefined values');
  });

  it('should handle errors when no word is found', async () => {
    // Setup mock to return null
    vi.mocked(WordService.getRandomWord).mockResolvedValue(null);

    // Make request
    const response = await fetch('/api/word');
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'No word found' });
  });

  it('should handle errors when game session creation fails', async () => {
    // Setup mocks
    vi.mocked(WordService.getRandomWord).mockResolvedValue(mockWordData);
    vi.mocked(WordService.startGame).mockResolvedValue(null);

    // Make request
    const response = await fetch('/api/word');
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create game session' });
  });

  it('should handle internal server errors', async () => {
    // Setup mock to throw error
    vi.mocked(WordService.getRandomWord).mockRejectedValue(new Error('Database error'));

    // Make request
    const response = await fetch('/api/word');
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
}); 