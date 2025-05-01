import { useState, useEffect } from 'react';
import type { User } from '@undefine/shared-types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual auth logic
    setLoading(false);
  }, []);

  return { user, loading };
}; 