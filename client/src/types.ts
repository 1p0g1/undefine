export interface LeaderboardEntry {
  id: string;
  username: string;
  wordId: string;
  word: string;
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches: number;
  hintsUsed: number;
  createdAt: string;
} 