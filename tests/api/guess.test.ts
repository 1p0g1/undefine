import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockWordData } from '../test-utils/mock-data.js';
import { assertNoUndefined } from '../test-utils/check-undefined.js';
import type { GameSession, Result } from '../../packages/shared-types/src/index.js';
import type { GuessResult } from '../../src/types/shared.js';
import { handler } from '../../src/api/guess.js';
import { SupabaseClient } from '../../src/config/database/SupabaseClient.js';
import type { Request, Response } from 'express';

// Mock the Supabase client
vi.mock('../../src/config/database/SupabaseClient.js', () => ({
  SupabaseClient: {
    getInstance: vi.fn().mockReturnValue({
      getGameSession: vi.fn(),
      processGuess: vi.fn()
    })
  }
}));

describe('POST /api/guess', () => {
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

  const mockGameSession: GameSession = {
    id: 'game-123',
    word_id: mockWordData.id,
    word: mockWordData.word,
    start_time: new Date().toISOString(),
    guesses: [],
    guesses_used: 0,
    revealed_clues: [],
    clue_status: {
      D: 'neutral',
      E: 'neutral',
      F: 'neutral',
      I: 'neutral',
      N: 'neutral',
      E2: 'neutral'
    },
    is_complete: false,
    is_won: false,
    state: 'active'
  };

  const mockGuessResult: GuessResult = {
    isCorrect: true,
    guess: 'test',
    gameOver: true,
    correctWord: 'test'
  };

  const mockRequest = (body: any): Partial<Request> => ({
    body
  });

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process a valid guess and return the result', async () => {
    // Setup mocks
    const db = SupabaseClient.getInstance();
    vi.mocked(db.getGameSession).mockResolvedValueOnce({
      success: true,
      data: mockGameSession
    } as Result<GameSession>);
    vi.mocked(db.processGuess).mockResolvedValueOnce({
      success: true,
      data: mockGuessResult
    } as Result<GuessResult>);

    // Make request
    const req = mockRequest({
      gameId: mockGameSession.id,
      guess: 'test'
    }) as Request;
    const res = mockResponse() as Response;

    // Call handler
    await handler(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGuessResult);

    // Get the response data from the mock
    const jsonCalls = vi.mocked(res.json).mock.calls;
    expect(jsonCalls.length).toBe(1);
    const responseData = jsonCalls[0][0];

    // Verify no undefined values in response data
    assertNoUndefined(responseData, 'Response contains undefined values');
  });

  it('should handle missing gameId', async () => {
    // Make request without gameId
    const req = mockRequest({
      guess: 'test'
    }) as Request;
    const res = mockResponse() as Response;

    // Call handler
    await handler(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should handle missing guess', async () => {
    // Make request without guess
    const req = mockRequest({
      gameId: mockGameSession.id
    }) as Request;
    const res = mockResponse() as Response;

    // Call handler
    await handler(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should handle non-existent game session', async () => {
    // Setup mock to return null
    const db = SupabaseClient.getInstance();
    vi.mocked(db.getGameSession).mockResolvedValueOnce({
      success: true,
      data: null
    } as Result<GameSession | null>);

    // Make request
    const req = mockRequest({
      gameId: 'non-existent',
      guess: 'test'
    }) as Request;
    const res = mockResponse() as Response;

    // Call handler
    await handler(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Game session not found' });
  });

  it('should handle internal server errors', async () => {
    // Setup mock to throw error
    const db = SupabaseClient.getInstance();
    vi.mocked(db.getGameSession).mockResolvedValueOnce({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database error',
        details: new Error('Database error')
      }
    } as Result<GameSession>);

    // Make request
    const req = mockRequest({
      gameId: mockGameSession.id,
      guess: 'test'
    }) as Request;
    const res = mockResponse() as Response;

    // Call handler
    await handler(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to process guess' });
  });
}); 