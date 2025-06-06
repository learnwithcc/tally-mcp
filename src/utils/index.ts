/**
 * Utility Functions and Helpers
 * 
 * This directory contains:
 * - Configuration management
 * - Environment variable handling
 * - Common helper functions
 * - Validation utilities
 * - Logging and debugging tools
 */

// Export configuration module
export { config, validateConfig, type Config } from './config';

// Export input sanitization utilities
export { 
  sanitizeString, 
  sanitizeObject, 
  sanitizeArray, 
  InputValidator, 
  SanitizationPresets,
  type SanitizationOptions 
} from './input-sanitizer';

// Additional utility implementations will be added in subsequent tasks 