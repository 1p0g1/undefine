import { SupabaseClient } from './SupabaseClient.js';
import type { DatabaseClient } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the database client based on environment
let db: DatabaseClient;

const dbProvider = process.env.DB_PROVIDER || 'supabase';

switch (dbProvider.toLowerCase()) {
  case 'supabase':
  default: {
    console.log('Using Supabase database client');
    db = SupabaseClient.getInstance();
    break;
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    await db.connect();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { db };
export * from './types.js'; 