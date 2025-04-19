import { connectionManager } from '../config/snowflake.js';
async function aggregateDailyMetrics() {
    console.log('Starting daily metrics aggregation...');
    const connection = await connectionManager.getConnection();
    try {
        // Set context
        await connectionManager.executeQuery('USE WAREHOUSE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE DATABASE UNDEFINE', [], connection);
        await connectionManager.executeQuery('USE SCHEMA PUBLIC', [], connection);
        // Get list of timezones where it's currently midnight (hour 0)
        await connectionManager.executeQuery(`
            WITH timezone_hours AS (
                SELECT DISTINCT
                    timezone,
                    HOUR(CONVERT_TIMEZONE('UTC', timezone, CURRENT_TIMESTAMP())) as current_hour
                FROM USER_STATS
                WHERE timezone IS NOT NULL
            )
            SELECT timezone
            FROM timezone_hours
            WHERE current_hour = 0;
        `, [], connection);
        // Aggregate metrics for each timezone where it's currently midnight
        await connectionManager.executeQuery(`
            INSERT INTO PLATFORM_METRICS (
                date,
                timezone,
                total_plays,
                unique_users,
                avg_guesses,
                avg_completion_time
            )
            WITH timezone_metrics AS (
                SELECT 
                    DATE(CONVERT_TIMEZONE('UTC', u.timezone, l.created_at)) as play_date,
                    u.timezone,
                    COUNT(*) as total_plays,
                    COUNT(DISTINCT l.username) as unique_users,
                    AVG(l.guesses) as avg_guesses,
                    AVG(l.completion_time_seconds) as avg_completion_time
                FROM (
                    -- Get data from both LEADERBOARD and LEADERBOARD_ARCHIVE
                    SELECT created_at, username, guesses, completion_time_seconds
                    FROM LEADERBOARD
                    WHERE DATE(created_at) = CURRENT_DATE - 1
                    UNION ALL
                    SELECT created_at, username, guesses, completion_time_seconds
                    FROM LEADERBOARD_ARCHIVE
                    WHERE DATE(archived_at) = CURRENT_DATE
                ) l
                JOIN USER_STATS u ON l.username = u.username
                WHERE u.timezone IN (
                    SELECT DISTINCT timezone
                    FROM USER_STATS
                    WHERE HOUR(CONVERT_TIMEZONE('UTC', timezone, CURRENT_TIMESTAMP())) = 0
                )
                GROUP BY DATE(CONVERT_TIMEZONE('UTC', u.timezone, l.created_at)), u.timezone
            )
            SELECT 
                play_date,
                timezone,
                total_plays,
                unique_users,
                avg_guesses,
                avg_completion_time
            FROM timezone_metrics;
        `, [], connection);
        console.log('Aggregated and inserted daily metrics for applicable timezones');
        // Create or replace the hourly aggregation task
        await connectionManager.executeQuery(`
            CREATE OR REPLACE TASK AGGREGATE_METRICS_HOURLY
                WAREHOUSE = UNDEFINE
                SCHEDULE = 'USING CRON 0 * * * * UTC'  -- Run every hour
            AS
                BEGIN
                    INSERT INTO PLATFORM_METRICS (
                        date,
                        timezone,
                        total_plays,
                        unique_users,
                        avg_guesses,
                        avg_completion_time
                    )
                    WITH timezone_metrics AS (
                        SELECT 
                            DATE(CONVERT_TIMEZONE('UTC', u.timezone, l.created_at)) as play_date,
                            u.timezone,
                            COUNT(*) as total_plays,
                            COUNT(DISTINCT l.username) as unique_users,
                            AVG(l.guesses) as avg_guesses,
                            AVG(l.completion_time_seconds) as avg_completion_time
                        FROM (
                            -- Get data from both LEADERBOARD and LEADERBOARD_ARCHIVE
                            SELECT created_at, username, guesses, completion_time_seconds
                            FROM LEADERBOARD
                            WHERE DATE(created_at) = CURRENT_DATE - 1
                            UNION ALL
                            SELECT created_at, username, guesses, completion_time_seconds
                            FROM LEADERBOARD_ARCHIVE
                            WHERE DATE(archived_at) = CURRENT_DATE
                        ) l
                        JOIN USER_STATS u ON l.username = u.username
                        WHERE u.timezone IN (
                            SELECT DISTINCT timezone
                            FROM USER_STATS
                            WHERE HOUR(CONVERT_TIMEZONE('UTC', timezone, CURRENT_TIMESTAMP())) = 0
                        )
                        GROUP BY DATE(CONVERT_TIMEZONE('UTC', u.timezone, l.created_at)), u.timezone
                    )
                    SELECT 
                        play_date,
                        timezone,
                        total_plays,
                        unique_users,
                        avg_guesses,
                        avg_completion_time
                    FROM timezone_metrics;
                END;
        `, [], connection);
        console.log('Created/updated hourly aggregation task');
        // Resume the task
        await connectionManager.executeQuery('ALTER TASK AGGREGATE_METRICS_HOURLY RESUME;', [], connection);
        console.log('Task is now active');
    }
    catch (error) {
        console.error('Error during metrics aggregation:', error);
        throw error;
    }
    finally {
        await connectionManager.releaseConnection(connection);
        console.log('Metrics aggregation process completed');
    }
}
// Run the aggregation if this script is executed directly
if (require.main === module) {
    aggregateDailyMetrics()
        .then(() => process.exit(0))
        .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
export { aggregateDailyMetrics };
