import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectToSnowflake, executeQuery } from '../config/snowflake.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wordsFilePath = path.join(__dirname, '..', 'data', 'words.json');

async function migrateData() {
  try {
    // Connect to Snowflake
    await connectToSnowflake();
    console.log('Connected to Snowflake');

    // Read the words file
    const fileContent = fs.readFileSync(wordsFilePath, 'utf-8');
    const words = JSON.parse(fileContent);
    console.log(`Found ${words.length} words to migrate`);

    // Prepare words for Snowflake
    const values = words.map((word: any) => `(
      '${word.word.toLowerCase().replace(/'/g, "''")}',
      '${word.partOfSpeech.replace(/'/g, "''")}',
      '${word.definition.replace(/'/g, "''")}',
      ${word.alternateDefinition ? `'${word.alternateDefinition.replace(/'/g, "''")}'` : 'NULL'},
      0
    )`).join(',\n');

    // Insert words in batches
    const batchSize = 1000;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, Math.min(i + batchSize, words.length));
      const batchValues = batch.map((word: any) => `(
        '${word.word.toLowerCase().replace(/'/g, "''")}',
        '${word.partOfSpeech.replace(/'/g, "''")}',
        '${word.definition.replace(/'/g, "''")}',
        ${word.alternateDefinition ? `'${word.alternateDefinition.replace(/'/g, "''")}'` : 'NULL'},
        0
      )`).join(',\n');

      await executeQuery(`
        INSERT INTO WORDS (
          WORD,
          PART_OF_SPEECH,
          DEFINITION,
          ALTERNATE_DEFINITION,
          TIMES_USED
        ) VALUES ${batchValues}
      `);

      console.log(`Migrated ${Math.min(i + batchSize, words.length)} / ${words.length} words`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData(); 