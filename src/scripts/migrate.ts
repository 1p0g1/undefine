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
    const wordDocuments = words.map((word: any) => ({
      word: word.word.toLowerCase(),
      part_of_speech: word.partOfSpeech,
      definition: word.definition,
      example: word.alternateDefinition,
      times_used: 0
    }));

    // Insert words in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < wordDocuments.length; i += batchSize) {
      const batch = wordDocuments.slice(i, i + batchSize);
      try {
        await db.insertWords(batch);
        successCount += batch.length;
        console.log(`Migrated ${Math.min(i + batchSize, wordDocuments.length)} / ${wordDocuments.length} words`);
      } catch (error) {
        console.error(`Error inserting batch ${i}-${i + batchSize}:`, error);
      }
    }

    console.log(`Migration completed. Successfully migrated ${successCount} of ${wordDocuments.length} words`);
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();

// Make this file a module
export {}; 