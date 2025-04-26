import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WordService } from '../services/WordService'
import { Result, WordData, GameWord } from '@shared-types/index.js'
import { mockSupabaseClient } from './mocks/SupabaseClient.mock'

vi.mock('../config/database/SupabaseClient', () => ({
  SupabaseClient: {
    getInstance: () => mockSupabaseClient
  }
}))

describe('WordService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWord', () => {
    it('should return a word when given a valid ID', async () => {
      const result = await WordService.getWord('123')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('id')
        expect(result.data).toHaveProperty('word')
      }
      expect(mockSupabaseClient.getGameSession).toHaveBeenCalledWith('123')
    })

    it('should return an error when given an invalid ID', async () => {
      const result = await WordService.getWord('invalid-id')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
      expect(mockSupabaseClient.getGameSession).toHaveBeenCalledWith('invalid-id')
    })
  })

  describe('getDailyWord', () => {
    it('should return the daily word', async () => {
      const result = await WordService.getDailyWord()
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('id')
        expect(result.data).toHaveProperty('word')
      }
      expect(mockSupabaseClient.getDailyWord).toHaveBeenCalled()
    })
  })

  describe('getRandomWord', () => {
    it('should return a random word', async () => {
      const result = await WordService.getRandomWord()
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('id')
        expect(result.data).toHaveProperty('word')
      }
      expect(mockSupabaseClient.getRandomWord).toHaveBeenCalled()
    })
  })
}) 