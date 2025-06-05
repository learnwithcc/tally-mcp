/**
 * Data Models and Schemas
 * 
 * This directory contains TypeScript interfaces and Zod schemas for:
 * - Form configurations and structures
 * - Question types and validation rules
 * - API request/response types
 * - Tally.so data models
 */

// Export error classes for API client
export {
  TallyApiError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from './errors';

// Model definitions will be added in subsequent tasks
export {}; 