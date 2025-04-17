import { connectionManager } from '../config/snowflake.js';

async function resetLeaderboard() {
    console.log('Starting leaderboard reset process...');
    const connection = await connectionManager.getConnection();

    try {
        // Set context
        await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);

        // Archive top 10 entries from previous day with ranking
        await connectionManager.executeQuery(`
            INSERT INTO LEADERBOARD_ARCHIVE (
                id, username, word, guesses, completion_time_seconds,
                used_hint, completed, created_at, rank
            )
            WITH ranked_entries AS (
                SELECT 
                    id, username, word, guesses, completion_time_seconds,
                    used_hint, completed, created_at,
                    ROW_NUMBER() OVER (
                        ORDER BY guesses ASC, completion_time_seconds ASC
                    ) as rank
                FROM LEADERBOARD
                WHERE DATE(created_at) = CURRENT_DATE - 1
            )
            SELECT 
                id, username, word, guesses, completion_time_seconds,
                used_hint, completed, created_at, rank
            FROM ranked_entries
            WHERE rank <= 10;
        `, [], connection);
        console.log('Archived top 10 entries from previous day');

        // Update TOP_TEN_COUNT for users who made it into top 10
        await connectionManager.executeQuery(`
            UPDATE USER_STATS u
            SET top_ten_count = top_ten_count + 1
            WHERE username IN (
                SELECT DISTINCT username
                FROM LEADERBOARD_ARCHIVE
                WHERE DATE(archived_at) = CURRENT_DATE
                AND rank <= 10
            );
        `, [], connection);
        console.log('Updated top ten counts for qualifying users');

        // Truncate the LEADERBOARD table
        await connectionManager.executeQuery('TRUNCATE TABLE LEADERBOARD;', [], connection);
        console.log('Truncated LEADERBOARD table');

        // Create or replace the daily reset task
        await connectionManager.executeQuery(`
            CREATE OR REPLACE TASK RESET_LEADERBOARD_DAILY
                WAREHOUSE = UNDEFINE
                SCHEDULE = 'USING CRON 0 0 * * * UTC'  -- Run at midnight UTC
            AS
                BEGIN
                    -- Archive top 10 entries with ranking
                    INSERT INTO LEADERBOARD_ARCHIVE (
                        id, username, word, guesses, completion_time_seconds,
                        used_hint, completed, created_at, rank
                    )
                    WITH ranked_entries AS (
                        SELECT 
                            id, username, word, guesses, completion_time_seconds,
                            used_hint, completed, created_at,
                            ROW_NUMBER() OVER (
                                ORDER BY guesses ASC, completion_time_seconds ASC
                            ) as rank
                        FROM LEADERBOARD
                        WHERE DATE(created_at) = CURRENT_DATE - 1
                    )
                    SELECT 
                        id, username, word, guesses, completion_time_seconds,
                        used_hint, completed, created_at, rank
                    FROM ranked_entries
                    WHERE rank <= 10;

                    -- Update TOP_TEN_COUNT for users who made it into top 10
                    UPDATE USER_STATS u
                    SET top_ten_count = top_ten_count + 1
                    WHERE username IN (
                        SELECT DISTINCT username
                        FROM LEADERBOARD_ARCHIVE
                        WHERE DATE(archived_at) = CURRENT_DATE
                        AND rank <= 10
                    );

                    -- Truncate the table
                    TRUNCATE TABLE LEADERBOARD;
                END;
        `, [], connection);
        console.log('Created/updated daily reset task');

        // Resume the task
        await connectionManager.executeQuery('ALTER TASK RESET_LEADERBOARD_DAILY RESUME;', [], connection);
        console.log('Task is now active');

    } catch (error) {
        console.error('Error during leaderboard reset:', error);
        throw error;
    } finally {
        await connectionManager.releaseConnection(connection);
        console.log('Leaderboard reset process completed');
    }
}

// Run the reset if this script is executed directly
if (require.main === module) {
    resetLeaderboard()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { resetLeaderboard }; 