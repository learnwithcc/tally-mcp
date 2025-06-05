/**
 * Standardized Error Classes for Tally API Client
 * 
 * These error classes provide structured error handling for different
 * HTTP status codes and API failure scenarios.
 */

/**
 * Base API error class that all other API errors extend
 */
export abstract class TallyApiError extends Error {
  public readonly isRetryable: boolean;
  public readonly statusCode?: number;
  public readonly statusText?: string;
  public readonly headers?: Record<string, string>;
  public readonly requestId?: string;
  public readonly timestamp: Date;
  public readonly cause?: Error;

  constructor(
    message: string,
    statusCode?: number,
    statusText?: string,
    headers?: Record<string, string>,
    isRetryable: boolean = false,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    if (statusCode !== undefined) this.statusCode = statusCode;
    if (statusText !== undefined) this.statusText = statusText;
    if (headers !== undefined) this.headers = headers;
    this.isRetryable = isRetryable;
    this.timestamp = new Date();
    if (headers?.['x-request-id']) this.requestId = headers['x-request-id'];
    else if (headers?.['request-id']) this.requestId = headers['request-id'];
    if (cause !== undefined) this.cause = cause;
  }

  /**
   * Get a user-friendly error message
   */
  public getUserMessage(): string {
    return this.message;
  }

  /**
   * Get detailed error information for debugging
   */
  public getDebugInfo(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      statusText: this.statusText,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString(),
      isRetryable: this.isRetryable,
      headers: this.headers,
    };
  }
}

/**
 * Authentication Error (401/403)
 * Thrown when authentication fails or token is invalid
 */
export class AuthenticationError extends TallyApiError {
  constructor(
    message: string = 'Authentication failed',
    statusCode?: number,
    statusText?: string,
    headers?: Record<string, string>,
    cause?: Error
  ) {
    super(message, statusCode, statusText, headers, false, cause);
  }

  public override getUserMessage(): string {
    if (this.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.statusCode === 403) {
      return 'You do not have permission to access this resource.';
    }
    return 'Authentication failed. Please check your credentials.';
  }
}

/**
 * Bad Request Error (400)
 * Thrown when the request is malformed or invalid
 */
export class BadRequestError extends TallyApiError {
  public readonly validationErrors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;

  constructor(
    message: string = 'Bad request',
    statusCode: number = 400,
    statusText?: string,
    headers?: Record<string, string>,
    validationErrors?: Array<{ field?: string; message: string; code?: string }>,
    cause?: Error
  ) {
    super(message, statusCode, statusText, headers, false, cause);
    if (validationErrors !== undefined) this.validationErrors = validationErrors;
  }

  public override getUserMessage(): string {
    if (this.validationErrors && this.validationErrors.length > 0) {
      const fieldErrors = this.validationErrors
        .filter(error => error.field)
        .map(error => `${error.field}: ${error.message}`)
        .join(', ');
      
      if (fieldErrors) {
        return `Validation failed: ${fieldErrors}`;
      }
    }
    return 'The request contains invalid data. Please check your input and try again.';
  }
}

/**
 * Not Found Error (404)
 * Thrown when the requested resource is not found
 */
export class NotFoundError extends TallyApiError {
  constructor(
    message: string = 'Resource not found',
    statusCode: number = 404,
    statusText?: string,
    headers?: Record<string, string>,
    cause?: Error
  ) {
    super(message, statusCode, statusText, headers, false, cause);
  }

  public override getUserMessage(): string {
    return 'The requested resource was not found.';
  }
}

/**
 * Rate Limit Error (429)
 * Thrown when rate limits are exceeded
 */
export class RateLimitError extends TallyApiError {
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly resetTime?: Date;

