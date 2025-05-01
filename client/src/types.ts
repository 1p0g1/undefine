import { type LeaderboardEntry as BaseLeaderboardEntry } from '@undefine/shared-types';

export interface LeaderboardEntry extends BaseLeaderboardEntry {
  fuzzyMatches: number;
  hintsUsed: number;
  createdAt: string;
} 