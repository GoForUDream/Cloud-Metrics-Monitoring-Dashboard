import { Router } from 'express';
import metricsRoutes from './metrics.js';
import alertRoutes from './alerts.js';

const router = Router();

router.use('/metrics', metricsRoutes);
router.use('/alerts', alertRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
