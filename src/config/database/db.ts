import { SupabaseClient } from './SupabaseClient.js';
import { MockClient } from './MockClient.js';
import type { DatabaseClient } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

function getDatabaseClient(): DatabaseClient {
  const dbProvider = process.env.DB_PROVIDER?.toLowerCase() || 'mock';
  
  console.log(`Initializing database client with provider: ${dbProvider}`);
  
  switch (dbProvider) {
    case 'supabase':
      return SupabaseClient.getInstance();
    case 'mock':
      return new MockClient();
    default:
      console.warn(`Unknown DB_PROVIDER: ${dbProvider}, falling back to mock database`);
      return new MockClient();
  }
}

// Export the singleton instance
export const db = getDatabaseClient(); 