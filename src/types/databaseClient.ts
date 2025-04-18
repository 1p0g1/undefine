import { DatabaseClient } from './shared.js';
import { SupabaseClient as SupabaseSDKClient } from '@supabase/supabase-js';

// Extend the DatabaseClient interface with an internal client property
export interface ExtendedDatabaseClient extends DatabaseClient {
  client: SupabaseSDKClient;
}

// Type guard to check if a DatabaseClient has the client property
export function hasClient(db: DatabaseClient): db is ExtendedDatabaseClient {
  return 'client' in db;
} 