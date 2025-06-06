/**
 * Middleware Modules
 * 
 * This directory contains Express middleware for:
 * - Input sanitization and XSS prevention
 * - Request validation with Zod schemas
 * - Error handling and logging
 * - Security headers and CORS
 * - Rate limiting and abuse prevention
 */

// Export sanitization middleware
export {
  createSanitizationMiddleware,
  SanitizationMiddleware,
  ManualSanitization,
  type SanitizationMiddlewareOptions,
} from './sanitization';

// Export validation middleware
export {
  createValidationMiddleware,
  ValidationMiddleware,
  CommonSchemas,
  validateWithSchema,
  createTypedValidator,
  formatValidationError,
  type ValidationOptions,
} from './validation';

// Export error handling middleware
export * from './error-handler'; 