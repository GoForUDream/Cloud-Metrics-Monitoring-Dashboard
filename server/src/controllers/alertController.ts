import type { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alertService.js';
import { createError } from '../middleware/errorHandler.js';

export async function getAlerts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const includeAcknowledged = req.query.include_acknowledged === 'true';

    const alerts = await alertService.getAlerts(limit, includeAcknowledged);

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeAlert(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const alertId = parseInt(req.params.id);

    if (isNaN(alertId)) {
      throw createError('Invalid alert ID', 400);
    }

    const alert = await alertService.acknowledgeAlert(alertId);

    if (!alert) {
      throw createError('Alert not found', 404);
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
}
