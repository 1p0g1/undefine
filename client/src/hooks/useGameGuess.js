import { useState } from 'react';
export function useGameGuess() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const submitGuess = async (gameId, guess) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId, guess })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit guess');
            }
            const result = await response.json();
            return result;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return null;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return {
        submitGuess,
        isSubmitting,
        error
    };
}
