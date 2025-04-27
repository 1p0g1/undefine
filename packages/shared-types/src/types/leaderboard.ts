export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
  timestamp: string;
  gameId: string;
  wordCount: number;
  averageGuesses: number;
  totalTime: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface LeaderboardFilters {
  timeRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'score' | 'rank' | 'timestamp';
  sortOrder: 'asc' | 'desc';
  limit: number;
} 