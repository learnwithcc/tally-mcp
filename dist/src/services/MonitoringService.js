import { SentryService } from './SentryService';
export class MonitoringServiceImpl {
    constructor(analyticsEngine, logger) {
        this.analyticsEngine = analyticsEngine;
        this.logger = logger;
    }
    trackRequest(method, path, status, duration, userId, error) {
        this.logger.info('Tracking request', { method, path, status, duration });
        this.analyticsEngine.writeDataPoint({
            indexes: ['requests_total', method.toUpperCase(), path],
            blobs: [userId || null, error || null],
            doubles: [status, duration],
        });
    }
    trackApiCall(service, success, duration, statusCode) {
        this.logger.info('Tracking API call', { service, success, duration });
        this.analyticsEngine.writeDataPoint({
            indexes: ['api_calls_total', service],
            blobs: [success ? 'success' : 'failure'],
            doubles: [duration, statusCode || 0],
        });
    }
    trackError(error, context) {
        this.logger.error('Tracking error', {
            errorMessage: error.message,
            stack: error.stack,
            context,
        });
        this.analyticsEngine.writeDataPoint({
            indexes: ['errors_total'],
            blobs: [error.name, error.message, error.stack || null],
        });
        SentryService.captureException(error, context);
    }
    trackExecution(label, duration) {
        this.logger.info('Tracking execution', { label, duration });
        this.analyticsEngine.writeDataPoint({
            indexes: ['execution_time', label],
            doubles: [duration],
        });
    }
}
//# sourceMappingURL=MonitoringService.js.map