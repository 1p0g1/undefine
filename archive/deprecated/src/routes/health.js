import { Router } from 'express';
import { register } from 'prom-client';
import { connectionManager } from '../config/snowflake.js';
const router = Router();
// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Get all metrics
        const metrics = await register.metrics();
        // Test Snowflake connectivity
        const connection = await connectionManager.getConnection();
        const tableChecks = {
            words: false,
            leaderboard: false,
            user_stats: false
        };
        try {
            // Check WORDS table
            const wordsCount = await connectionManager.executeQuery('SELECT COUNT(*) as count FROM WORDS LIMIT 1', [], connection);
            tableChecks.words = true;
            // Check LEADERBOARD table
            const leaderboardCount = await connectionManager.executeQuery('SELECT COUNT(*) as count FROM LEADERBOARD LIMIT 1', [], connection);
            tableChecks.leaderboard = true;
            // Check USER_STATS table
            const statsCount = await connectionManager.executeQuery('SELECT COUNT(*) as count FROM USER_STATS LIMIT 1', [], connection);
            tableChecks.user_stats = true;
            res.json({
                status: 'ok',
                snowflake: {
                    connected: true,
                    tables: tableChecks
                },
                metrics: metrics
            });
        }
        catch (err) {
            console.error('Error checking tables:', err);
            res.status(500).json({
                status: 'error',
                snowflake: {
                    connected: true,
                    tables: tableChecks,
                    error: err.message
                },
                metrics: metrics
            });
        }
        finally {
            await connectionManager.releaseConnection(connection);
        }
    }
    catch (err) {
        console.error('Health check error:', err);
        res.status(500).json({
            status: 'error',
            error: err.message
        });
    }
});
export default router;
