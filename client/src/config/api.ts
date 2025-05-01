export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  endpoints: {
    auth: '/auth',
    words: '/words',
    guesses: '/guesses',
    stats: '/stats',
    leaderboard: '/leaderboard'
  }
}; 