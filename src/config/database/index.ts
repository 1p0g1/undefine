// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import { SupabaseClient } from './SupabaseClient.js';
import type { DatabaseClient } from '../../../packages/shared-types/src/index.js';

export { SupabaseClient as DatabaseClient };

export async function initDb(): Promise<void> {
  try {
    const client = SupabaseClient.getInstance();
    await client.connect();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDb(): DatabaseClient {
  return SupabaseClient.getInstance();
} 