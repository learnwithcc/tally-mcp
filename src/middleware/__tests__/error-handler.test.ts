/**
 * Tests for Error Handler Middleware
 */

import { Request, Response } from 'express';
import { 
  globalErrorHandler, 
  asyncErrorHandler, 
  notFoundHandler, 
  setupProcessErrorHandlers,
  MCPErrorResponse 
} from '../error-handler';
import { ErrorCategory, StructuredError } from '../../server';

// Mock Express Request and Response objects
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    path: '/test',
    method: 'GET',
    url: '/test',
    headers: {},
    params: {},
    query: {},
    body: {},
    ...overrides
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    statusCode: 200,
    headers: {}
  } as unknown as Response;
  
  return res;
}

describe('Error Handler Middleware', () => {
  let mockNext: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: string | undefined;

  beforeEach(() => {
    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  describe('globalErrorHandler', () => {
    it('should handle standard errors with default values', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Test error',
          category: ErrorCategory.INTERNAL,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle structured errors', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest({ requestId: 'test-123' } as any);
      const res = createMockResponse();
      
      const structuredError = new Error('Validation failed') as StructuredError;
      structuredError.category = ErrorCategory.VALIDATION;
      structuredError.code = 'INVALID_INPUT';
      structuredError.statusCode = 400;
      structuredError.isOperational = true;

      globalErrorHandler(structuredError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          category: ErrorCategory.VALIDATION,
          requestId: 'test-123',
          timestamp: expect.any(String)
        }
      });
    });

    it('should include error details in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      globalErrorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Test error',
          category: ErrorCategory.INTERNAL,
          requestId: 'unknown',
          timestamp: expect.any(String),
          details: {
            stack: 'Error stack trace',
            name: 'Error'
          }
        }
      });
    });

    it('should not include error details in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      globalErrorHandler(error, req, res, mockNext);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0] as MCPErrorResponse;
      expect(callArgs.error.details).toBeUndefined();
    });

    it('should categorize network errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('ECONNREFUSED connection failed');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NETWORK_ERROR',
          message: 'ECONNREFUSED connection failed',
          category: ErrorCategory.NETWORK,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize validation errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Validation failed: invalid email');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed: invalid email',
          category: ErrorCategory.VALIDATION,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize authentication errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Unauthorized access');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Unauthorized access',
          category: ErrorCategory.AUTHENTICATION,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize authorization errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Forbidden: insufficient permissions');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Forbidden: insufficient permissions',
          category: ErrorCategory.AUTHORIZATION,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize rate limit errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Rate limit exceeded');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'RATE_LIMIT_ERROR',
          message: 'Rate limit exceeded',
          category: ErrorCategory.RATE_LIMIT,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize timeout errors correctly (as network errors due to categorization logic)', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Connection timeout occurred');

      globalErrorHandler(error, req, res, mockNext);

      // Note: Due to categorization order, timeout errors are caught by network error check first
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Connection timeout occurred',
          category: ErrorCategory.NETWORK,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should categorize pure timeout errors correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Operation timeout exceeded');

      globalErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Operation timeout exceeded',
          category: ErrorCategory.NETWORK,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle errors without messages', () => {
      process.env.NODE_ENV = 'production';
      
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error();
      error.message = '';

      globalErrorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          category: ErrorCategory.INTERNAL,
          requestId: 'unknown',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('asyncErrorHandler', () => {
    it('should catch and pass async errors to next middleware', async () => {
      const asyncFunction = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFunction = asyncErrorHandler(asyncFunction);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedFunction(req, res, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(new Error('Async error'));
    });

    it('should handle successful async functions', async () => {
      const asyncFunction = jest.fn().mockResolvedValue('success');
      const wrappedFunction = asyncErrorHandler(asyncFunction);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedFunction(req, res, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(req, res, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle non-async functions that return values', async () => {
      const syncFunction = jest.fn().mockReturnValue('sync result');
      const wrappedFunction = asyncErrorHandler(syncFunction);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedFunction(req, res, mockNext);

      expect(syncFunction).toHaveBeenCalledWith(req, res, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should create and pass a 404 structured error', () => {
      const req = createMockRequest({ path: '/non-existent', requestId: 'req-123' } as any);
      const res = createMockResponse();

      notFoundHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route not found: /non-existent',
          category: ErrorCategory.VALIDATION,
          code: 'ROUTE_NOT_FOUND',
          statusCode: 404,
          isOperational: true,
          requestId: 'req-123',
          context: { path: '/non-existent' }
        })
      );
    });

    it('should handle requests without requestId', () => {
      const req = createMockRequest({ path: '/missing' });
      const res = createMockResponse();

      notFoundHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route not found: /missing',
          category: ErrorCategory.VALIDATION,
          code: 'ROUTE_NOT_FOUND',
          statusCode: 404,
          isOperational: true,
          context: { path: '/missing' }
        })
      );
    });
  });

  describe('setupProcessErrorHandlers', () => {
    let originalProcessOn: typeof process.on;
    let processOnSpy: jest.SpyInstance;

    beforeEach(() => {
      originalProcessOn = process.on;
      processOnSpy = jest.spyOn(process, 'on').mockImplementation();
    });

    afterEach(() => {
      process.on = originalProcessOn;
      processOnSpy.mockRestore();
    });

    it('should setup unhandledRejection and uncaughtException handlers', () => {
      setupProcessErrorHandlers();

      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });

    it('should setup handlers with custom logger', () => {
      const mockLogger = jest.fn();
      setupProcessErrorHandlers(mockLogger);

      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });

    it('should handle unhandled rejection with logger', () => {
      const mockLogger = jest.fn();
      setupProcessErrorHandlers(mockLogger);

      // Get the registered handler
      const rejectionHandler = processOnSpy.mock.calls.find(call => call[0] === 'unhandledRejection')?.[1];
      
      const testError = new Error('Test rejection');
      rejectionHandler(testError, Promise.resolve());

      expect(mockLogger).toHaveBeenCalledWith(
        'error',
        'Unhandled Promise Rejection: Error: Test rejection',
        testError
      );
    });

    it('should handle unhandled rejection without logger', () => {
      setupProcessErrorHandlers();

      // Get the registered handler
      const rejectionHandler = processOnSpy.mock.calls.find(call => call[0] === 'unhandledRejection')?.[1];
      
      const testReason = 'Test rejection reason';
      rejectionHandler(testReason, Promise.resolve());

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unhandled Promise Rejection: Test rejection reason',
        'Test rejection reason'
      );
    });

    it('should handle uncaught exception with logger', () => {
      const mockLogger = jest.fn();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called');
      });

      setupProcessErrorHandlers(mockLogger);

      // Get the registered handler
      const exceptionHandler = processOnSpy.mock.calls.find(call => call[0] === 'uncaughtException')?.[1];
      
      const testError = new Error('Test exception');
      
      expect(() => {
        exceptionHandler(testError);
      }).toThrow('Process exit called');

      expect(mockLogger).toHaveBeenCalledWith(
        'fatal',
        'Uncaught Exception: Test exception',
        testError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);

      processExitSpy.mockRestore();
    });

    it('should handle uncaught exception without logger', () => {
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called');
      });

      setupProcessErrorHandlers();

      // Get the registered handler
      const exceptionHandler = processOnSpy.mock.calls.find(call => call[0] === 'uncaughtException')?.[1];
      
      const testError = new Error('Test exception');
      
      expect(() => {
        exceptionHandler(testError);
      }).toThrow('Process exit called');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Uncaught Exception: Test exception',
        testError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);

      processExitSpy.mockRestore();
    });
  });
}); 