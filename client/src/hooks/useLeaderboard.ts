import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '@undefine/shared-types';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement actual leaderboard fetching
    setLoading(false);
  }, []);

  return { entries, loading, error };
}; 