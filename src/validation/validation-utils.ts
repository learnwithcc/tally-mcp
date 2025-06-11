/**
 * Validation utility functions
 */

import {
  ValidationError,
  ValidationResult,
  ValidationSeverity
} from './types';

/**
 * Utility functions for validation operations
 */
export class ValidationUtils {
  /**
   * Create a validation error with common defaults
   */
  static createError(
    code: string,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
    options: Partial<ValidationError> = {}
  ): ValidationError {
    return {
      code,
      message,
      severity,
      ...options
    };
  }

  /**
   * Merge multiple validation results
   */
  static mergeResults(...results: ValidationResult[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    for (const result of results) {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      info.push(...result.info);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: info.length
      }
    };
  }

  /**
   * Format validation error for display
   */
  static formatError(error: ValidationError): string {
    let formatted = `[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`;
    
    if (error.path) {
      formatted += ` (at ${error.path})`;
    }

    if (error.expected && error.actual !== undefined) {
      formatted += `\n  Expected: ${error.expected}`;
      formatted += `\n  Actual: ${error.actual}`;
    }

    if (error.specReference) {
      formatted += `\n  Reference: ${error.specReference}`;
    }

    return formatted;
  }

  /**
   * Calculate schema complexity score
   */
  static calculateComplexity(schema: Record<string, any>): number {
    if (!schema || typeof schema !== 'object') {
      return 0;
    }

    let complexity = 1; // Base complexity

    // Add complexity for nested properties
    if (schema.properties && typeof schema.properties === 'object') {
      complexity += Object.keys(schema.properties).length;
      
      // Recursively calculate nested complexity
      for (const value of Object.values(schema.properties)) {
        if (value && typeof value === 'object') {
          complexity += ValidationUtils.calculateComplexity(value as Record<string, any>) * 0.5;
        }
      }
    }

    return Math.round(complexity * 10) / 10;
  }
} 