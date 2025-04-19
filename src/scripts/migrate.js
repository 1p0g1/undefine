import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDb } from '../config/database/db.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wordsFilePath = path.join(__dirname, '..', 'data', 'words.json');
async function migrateData() {
    try {
        // Connect to Supabase
        const db = getDb();
        await db.connect();
        console.log('Connected to Supabase');
        // Read the words file
        const fileContent = fs.readFileSync(wordsFilePath, 'utf-8');
        const words = JSON.parse(fileContent);
        console.log(`Found ${words.length} words to migrate`);
        // Prepare words for Supabase
        const wordDocuments = words.map((word) => ({
            word: word.word.toLowerCase(),
            part_of_speech: word.partOfSpeech,
            definition: word.definition,
            example: word.alternateDefinition,
            times_used: 0
        }));
        console.log("Word migration is currently not implemented in the DatabaseClient interface");
        console.log("To add this functionality, extend the DatabaseClient interface with an insertWords method");
        console.log("Example of prepared data:", wordDocuments[0]);
        await db.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
migrateData();
