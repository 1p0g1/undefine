import { useState, useEffect } from 'react';
export const useUserStats = (userId) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
