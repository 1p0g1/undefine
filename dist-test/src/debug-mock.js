// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md
import dotenv from 'dotenv';
import { getDb } from './config/database/db.js';
// Load environment variables first
dotenv.config();
// Simple debug script to test the mock client
async function testMockClient() {
    console.log('Testing mock client...');
    console.log(`Using database provider: ${process.env.DB_PROVIDER}`);
    try {
        // Test connection
        console.log('\n1. Testing connection');
        await getDb().connect();
        console.log('✓ Connection successful');
        // Test getRandomWord
        console.log('\n2. Testing getRandomWord');
        const word = await getDb().getRandomWord();
        console.log('✓ getRandomWord successful');
        console.log(`Word: ${word.word}`);
        console.log(`Definition: ${word.definition}`);
        // Test getLeaderboard
        console.log('\n3. Testing getLeaderboard');
        try {
            // @ts-ignore - This method might not exist in all implementations
            const leaderboard = await getDb().getLeaderboard();
            console.log('✓ getLeaderboard successful');
            console.log(`Found ${leaderboard.length} entries`);
        }
        catch (error) {
            console.log('× getLeaderboard not available in this database provider');
        }
        console.log('\nAll tests passed!');
    }
    catch (error) {
        console.error('Test failed:', error);
    }
    finally {
        try {
            await getDb().disconnect();
            console.log('\nDatabase connection closed');
        }
        catch (error) {
            console.error('Error disconnecting from database:', error);
        }
    }
}
// Run the tests
testMockClient().catch(console.error);
//# sourceMappingURL=debug-mock.js.map