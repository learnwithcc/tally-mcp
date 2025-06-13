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

  /**
   * Format a path array into a dot-notation string
   */
  static formatPath(path: string[]): string {
    if (!path || path.length === 0) {
      return '';
    }

    let formatted = path[0] || '';
    for (let i = 1; i < path.length; i++) {
      const segment = path[i] || '';
      if (/^\d+$/.test(segment)) {
        // Array index
        formatted += `[${segment}]`;
      } else {
        // Object property
        formatted += `.${segment}`;
      }
    }
    return formatted;
  }

  /**
   * Check if a string is a valid JSON Schema type
   */
  static isValidJsonSchemaType(type: string): boolean {
    if (!type || typeof type !== 'string') {
      return false;
    }
    const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];
    return validTypes.includes(type);
  }

  /**
   * Merge multiple validation results (alias for mergeResults)
   */
  static mergeValidationResults(...results: ValidationResult[]): ValidationResult {
    return ValidationUtils.mergeResults(...results);
  }

  /**
   * Validate required fields are present in data
   */
  static validateRequired(data: any, required: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!data || typeof data !== 'object') {
      // If data is null/undefined, all required fields are missing
      for (const field of required) {
        errors.push(ValidationUtils.createError(
          'REQUIRED_FIELD_MISSING',
          `Required field '${field}' is missing`,
          ValidationSeverity.ERROR,
          { path: field }
        ));
      }
      return errors;
    }

    for (const field of required) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        errors.push(ValidationUtils.createError(
          'REQUIRED_FIELD_MISSING',
          `Required field '${field}' is missing`,
          ValidationSeverity.ERROR,
          { path: field }
        ));
      }
    }

    return errors;
  }

  /**
   * Sanitize error messages to prevent XSS
   */
  static sanitizeErrorMessage(message: any): string {
    if (!message) {
      return '';
    }
    
    const str = String(message);
    // Remove HTML tags and script content
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Get numeric level for error severity
   */
  static getErrorSeverityLevel(severity: ValidationSeverity): number {
    switch (severity) {
      case ValidationSeverity.ERROR:
        return 3;
      case ValidationSeverity.WARNING:
        return 2;
      case ValidationSeverity.INFO:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Sort errors by severity (highest first)
   */
  static sortErrorsBySeverity(errors: ValidationError[]): ValidationError[] {
    return [...errors].sort((a, b) => {
      const levelA = ValidationUtils.getErrorSeverityLevel(a.severity);
      const levelB = ValidationUtils.getErrorSeverityLevel(b.severity);
      return levelB - levelA; // Descending order (highest first)
    });
  }
} 