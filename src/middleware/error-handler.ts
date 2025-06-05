/**
 * Global Error Handling Middleware
 * 
 * Comprehensive error handling middleware for Express applications
 * with MCP protocol compliance and structured error responses
 */

import { Request, Response } from 'express';
import { ErrorCategory, StructuredError } from '../server';

/**
 * MCP Error Response format
 */
export interface MCPErrorResponse {
  error: {
    code: string;
    message: string;
    category: ErrorCategory;
    requestId?: string;
    timestamp: string;
    details?: Record<string, any>;
  };
}

/**
 * Global error handling middleware for Express
 * Catches all unhandled errors and formats them according to MCP protocol
 */
export function globalErrorHandler(
  error: Error | StructuredError,
  req: Request,
  res: Response,
  _next: Function
): void {
  const requestId = (req as any).requestId || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Default error values
  let statusCode = 500;
  let category = ErrorCategory.INTERNAL;
  let code = 'INTERNAL_ERROR';
  
  // Handle structured errors
  if (isStructuredError(error)) {
    statusCode = error.statusCode;
    category = error.category;
    code = error.code;
  } else {
    // Categorize standard errors
    ({ statusCode, category, code } = categorizeError(error));
  }
  
  // Create MCP-compliant error response
  const errorResponse: MCPErrorResponse = {
    error: {
      code,
      message: error.message || 'An unexpected error occurred',
      category,
      requestId,
      timestamp,
    },
  };
  
  // Add additional details for non-production environments
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.details = {
      stack: error.stack,
      name: error.name,
    };
  }
  
  // Set appropriate headers
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json');
  
  // Send error response
  res.json(errorResponse);
  
  // Don't call next() - we're handling the error here
}

/**
 * Async error wrapper for Express route handlers
 * Catches promise rejections and passes them to error middleware
 */
export function asyncErrorHandler(
  fn: (req: Request, res: Response, next: Function) => Promise<any>
) {
  return (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
}

/**
 * Not Found (404) middleware
 * Handles requests to non-existent routes
 */
export function notFoundHandler(req: Request, _res: Response, next: Function): void {
  const error = createNotFoundError(req.path, (req as any).requestId);
  next(error);
}

/**
 * Unhandled rejection handler for process-level errors
 */
export function setupProcessErrorHandlers(logger?: (level: string, message: string, error?: Error) => void): void {
  process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
    const message = `Unhandled Promise Rejection: ${reason}`;
    
    if (logger) {
      logger('error', message, reason instanceof Error ? reason : new Error(String(reason)));
    } else {
      console.error(message, reason);
    }
    
    // In production, you might want to exit the process
    // process.exit(1);
  });
  
  process.on('uncaughtException', (error: Error) => {
    const message = `Uncaught Exception: ${error.message}`;
    
    if (logger) {
      logger('fatal', message, error);
    } else {
      console.error(message, error);
    }
    
    // Exit the process for uncaught exceptions
    process.exit(1);
  });
}

/**
 * Check if error is a structured error
 */
function isStructuredError(error: any): error is StructuredError {
  return error && 
         typeof error.category === 'string' &&
         typeof error.code === 'string' &&
         typeof error.statusCode === 'number' &&
         typeof error.isOperational === 'boolean';
}

/**
 * Categorize standard JavaScript errors
 */
function categorizeError(error: Error): { statusCode: number; category: ErrorCategory; code: string } {
  const message = error.message.toLowerCase();
  
  // Network-related errors
  if (message.includes('econnrefused') || message.includes('enotfound') || message.includes('timeout')) {
    return {
      statusCode: 503,
      category: ErrorCategory.NETWORK,
      code: 'NETWORK_ERROR',
    };
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      statusCode: 400,
      category: ErrorCategory.VALIDATION,
      code: 'VALIDATION_ERROR',
    };
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return {
      statusCode: 401,
      category: ErrorCategory.AUTHENTICATION,
      code: 'AUTHENTICATION_ERROR',
    };
  }
  
  // Authorization errors
  if (message.includes('forbidden') || message.includes('permission')) {
    return {
      statusCode: 403,
      category: ErrorCategory.AUTHORIZATION,
      code: 'AUTHORIZATION_ERROR',
    };
  }
  
  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return {
      statusCode: 429,
      category: ErrorCategory.RATE_LIMIT,
      code: 'RATE_LIMIT_ERROR',
    };
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return {
      statusCode: 408,
      category: ErrorCategory.TIMEOUT,
      code: 'TIMEOUT_ERROR',
    };
  }
  
  // Default to internal error
  return {
    statusCode: 500,
    category: ErrorCategory.INTERNAL,
    code: 'INTERNAL_ERROR',
  };
}

/**
 * Create a structured not found error
 */
function createNotFoundError(path: string, requestId?: string): StructuredError {
  const error = new Error(`Route not found: ${path}`) as StructuredError;
  error.category = ErrorCategory.VALIDATION;
  error.code = 'ROUTE_NOT_FOUND';
  error.statusCode = 404;
  error.isOperational = true;
  if (requestId) {
    error.requestId = requestId;
  }
  error.context = { path };
  
  return error;
} 