import { API_CONFIG } from '../config/api';
class GameApiService {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = API_CONFIG.baseUrl;
    }
    async fetch(endpoint, options = {}) {
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
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                }
            };
        }
    }
    async getTodaysWord() {
        return this.fetch(`${API_CONFIG.endpoints.words}/today`);
    }
    async submitGuess(wordId, guess) {
        return this.fetch(`${API_CONFIG.endpoints.guesses}`, {
            method: 'POST',
            body: JSON.stringify({ wordId, guess })
        });
    }
    async getUserStats(userId) {
        return this.fetch(`${API_CONFIG.endpoints.stats}/${userId}`);
    }
    async getLeaderboard() {
        return this.fetch(`${API_CONFIG.endpoints.leaderboard}`);
    }
    async createGameSession() {
        return this.fetch(`${API_CONFIG.endpoints.guesses}/session`, {
            method: 'POST'
        });
    }
}
export const useGameApi = () => {
    return new GameApiService();
};
