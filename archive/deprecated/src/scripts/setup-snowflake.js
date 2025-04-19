import { db } from '../config/database/index.js';
import { words } from '../data/words.js';
async function setupDatabase() {
    console.log('Connecting to Snowflake...');
    try {
        await db.connect();
        console.log('Connected to Snowflake');
        // Setup tables and indexes (non-destructive)
        if (db.setupTables) {
            await db.setupTables();
            console.log('Verified table structure');
        }
        else {
            console.warn('Warning: Database client does not support setupTables method');
        }
        // Check if we need to import data
        const existingWords = await db.getWords();
        if (existingWords.length === 0) {
            console.log('No words found in database. Importing sample words...');
            // Import word data if the table is empty
            for (const word of words) {
                await db.addWord({
                    word: word.word,
                    partOfSpeech: word.partOfSpeech,
                    definition: word.definition,
                });
                console.log(`Imported word: ${word.word}`);
            }
            console.log(`Imported ${words.length} words`);
        }
        else {
            console.log(`Database already contains ${existingWords.length} words. Skipping import.`);
        }
        // Verify import
        const finalWordCount = await db.getWords();
        console.log('Total words in database:', finalWordCount.length);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await db.disconnect();
        console.log('Disconnected from Snowflake');
        process.exit(0);
    }
}
// Run the setup
setupDatabase();
