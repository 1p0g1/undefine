import { useState, useEffect } from 'react';
export const useWordData = (wordId) => {
    const [wordData, setWordData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
