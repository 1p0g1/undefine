import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from '../config/database.js';
import { Word } from '../models/Word.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wordsFilePath = path.join(__dirname, '..', 'data', 'words.json');

async function migrateData() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Read the words file
    const fileContent = fs.readFileSync(wordsFilePath, 'utf-8');
    const words = JSON.parse(fileContent);
    console.log(`Found ${words.length} words to migrate`);

    // Prepare words for MongoDB
    const wordDocuments = words.map((word: any) => ({
      word: word.word.toLowerCase(),
      partOfSpeech: word.partOfSpeech,
      definition: word.definition,
      example: word.alternateDefinition,
      timesUsed: 0
    }));

    // Insert words in batches
    const batchSize = 100;
    for (let i = 0; i < wordDocuments.length; i += batchSize) {
      const batch = wordDocuments.slice(i, i + batchSize);
      await Word.insertMany(batch, { ordered: false });
      console.log(`Migrated ${Math.min(i + batchSize, wordDocuments.length)} / ${wordDocuments.length} words`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();

// Make this file a module
export {}; 