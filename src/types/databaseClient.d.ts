import { DatabaseClient } from './shared.js';
import { SupabaseClient as SupabaseSDKClient } from '@supabase/supabase-js';
export interface ExtendedDatabaseClient extends DatabaseClient {
    client: SupabaseSDKClient;
}
export declare function hasClient(db: DatabaseClient): db is ExtendedDatabaseClient;
