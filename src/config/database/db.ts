import { PostgresClient } from './PostgresClient.js';
import type { DatabaseClient } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the database client based on environment
const db: DatabaseClient = new PostgresClient();

export { db }; 