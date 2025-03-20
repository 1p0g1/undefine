import { connectionManager } from '../config/snowflake.js';
import { words } from '../data/words.js';
import { v4 as uuidv4 } from 'uuid';

const connection = await connectionManager.getConnection();
console.log('Connected to Snowflake');

try {
    // Set context
    await connectionManager.executeQuery(`USE WAREHOUSE UNDEFINE;`, [], connection);
    await connectionManager.executeQuery(`USE DATABASE UNDEFINE;`, [], connection);
    await connectionManager.executeQuery(`USE SCHEMA PUBLIC;`, [], connection);

    // Create WORDS table
    await connectionManager.executeQuery(`
        CREATE TABLE IF NOT EXISTS WORDS (
            ID VARCHAR(36) PRIMARY KEY,
            WORD VARCHAR(255) NOT NULL,
            PART_OF_SPEECH VARCHAR(50) NOT NULL,
            DEFINITION TEXT NOT NULL,
            ALTERNATE_DEFINITION TEXT,
            SYNONYMS TEXT,
            LETTER_COUNT INT NOT NULL,
            LETTER_COUNT_DISPLAY VARCHAR(255) NOT NULL,
            CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
    `, [], connection);
    console.log('Created WORDS table');

    // Import data
    for (const word of words) {
        await connectionManager.executeQuery(`
            INSERT INTO WORDS (
                ID, WORD, PART_OF_SPEECH, DEFINITION, 
                ALTERNATE_DEFINITION, SYNONYMS, 
                LETTER_COUNT, LETTER_COUNT_DISPLAY
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?
            );
        `, [
            uuidv4(),
            word.word,
            word.partOfSpeech,
            word.definition,
            word.alternateDefinition || null,
            word.synonyms ? JSON.stringify(word.synonyms) : null,
            word.letterCount.count,
            word.letterCount.display
        ], connection);
    }
    console.log(`Imported ${words.length} words`);

    // Verify import
    const result = await connectionManager.executeQuery<{ count: number }>(`
        SELECT COUNT(*) as count FROM WORDS;
    `, [], connection);
    console.log('Total words in database:', result[0].count);

} catch (error) {
    console.error('Error:', error);
} finally {
    await connectionManager.releaseConnection(connection);
    process.exit(0);
} 