// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md
import { SupabaseClient } from './SupabaseClient.js';
import { MockClient } from './MockClient.js';
import { config } from 'dotenv';
import path from 'path';
// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'development') {
    const envPath = path.resolve(process.cwd(), '.env.development');
    console.log('Loading development environment from:', envPath);
    config({ path: envPath });
    // Debug log environment variables (without showing sensitive values)
    console.log('Environment variables loaded:', {
        NODE_ENV: process.env.NODE_ENV,
        DB_PROVIDER: process.env.DB_PROVIDER,
        SUPABASE_URL: process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'
    });
}
else {
    config();
}
let dbInstance = null;
async function initializeDatabaseClient() {
    if (dbInstance) {
        return dbInstance;
    }
    const dbProvider = process.env.DB_PROVIDER?.toLowerCase();
    if (!dbProvider) {
        throw new Error('DB_PROVIDER environment variable is required');
    }
    console.log(`Initializing database client with provider: ${dbProvider}`);
    try {
        switch (dbProvider) {
            case 'supabase':
                // Validate Supabase environment variables
                if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
                    throw new Error('Missing required Supabase environment variables');
                }
                dbInstance = SupabaseClient.getInstance();
                break;
            case 'mock':
                console.warn('Using mock database for development');
                dbInstance = new MockClient();
                break;
            default:
                throw new Error(`Unsupported database provider: ${dbProvider}`);
        }
        // Initialize the database connection
        await dbInstance.connect();
        console.log('Database connection established successfully');
        return dbInstance;
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        // Clear instance if initialization failed
        dbInstance = null;
        throw error;
    }
}
// Export the initialization function
export const initDb = initializeDatabaseClient;
// Export the singleton instance getter
export function getDb() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return dbInstance;
}
