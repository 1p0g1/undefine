import { PostgresClient } from './PostgresClient.js';
import { MockClient } from './MockClient.js';
import type { DatabaseClient } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the database client based on environment
let db: DatabaseClient;

const dbProvider = process.env.DB_PROVIDER || 'postgres';

switch (dbProvider.toLowerCase()) {
  case 'mock': {
    console.log('Using mock database client');
    const mockClient = new MockClient();
    db = mockClient;
    break;
  }
  case 'postgres':
  default: {
    console.log('Using PostgreSQL database client');
    const postgresClient = new PostgresClient();
    db = postgresClient;
    break;
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    await db.connect();
    await db.setupTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { db };
export * from './types.js'; 