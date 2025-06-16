export interface AnalyticsEngineDataPoint {
  doubles?: number[];
  blobs?: (string | null)[];
  indexes?: (string | null)[];
}

export interface MonitoringService {
  trackRequest(
    method: string,
    path: string,
    status: number,
    duration: number,
    userId?: string,
    error?: string,
  ): void;
  trackApiCall(
    service: string,
    success: boolean,
    duration: number,
    statusCode?: number,
  ): void;
  trackError(error: Error, context?: Record<string, unknown>): void;
  trackExecution(label: string, duration: number): void;
}

export interface AnalyticsEngineDataset {
  writeDataPoint(data: AnalyticsEngineDataPoint): void;
} 