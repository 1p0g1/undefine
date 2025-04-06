import React, { createContext, useContext } from 'react';
import { DatabaseClient } from '../config/database/index.js';

interface DatabaseContextType {
  db: DatabaseClient;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: {} as DatabaseClient
});

export function DatabaseProvider({ children, client }: { children: React.ReactNode; client: DatabaseClient }) {
  return (
    <DatabaseContext.Provider value={{ db: client }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 