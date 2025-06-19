import { MonitoringService, AnalyticsEngineDataset } from '../types/monitoring';
import { Logger } from '../utils/logger';
export declare class MonitoringServiceImpl implements MonitoringService {
    private analyticsEngine;
    private logger;
    constructor(analyticsEngine: AnalyticsEngineDataset, logger: Logger);
    trackRequest(method: string, path: string, status: number, duration: number, userId?: string, error?: string): void;
    trackApiCall(service: string, success: boolean, duration: number, statusCode?: number): void;
    trackError(error: Error, context?: Record<string, unknown>): void;
    trackExecution(label: string, duration: number): void;
}
//# sourceMappingURL=MonitoringService.d.ts.map