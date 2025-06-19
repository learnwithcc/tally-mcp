/**
 * Logger Unit Tests
 * 
 * Tests for the centralized Logger class functionality
 */

import { Logger, LogLevel, LoggerConfig, createLogger, logger } from '../logger';

// Mock console methods - restore original implementations first if they exist
const mockConsoleLog = jest.spyOn(console, 'log');
const mockConsoleError = jest.spyOn(console, 'error');
const mockConsoleWarn = jest.spyOn(console, 'warn');
const mockConsoleDebug = jest.spyOn(console, 'debug');

// Store original implementations
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;

describe('Logger', () => {
  beforeAll(() => {
    // Restore original console methods first, then mock them
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
    
    // Now mock them for our tests
    mockConsoleLog.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    mockConsoleWarn.mockImplementation(() => {});
    mockConsoleDebug.mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleDebug.mockRestore();
  });

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
      const customConfig: Partial<LoggerConfig> = {
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

  describe('Log Level Filtering', () => {
    test('should respect log level configuration', () => {
      const testLogger = new Logger({ 
        level: LogLevel.WARN,
        enableConsole: true,
        enableStructured: false
      });

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      // Debug and info should be filtered out
      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      
      // Warn and error should be logged
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Logging Methods', () => {
    test('should log fatal messages', () => {
      const testLogger = new Logger({ 
        level: LogLevel.FATAL,
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.fatal('Fatal error occurred');
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    test('should log error messages', () => {
      const testLogger = new Logger({
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.error('Error occurred');
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    test('should log warning messages', () => {
      const testLogger = new Logger({
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.warn('Warning occurred');
      
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    test('should log info messages', () => {
      const testLogger = new Logger({
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.info('Info message');
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    test('should log debug messages', () => {
      const testLogger = new Logger({ 
        level: LogLevel.DEBUG,
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.debug('Debug message');
      
      expect(mockConsoleDebug).toHaveBeenCalled();
    });

    test('should log trace messages', () => {
      const testLogger = new Logger({ 
        level: LogLevel.TRACE,
        enableConsole: true,
        enableStructured: false
      });
      
      testLogger.trace('Trace message');
      
      expect(mockConsoleDebug).toHaveBeenCalled();
    });
  });

  describe('Structured Logging', () => {
    test('should output structured JSON when enabled', () => {
      const testLogger = new Logger({
        enableStructured: true,
        enableConsole: false,
        component: 'TestComponent'
      });

      testLogger.info('Test message', { key: 'value' });

      expect(mockConsoleLog).toHaveBeenCalled();
      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.message).toBe('Test message');
      expect(parsed.component).toBe('TestComponent');
      expect(parsed.level).toBe(LogLevel.INFO);
      expect(parsed.levelName).toBe('INFO');
      expect(parsed.context.key).toBe('value');
      expect(parsed.timestamp).toBeDefined();
    });

    test('should include trace ID in structured logs when tracing enabled', () => {
      const testLogger = new Logger({
        enableStructured: true,
        enableConsole: false,
        enableTracing: true
      });

      testLogger.info('Test message');

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.traceId).toBeDefined();
      expect(typeof parsed.traceId).toBe('string');
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

      testLogger.info('Test message', sensitiveContext);

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.context.username).toBe('john');
      expect(parsed.context.password).toBe('[REDACTED]');
      expect(parsed.context.token).toBe('[REDACTED]');
      expect(parsed.context.api_key).toBe('[REDACTED]');
      expect(parsed.context.normalField).toBe('safe-value');
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

      testLogger.info('Test message', nestedContext);

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.context.user.name).toBe('john');
      expect(parsed.context.user.password).toBe('[REDACTED]');
      expect(parsed.context.user.settings.apiKey).toBe('[REDACTED]');
      expect(parsed.context.user.settings.theme).toBe('dark');
    });

    test('should not redact when redaction is disabled', () => {
      const testLogger = new Logger({
        enableStructured: true,
        enableConsole: false,
        redactSensitive: false
      });

      const sensitiveContext = {
        password: 'secret123',
        token: 'bearer-token'
      };

      testLogger.info('Test message', sensitiveContext);

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.context.password).toBe('secret123');
      expect(parsed.context.token).toBe('bearer-token');
    });
  });

  describe('Error Logging', () => {
    test('should include error details in log entry', () => {
      const testLogger = new Logger({
        enableStructured: true,
        enableConsole: false
      });

      const testError = new Error('Test error message');
      testError.stack = 'Error stack trace';
      (testError as any).code = 'TEST_ERROR';

      testLogger.error('Error occurred', undefined, testError);

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error message');
      expect(parsed.error.stack).toBe('Error stack trace');
      expect(parsed.error.code).toBe('TEST_ERROR');
    });
  });

  describe('Operation Timing', () => {
    test('should track operation timing', async () => {
      const testLogger = new Logger({ level: LogLevel.DEBUG });
      
      const endOperation = testLogger.startOperation('test-operation', { param: 'value' });
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      
      endOperation();

      // Should have logged start and end
      expect(mockConsoleDebug).toHaveBeenCalledTimes(2);
    });
  });

  describe('Console Output Formatting', () => {
    test('should format console output with all components', () => {
      const testLogger = new Logger({
        enableStructured: false,
        enableConsole: true,
        component: 'TestComponent'
      });

      testLogger.setTraceId('trace-123');
      testLogger.info('Test message', { key: 'value' }, undefined, 'req-456', 'test-op');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logMessage = mockConsoleLog.mock.calls[0]?.[0];
      expect(logMessage).toBeDefined();

      expect(logMessage).toContain('[TestComponent]');
      expect(logMessage).toContain('[req-456]');
      expect(logMessage).toContain('[trace:trace-12'); // First 8 chars
      expect(logMessage).toContain('[op:test-op]');
      expect(logMessage).toContain('Test message');
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
        enableConsole: false
      });

      testLogger.info('Test message', { 
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroNumber: 0
      });

      expect(mockConsoleLog).toHaveBeenCalled();
      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.context.nullValue).toBe(null);
      expect(parsed.context.undefinedValue).toBe(undefined);
      expect(parsed.context.emptyString).toBe('');
      expect(parsed.context.zeroNumber).toBe(0);
    });

    test('should handle arrays in context', () => {
      const testLogger = new Logger({
        enableStructured: true,
        enableConsole: false,
        redactSensitive: true
      });

      testLogger.info('Test message', {
        items: ['item1', 'item2'],
        secretArray: ['password', 'token'],
        mixedArray: [{ password: 'secret' }, { safe: 'value' }]
      });

      const loggedData = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(loggedData);

      expect(parsed.context.items).toEqual(['item1', 'item2']);
      expect(parsed.context.secretArray).toEqual(['[REDACTED]', '[REDACTED]']);
      expect(parsed.context.mixedArray[0].password).toBe('[REDACTED]');
      expect(parsed.context.mixedArray[1].safe).toBe('value');
    });
  });
}); 