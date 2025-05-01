import { useState, useEffect } from 'react';
import type { UserStats } from '@undefine/shared-types';

export const useUserStats = (userId: string | null) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // TODO: Implement actual stats fetching
    setLoading(false);
  }, [userId]);

  return { stats, loading, error };
}; 