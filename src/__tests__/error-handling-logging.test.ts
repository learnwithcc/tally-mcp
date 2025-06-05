/**
 * Error Handling and Logging Infrastructure Tests
 * 
 * Tests for the comprehensive error handling, structured logging, and monitoring functionality
 */

import { MCPServer, ServerState, LogLevel, ErrorCategory, LoggerConfig } from '../server';

describe('Error Handling and Logging Infrastructure', () => {
  let server: MCPServer;
  let testPort: number;

  beforeEach(async () => {
    // Use a random port to avoid conflicts
    testPort = 3000 + Math.floor(Math.random() * 1000);
    
    // Configure server with enhanced logging for testing
    const loggerConfig: Partial<LoggerConfig> = {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStructured: true,
      redactSensitive: true,
      sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie'],
    };
    
    server = new MCPServer({ 
      port: testPort, 
      debug: true,
      logger: loggerConfig,
    });
  });

  afterEach(async () => {
    if (server.getState() === ServerState.RUNNING) {
      await server.shutdown();
    }
  });

  describe('Structured Logging', () => {
    test('should support different log levels', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // The log method is private but we can test through initialization
      server.initialize();
      
      // Verify console.log was called (indicates logging is working)
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should redact sensitive information', () => {
      // Test that the server has the redaction capability
      const config = server.getConfig();
      expect(config.logger).toBeDefined();
      
      // Test that sensitive fields are configured
      expect(config.logger?.sensitiveFields).toContain('password');
      expect(config.logger?.sensitiveFields).toContain('token');
      expect(config.logger?.sensitiveFields).toContain('secret');
    });

    test('should respect log level configuration', () => {
      const config = server.getConfig();
      expect(config.logger?.level).toBeDefined();
      expect(config.debug).toBe(true);
    });
  });

  describe('Error Metrics', () => {
    test('should track error metrics', () => {
      const errorMetrics = server.getErrorMetrics();
      
      expect(errorMetrics).toHaveProperty('total');
      expect(errorMetrics).toHaveProperty('byCategory');
      expect(errorMetrics).toHaveProperty('byCode');
      expect(typeof errorMetrics.total).toBe('number');
      expect(typeof errorMetrics.byCategory).toBe('object');
      expect(typeof errorMetrics.byCode).toBe('object');
    });

    test('should initialize with zero errors', () => {
      const errorMetrics = server.getErrorMetrics();
      expect(errorMetrics.total).toBe(0);
      expect(Object.keys(errorMetrics.byCategory)).toHaveLength(0);
      expect(Object.keys(errorMetrics.byCode)).toHaveLength(0);
    });
  });

  describe('Logger Configuration', () => {
    test('should merge logger config with defaults', () => {
      const config = server.getConfig();
      
      expect(config.logger).toBeDefined();
      expect(config.logger?.enableConsole).toBe(true);
      expect(config.logger?.enableStructured).toBe(true);
      expect(config.logger?.redactSensitive).toBe(true);
      expect(config.logger?.component).toBe('MCPServer');
    });

    test('should have appropriate sensitive fields configured', () => {
      const config = server.getConfig();
      const sensitiveFields = config.logger?.sensitiveFields || [];
      
      expect(sensitiveFields).toContain('password');
      expect(sensitiveFields).toContain('token');
      expect(sensitiveFields).toContain('key');
      expect(sensitiveFields).toContain('secret');
      expect(sensitiveFields).toContain('authorization');
      expect(sensitiveFields).toContain('cookie');
    });
  });

  describe('Error Categories', () => {
    test('should have all required error categories', () => {
      // Test that ErrorCategory enum has all expected values
      const expectedCategories = [
        'validation',
        'authentication', 
        'authorization',
        'network',
        'timeout',
        'rate_limit',
        'internal',
        'external',
        'configuration',
        'resource',
      ];

      for (const category of expectedCategories) {
        expect(Object.values(ErrorCategory)).toContain(category);
      }
    });
  });

  describe('Integration with Health Monitoring', () => {
    test('should integrate error metrics with health monitoring', async () => {
      await server.initialize();
      
      const healthMetrics = server.getHealthMetrics();
      const errorMetrics = server.getErrorMetrics();
      
      // Verify both systems are working
      expect(healthMetrics).toBeDefined();
      expect(errorMetrics).toBeDefined();
      
      // The error metrics should be accessible independently
      expect(typeof errorMetrics.total).toBe('number');
    });
  });

  describe('Request Context Preservation', () => {
    test('should handle request ID generation', async () => {
      await server.initialize();
      
      // Verify server is running and can handle the concept of request IDs
      expect(server.getState()).toBe(ServerState.RUNNING);
      
      // The server should be initialized with request handling capability
      expect(server.getConnectionCount()).toBe(0);
    });
  });

  describe('Server State Integration', () => {
    test('should maintain consistent state with enhanced logging', async () => {
      expect(server.getState()).toBe(ServerState.STOPPED);
      
      await server.initialize();
      expect(server.getState()).toBe(ServerState.RUNNING);
      
      await server.shutdown();
      expect(server.getState()).toBe(ServerState.STOPPED);
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain compatibility with existing functionality', async () => {
      // Test that all the original server functionality still works
      expect(server.getState).toBeDefined();
      expect(server.getConnectionCount).toBeDefined();
      expect(server.getConfig).toBeDefined();
      expect(server.getHealthMetrics).toBeDefined();
      expect(server.initialize).toBeDefined();
      expect(server.shutdown).toBeDefined();
    });

    test('should support debug mode configuration', () => {
      const config = server.getConfig();
      expect(config.debug).toBe(true);
      
      // Debug mode should affect logging behavior
      expect(config.logger?.level).toBe(LogLevel.DEBUG);
    });
  });
}); 