import { connectionManager } from '../config/snowflake.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wordsFilePath = `${__dirname}/../../data/words.json`;
try {
    // Get a Snowflake connection
    const connection = await connectionManager.getConnection();
    console.log('Connected to Snowflake');
    // Read the words from the JSON file
    const words = JSON.parse(await readFile(wordsFilePath, 'utf-8'));
    console.log(`Found ${words.length} words to migrate`);
    // Insert each word into Snowflake
    try {
        await connectionManager.executeTransaction(async (conn) => {
            for (const word of words) {
                const { word: wordText, definition, partOfSpeech, synonyms, dateAdded } = word;
                const query = `
          INSERT INTO WORDS (word, definition, part_of_speech, synonyms, date_added)
          VALUES (?, ?, ?, ?, ?)
        `;
                await connectionManager.executeQuery(query, [wordText, definition, partOfSpeech, JSON.stringify(synonyms), dateAdded], conn);
            }
        });
        console.log('Migration completed successfully');
    }
    finally {
        await connectionManager.releaseConnection(connection);
    }
}
catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
