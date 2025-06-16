import {
  MonitoringService,
  AnalyticsEngineDataset,
} from '../types/monitoring';
import { Logger } from '../utils/logger';

export class MonitoringServiceImpl implements MonitoringService {
  private analyticsEngine: AnalyticsEngineDataset;
  private logger: Logger;

  constructor(analyticsEngine: AnalyticsEngineDataset, logger: Logger) {
    this.analyticsEngine = analyticsEngine;
    this.logger = logger;
  }

  public trackRequest(
    method: string,
    path: string,
    status: number,
    duration: number,
    userId?: string,
    error?: string,
  ): void {
    this.logger.info('Tracking request', { method, path, status, duration });
    this.analyticsEngine.writeDataPoint({
      indexes: ['requests_total', method.toUpperCase(), path],
      blobs: [userId || null, error || null],
      doubles: [status, duration],
    });
  }

  public trackApiCall(
    service: string,
    success: boolean,
    duration: number,
    statusCode?: number,
  ): void {
    this.logger.info('Tracking API call', { service, success, duration });
    this.analyticsEngine.writeDataPoint({
      indexes: ['api_calls_total', service],
      blobs: [success ? 'success' : 'failure'],
      doubles: [duration, statusCode || 0],
    });
  }

  public trackError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error('Tracking error', {
      errorMessage: error.message,
      stack: error.stack,
      context,
    });
    this.analyticsEngine.writeDataPoint({
      indexes: ['errors_total'],
      blobs: [error.name, error.message, error.stack || null],
    });
  }

  public trackExecution(label: string, duration: number): void {
    this.logger.info('Tracking execution', { label, duration });
    this.analyticsEngine.writeDataPoint({
      indexes: ['execution_time', label],
      doubles: [duration],
    });
  }
} 