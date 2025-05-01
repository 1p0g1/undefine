import { useState, useEffect } from 'react';
import type { WordData } from '@undefine/shared-types';

export const useWordData = (wordId: string | null) => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wordId) {
      setLoading(false);
      return;
    }

    // TODO: Implement actual word data fetching
    setLoading(false);
  }, [wordId]);

  return { wordData, loading, error };
}; 