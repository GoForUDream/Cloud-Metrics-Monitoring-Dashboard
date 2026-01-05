import type { Request, Response, NextFunction } from 'express';
import * as metricsService from '../services/metricsService.js';
import { createError } from '../middleware/errorHandler.js';

export async function getCurrentMetrics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const metrics = await metricsService.getCurrentMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

export async function getHistoricalMetrics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end, instance_id } = req.query;

    if (!start || !end) {
      throw createError('start and end query parameters are required', 400);
    }

    const startTime = new Date(start as string);
    const endTime = new Date(end as string);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw createError('Invalid date format. Use ISO 8601 format.', 400);
    }

    const metrics = await metricsService.getHistoricalMetrics(
      startTime,
      endTime,
      instance_id as string | undefined
    );

    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

export async function getMetricStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = req.query;

    // Default to last 24 hours
    const endTime = end ? new Date(end as string) : new Date();
    const startTime = start
      ? new Date(start as string)
      : new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw createError('Invalid date format. Use ISO 8601 format.', 400);
    }

    const stats = await metricsService.getMetricStats(startTime, endTime);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getInstances(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const instances = await metricsService.getInstances();
    res.json({ success: true, data: instances });
  } catch (error) {
    next(error);
  }
}
