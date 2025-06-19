import { Logger, LogLevel, createLogger, logger } from '../logger';
describe('Logger - Core Functionality', () => {
    describe('Constructor and Configuration', () => {
        test('should create logger with default configuration', () => {
            const testLogger = new Logger();
            const config = testLogger.getConfig();
            expect(config.level).toBe(LogLevel.INFO);
            expect(config.component).toBe('MCPServer');
            expect(config.enableConsole).toBe(true);
            expect(config.enableStructured).toBe(true);
            expect(config.redactSensitive).toBe(true);
            expect(config.enableTracing).toBe(true);
        });
        test('should create logger with custom configuration', () => {
            const customConfig = {
                level: LogLevel.DEBUG,
                component: 'TestComponent',
                enableConsole: false,
                sensitiveFields: ['custom_secret'],
            };
            const testLogger = new Logger(customConfig);
            const config = testLogger.getConfig();
            expect(config.level).toBe(LogLevel.DEBUG);
            expect(config.component).toBe('TestComponent');
            expect(config.enableConsole).toBe(false);
            expect(config.sensitiveFields).toContain('custom_secret');
        });
        test('should update configuration', () => {
            const testLogger = new Logger();
            testLogger.updateConfig({ level: LogLevel.ERROR });
            expect(testLogger.getConfig().level).toBe(LogLevel.ERROR);
        });
    });
    describe('Child Logger Creation', () => {
        test('should create child logger with same config but different component', () => {
            const parentLogger = new Logger({ level: LogLevel.DEBUG });
            const childLogger = parentLogger.child('ChildComponent');
            expect(childLogger.getConfig().component).toBe('ChildComponent');
            expect(childLogger.getConfig().level).toBe(LogLevel.DEBUG);
        });
        test('should create child logger with additional config', () => {
            const parentLogger = new Logger();
            const childLogger = parentLogger.child('ChildComponent', { enableConsole: false });
            expect(childLogger.getConfig().component).toBe('ChildComponent');
            expect(childLogger.getConfig().enableConsole).toBe(false);
        });
    });
    describe('Trace ID Management', () => {
        test('should generate unique trace ID on creation', () => {
            const logger1 = new Logger();
            const logger2 = new Logger();
            expect(logger1.getTraceId()).toBeDefined();
            expect(logger2.getTraceId()).toBeDefined();
            expect(logger1.getTraceId()).not.toBe(logger2.getTraceId());
        });
        test('should allow setting custom trace ID', () => {
            const testLogger = new Logger();
            const customTraceId = 'custom-trace-123';
            testLogger.setTraceId(customTraceId);
            expect(testLogger.getTraceId()).toBe(customTraceId);
        });
    });
    describe('Sensitive Data Redaction', () => {
        test('should redact sensitive fields from context', () => {
            const testLogger = new Logger({
                enableStructured: true,
                enableConsole: false,
                redactSensitive: true
            });
            const sensitiveContext = {
                username: 'john',
                password: 'secret123',
                token: 'bearer-token',
                api_key: 'sk-1234567890',
                normalField: 'safe-value'
            };
            const redactedData = testLogger.redactSensitiveData(sensitiveContext);
            expect(redactedData.username).toBe('john');
            expect(redactedData.password).toBe('[REDACTED]');
            expect(redactedData.token).toBe('[REDACTED]');
            expect(redactedData.api_key).toBe('[REDACTED]');
            expect(redactedData.normalField).toBe('safe-value');
        });
        test('should handle nested objects in redaction', () => {
            const testLogger = new Logger({
                enableStructured: true,
                enableConsole: false,
                redactSensitive: true
            });
            const nestedContext = {
                user: {
                    name: 'john',
                    password: 'secret123',
                    settings: {
                        apiKey: 'sk-1234567890',
                        theme: 'dark'
                    }
                }
            };
            const redactedData = testLogger.redactSensitiveData(nestedContext);
            expect(redactedData.user.name).toBe('john');
            expect(redactedData.user.password).toBe('[REDACTED]');
            expect(redactedData.user.settings.apiKey).toBe('[REDACTED]');
            expect(redactedData.user.settings.theme).toBe('dark');
        });
        test('should handle arrays in context', () => {
            const testLogger = new Logger({
                enableStructured: true,
                enableConsole: false,
                redactSensitive: true
            });
            const arrayContext = {
                items: ['item1', 'item2'],
                passwords: ['secret123', 'password456'],
                mixedArray: [{ password: 'secret' }, { safe: 'value' }]
            };
            const redactedData = testLogger.redactSensitiveData(arrayContext);
            expect(redactedData.items).toEqual(['item1', 'item2']);
            expect(redactedData.passwords).toBe('[REDACTED]');
            expect(redactedData.mixedArray[0].password).toBe('[REDACTED]');
            expect(redactedData.mixedArray[1].safe).toBe('value');
        });
    });
    describe('Factory Functions', () => {
        test('should create logger with createLogger function', () => {
            const factoryLogger = createLogger('FactoryComponent', { level: LogLevel.DEBUG });
            expect(factoryLogger.getConfig().component).toBe('FactoryComponent');
            expect(factoryLogger.getConfig().level).toBe(LogLevel.DEBUG);
        });
        test('should provide global logger instance', () => {
            expect(logger).toBeInstanceOf(Logger);
            expect(logger.getConfig().component).toBe('MCPServer');
        });
    });
    describe('Edge Cases', () => {
        test('should handle null and undefined context values', () => {
            const testLogger = new Logger({
                enableStructured: true,
                enableConsole: false,
                redactSensitive: true
            });
            const contextWithNulls = {
                nullValue: null,
                undefinedValue: undefined,
                emptyString: '',
                zeroNumber: 0
            };
            const redactedData = testLogger.redactSensitiveData(contextWithNulls);
            expect(redactedData.nullValue).toBe(null);
            expect(redactedData.undefinedValue).toBe(undefined);
            expect(redactedData.emptyString).toBe('');
            expect(redactedData.zeroNumber).toBe(0);
        });
    });
    describe('Log Level Behavior', () => {
        test('should respect log level thresholds', () => {
            const debugLogger = new Logger({ level: LogLevel.DEBUG });
            const warnLogger = new Logger({ level: LogLevel.WARN });
            const errorLogger = new Logger({ level: LogLevel.ERROR });
            expect(debugLogger.getConfig().level).toBe(LogLevel.DEBUG);
            expect(warnLogger.getConfig().level).toBe(LogLevel.WARN);
            expect(errorLogger.getConfig().level).toBe(LogLevel.ERROR);
        });
    });
    describe('Operation Timing', () => {
        test('should provide timing functionality', () => {
            const testLogger = new Logger({ level: LogLevel.DEBUG });
            const endOperation = testLogger.startOperation('test-operation', { param: 'value' });
            expect(typeof endOperation).toBe('function');
            endOperation();
        });
    });
});
//# sourceMappingURL=logger-simple.test.js.map