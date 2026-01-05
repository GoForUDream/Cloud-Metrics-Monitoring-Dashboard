import { Router } from 'express';
import * as metricsController from '../controllers/metricsController.js';

const router = Router();

// GET /api/metrics/current - Get current metrics for all instances
router.get('/current', metricsController.getCurrentMetrics);

// GET /api/metrics/history - Get historical metrics with time range
router.get('/history', metricsController.getHistoricalMetrics);

// GET /api/metrics/stats - Get aggregated statistics
router.get('/stats', metricsController.getMetricStats);

// GET /api/metrics/instances - Get list of monitored instances
router.get('/instances', metricsController.getInstances);

export default router;
