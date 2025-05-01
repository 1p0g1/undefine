import { useState, useEffect } from 'react';
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // TODO: Implement actual auth logic
        setLoading(false);
    }, []);
    return { user, loading };
};
