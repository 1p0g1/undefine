// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md
import { SupabaseClient } from './SupabaseClient.js';
export async function initDb() {
    try {
        const client = SupabaseClient.getInstance();
        await client.connect();
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}
export function getDb() {
    return SupabaseClient.getInstance();
}
