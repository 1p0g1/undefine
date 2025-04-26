import { vi } from 'vitest'
import { GameWord, WordData, GameSession, Result } from '../../../packages/shared-types/src/index.js'

export const mockGameWord: GameWord = {
  id: '123',
  word: 'test',
  definition: 'A test word',
  etymology: 'From test',
  firstLetter: 't',
  inASentence: 'This is a test sentence.',
  numberOfLetters: 4,
  equivalents: ['test1', 'test2'],
  difficulty: 'easy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockGameSession: GameSession = {
  id: '123',
  userId: 'user123',
  wordId: 'word123',
  word: 'test',
  words: mockGameWord,
  startTime: new Date().toISOString(),
  guesses: [],
  hintsRevealed: [],
  completed: false,
  won: false
}

export const mockSupabaseClient = {
  getGameSession: vi.fn().mockImplementation(async (id: string) => {
    if (id === '123') {
      return { success: true, data: mockGameSession }
    }
    return { success: false, data: null }
  }),
  getDailyWord: vi.fn().mockResolvedValue({ success: true, data: mockGameWord }),
  getRandomWord: vi.fn().mockResolvedValue({ success: true, data: mockGameWord }),
  processGuess: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      isCorrect: false, 
      guess: 'test', 
      isFuzzy: false, 
      fuzzyPositions: [], 
      gameOver: false 
    } 
  }),
  startGame: vi.fn().mockResolvedValue({ success: true, data: mockGameSession })
} 