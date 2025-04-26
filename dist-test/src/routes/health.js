import { Router } from 'express';
import { register } from 'prom-client';
const router = Router();
// Simple root health check for deployment monitoring
router.get('/', async (req, res) => {
    res.status(200).send('OK');
});
// Metrics health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Get all metrics
        const metrics = await register.metrics();
        res.json({
            status: 'ok',
            metrics: metrics
        });
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
//# sourceMappingURL=health.js.map