import { Router } from 'express';
import { register } from 'prom-client';

const router = Router();

// Simplified health check endpoint (removed Snowflake dependency)
router.get('/health', async (req, res) => {
  try {
    // Get all metrics
    const metrics = await register.metrics();
    
    res.json({
      status: 'ok',
      metrics: metrics
    });
  } catch (err: any) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'error',
      error: err.message
    });
  }
});

export default router; 