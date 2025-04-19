import { connectionManager } from '../config/snowflake.js';
async function checkWords() {
    console.log('Connected to Snowflake');
    const connection = await connectionManager.getConnection();
    try {
        // Set the context
        await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);
        // Get table structure
        const tableStructure = await connectionManager.executeQuery(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'WORDS'
            ORDER BY ORDINAL_POSITION
        `, [], connection);
        console.log('\nTable Structure:');
        console.log(JSON.stringify(tableStructure, null, 2));
        // Get total word count
        const countResult = await connectionManager.executeQuery(`
            SELECT COUNT(*) as "COUNT" FROM WORDS
        `, [], connection);
        console.log('\nTotal words in database:', countResult[0]?.COUNT);
        // Get a sample of words
        const sampleWords = await connectionManager.executeQuery(`
            SELECT *
            FROM WORDS
            LIMIT 5
        `, [], connection);
        console.log('\nSample words:');
        console.log(JSON.stringify(sampleWords, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await connectionManager.releaseConnection(connection);
        process.exit(0);
    }
}
checkWords().catch(console.error);