  constructor(
    message: string = 'Rate limit exceeded',
    statusCode: number = 429,
    statusText?: string,
    headers?: Record<string, string>,
    cause?: Error
  ) {
    super(message, statusCode, statusText, headers, true, cause);
    
    // Parse rate limit headers
    if (headers) {
      if (headers['retry-after']) {
        const retryAfterParsed = parseInt(headers['retry-after'], 10);
        if (!isNaN(retryAfterParsed)) this.retryAfter = retryAfterParsed;
      }
      if (headers['x-ratelimit-limit']) {
        const limitParsed = parseInt(headers['x-ratelimit-limit'], 10);
        if (!isNaN(limitParsed)) this.limit = limitParsed;
      }
      if (headers['x-ratelimit-remaining']) {
        const remainingParsed = parseInt(headers['x-ratelimit-remaining'], 10);
        if (!isNaN(remainingParsed)) this.remaining = remainingParsed;
      }
      if (headers['x-ratelimit-reset']) {
        const resetTimeParsed = parseInt(headers['x-ratelimit-reset'], 10);
        if (!isNaN(resetTimeParsed)) this.resetTime = new Date(resetTimeParsed * 1000);
      }
    }
  }

  public override getUserMessage(): string {
    if (this.retryAfter) {
      return `Rate limit exceeded. Please wait ${this.retryAfter} seconds before trying again.`;
    }
    if (this.resetTime) {
      return `Rate limit exceeded. Limit resets at ${this.resetTime.toLocaleTimeString()}.`;
    }
    return 'Rate limit exceeded. Please try again later.';
  }
}

/**
 * Server Error (500+)
 * Thrown when the server encounters an internal error
 */
export class ServerError extends TallyApiError {
  constructor(
    message: string = 'Internal server error',
    statusCode: number = 500,
    statusText?: string,
    headers?: Record<string, string>,
    cause?: Error
  ) {
    // Server errors are typically retryable
    super(message, statusCode, statusText, headers, true, cause);
  }

  public override getUserMessage(): string {
    if (this.statusCode === 502) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (this.statusCode === 503) {
      return 'Service is currently under maintenance. Please try again later.';
    }
    if (this.statusCode === 504) {
      return 'Request timed out. Please try again.';
    }
    return 'A server error occurred. Please try again later.';
  }
}

/**
 * Network Error
 * Thrown when network connectivity issues occur
 */
export class NetworkError extends TallyApiError {
  constructor(
    message: string = 'Network error',
    cause?: Error
  ) {
    super(message, undefined, undefined, undefined, true, cause);
  }

  public override getUserMessage(): string {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
}

/**
 * Timeout Error
 * Thrown when requests exceed the configured timeout
 */
export class TimeoutError extends TallyApiError {
  constructor(
    message: string = 'Request timeout',
    cause?: Error
  ) {
    super(message, undefined, undefined, undefined, true, cause);
  }

  public override getUserMessage(): string {
    return 'Request timed out. Please try again.';
  }
}

/**
 * Factory function to create appropriate error based on HTTP status code
 */
export function createErrorFromResponse(
  statusCode: number,
  statusText: string,
  headers: Record<string, string>,
  responseData?: any,
  originalError?: Error
): TallyApiError {
  const message = responseData?.message || responseData?.error || statusText || 'Unknown error';
  
  switch (statusCode) {
    case 400:
      return new BadRequestError(
        message,
        statusCode,
        statusText,
        headers,
        responseData?.errors || responseData?.validation_errors,
        originalError
      );
    
    case 401:
    case 403:
      return new AuthenticationError(message, statusCode, statusText, headers, originalError);
    
    case 404:
      return new NotFoundError(message, statusCode, statusText, headers, originalError);
    
    case 429:
      return new RateLimitError(message, statusCode, statusText, headers, originalError);
    
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode, statusText, headers, originalError);
      }
      
      // For other 4xx errors, use BadRequestError as fallback
      if (statusCode >= 400 && statusCode < 500) {
        return new BadRequestError(message, statusCode, statusText, headers, undefined, originalError);
      }
      
      // Fallback for unexpected status codes
      return new ServerError(message, statusCode, statusText, headers, originalError);
  }
} 