import { Router } from 'express';
import * as alertController from '../controllers/alertController.js';

const router = Router();

// GET /api/alerts - Get all alerts
router.get('/', alertController.getAlerts);

// PATCH /api/alerts/:id/acknowledge - Acknowledge an alert
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);

export default router;
