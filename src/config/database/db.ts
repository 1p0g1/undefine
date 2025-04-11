import { SupabaseClient } from './SupabaseClient.ts';
import type { DatabaseClient } from './types.ts';
import dotenv from 'dotenv';

dotenv.config();

// Export the singleton instance
export const db = SupabaseClient.getInstance(); 