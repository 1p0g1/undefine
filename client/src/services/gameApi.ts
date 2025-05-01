import { API_CONFIG } from '../config/api';
import type { WordData, GuessResult, UserStats, GameSession, LeaderboardEntry } from '@undefine/shared-types';

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

class GameApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: response.statusText
          }
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  async getTodaysWord(): Promise<ApiResponse<WordData>> {
    return this.fetch<WordData>(`${API_CONFIG.endpoints.words}/today`);
  }

  async submitGuess(wordId: string, guess: string): Promise<ApiResponse<GuessResult>> {
    return this.fetch<GuessResult>(`${API_CONFIG.endpoints.guesses}`, {
      method: 'POST',
      body: JSON.stringify({ wordId, guess })
    });
  }

  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.fetch<UserStats>(`${API_CONFIG.endpoints.stats}/${userId}`);
  }

  async getLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.fetch<LeaderboardEntry[]>(`${API_CONFIG.endpoints.leaderboard}`);
  }

  async createGameSession(): Promise<ApiResponse<GameSession>> {
    return this.fetch<GameSession>(`${API_CONFIG.endpoints.guesses}/session`, {
      method: 'POST'
    });
  }
}

export const useGameApi = () => {
  return new GameApiService();
}; 