import { MonitoringServiceImpl } from '../MonitoringService';
describe('MonitoringServiceImpl', () => {
    let monitoringService;
    let mockAnalyticsEngine;
    let mockLogger;
    beforeEach(() => {
        mockAnalyticsEngine = {
            writeDataPoint: jest.fn(),
        };
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };
        monitoringService = new MonitoringServiceImpl(mockAnalyticsEngine, mockLogger);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('trackRequest', () => {
        it('should track request metrics and log info', () => {
            monitoringService.trackRequest('GET', '/test', 200, 150, 'user1', undefined);
            expect(mockLogger.info).toHaveBeenCalledWith('Tracking request', {
                method: 'GET',
                path: '/test',
                status: 200,
                duration: 150,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['requests_total', 'GET', '/test'],
                blobs: ['user1', null],
                doubles: [200, 150],
            });
        });
        it('should handle requests with errors', () => {
            monitoringService.trackRequest('POST', '/fail', 500, 200, 'user2', 'Server Error');
            expect(mockLogger.info).toHaveBeenCalledWith('Tracking request', {
                method: 'POST',
                path: '/fail',
                status: 500,
                duration: 200,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['requests_total', 'POST', '/fail'],
                blobs: ['user2', 'Server Error'],
                doubles: [500, 200],
            });
        });
    });
    describe('trackApiCall', () => {
        it('should track a successful API call', () => {
            monitoringService.trackApiCall('Tally.so', true, 300, 200);
            expect(mockLogger.info).toHaveBeenCalledWith('Tracking API call', {
                service: 'Tally.so',
                success: true,
                duration: 300,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['api_calls_total', 'Tally.so'],
                blobs: ['success'],
                doubles: [300, 200],
            });
        });
        it('should track a failed API call', () => {
            monitoringService.trackApiCall('Tally.so', false, 500, 503);
            expect(mockLogger.info).toHaveBeenCalledWith('Tracking API call', {
                service: 'Tally.so',
                success: false,
                duration: 500,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['api_calls_total', 'Tally.so'],
                blobs: ['failure'],
                doubles: [500, 503],
            });
        });
    });
    describe('trackError', () => {
        it('should track an error with context', () => {
            const error = new Error('Something went wrong');
            error.stack = 'error stack trace';
            const context = { userId: 'user123' };
            monitoringService.trackError(error, context);
            expect(mockLogger.error).toHaveBeenCalledWith('Tracking error', {
                errorMessage: 'Something went wrong',
                stack: 'error stack trace',
                context,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['errors_total'],
                blobs: ['Error', 'Something went wrong', 'error stack trace'],
            });
        });
    });
    describe('trackExecution', () => {
        it('should track execution time of a labeled process', () => {
            monitoringService.trackExecution('database-query', 75);
            expect(mockLogger.info).toHaveBeenCalledWith('Tracking execution', {
                label: 'database-query',
                duration: 75,
            });
            expect(mockAnalyticsEngine.writeDataPoint).toHaveBeenCalledWith({
                indexes: ['execution_time', 'database-query'],
                doubles: [75],
            });
        });
    });
});
//# sourceMappingURL=MonitoringService.test.js.map