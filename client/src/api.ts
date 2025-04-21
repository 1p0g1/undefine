import { WordData, GuessResponse } from './types';
import { getApiUrl } from './utils';

export const fetchWord = async (): Promise<WordData> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(getApiUrl('/api/word'), {
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to load game' }));
      throw new Error(errorData.error || 'Failed to load game');
    }

    const data = await response.json();
    return data.wordData;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to load game');
  }
};

export const submitGuess = async (guess: string): Promise<GuessResponse> => {
  const response = await fetch(getApiUrl('/api/guess'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit guess');
  }

  return response.json();
}; 