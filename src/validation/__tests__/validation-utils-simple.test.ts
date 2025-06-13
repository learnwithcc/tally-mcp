/**
 * Unit tests for ValidationUtils - Simple version
 */

import { ValidationUtils } from '../validation-utils';
import { ValidationSeverity } from '../types';

describe('ValidationUtils', () => {
  describe('createError', () => {
    it('should create a validation error with required fields', () => {
      const error = ValidationUtils.createError(
        'TEST_ERROR',
        'Test error message',
        ValidationSeverity.ERROR
      );

      expect(error).toEqual({
        code: 'TEST_ERROR',
        message: 'Test error message',
        severity: ValidationSeverity.ERROR
      });
    });

    it('should create a validation error with optional fields', () => {
      const error = ValidationUtils.createError(
        'TEST_ERROR',
        'Test error message',
        ValidationSeverity.WARNING,
        {
          path: 'test.path',
          expected: 'expected value',
          actual: 'actual value'
        }
      );

      expect(error).toEqual({
        code: 'TEST_ERROR',
        message: 'Test error message',
        severity: ValidationSeverity.WARNING,
        path: 'test.path',
        expected: 'expected value',
        actual: 'actual value'
      });
    });

    it('should use default severity when not provided', () => {
      const error = ValidationUtils.createError('TEST_ERROR', 'Test message');

      expect(error.severity).toBe(ValidationSeverity.ERROR);
    });
  });

  describe('mergeResults', () => {
    it('should merge multiple validation results', () => {
      const result1 = {
        valid: true,
        errors: [],
        warnings: [ValidationUtils.createError('WARN1', 'Warning 1', ValidationSeverity.WARNING)],
        info: [],
        summary: { errorCount: 0, warningCount: 1, infoCount: 0 }
      };

      const result2 = {
        valid: false,
        errors: [ValidationUtils.createError('ERR1', 'Error 1', ValidationSeverity.ERROR)],
        warnings: [],
        info: [ValidationUtils.createError('INFO1', 'Info 1', ValidationSeverity.INFO)],
        summary: { errorCount: 1, warningCount: 0, infoCount: 1 }
      };

      const merged = ValidationUtils.mergeResults(result1, result2);

      expect(merged.valid).toBe(false); // Should be false if any errors exist
      expect(merged.errors).toHaveLength(1);
      expect(merged.warnings).toHaveLength(1);
      expect(merged.info).toHaveLength(1);
      expect(merged.summary).toEqual({
        errorCount: 1,
        warningCount: 1,
        infoCount: 1
      });
    });

    it('should handle empty results', () => {
      const emptyResult = {
        valid: true,
        errors: [],
        warnings: [],
        info: [],
        summary: { errorCount: 0, warningCount: 0, infoCount: 0 }
      };

      const merged = ValidationUtils.mergeResults(emptyResult);

      expect(merged.valid).toBe(true);
      expect(merged.errors).toHaveLength(0);
      expect(merged.warnings).toHaveLength(0);
      expect(merged.info).toHaveLength(0);
    });

    it('should handle single result', () => {
      const result = {
        valid: false,
        errors: [ValidationUtils.createError('ERR1', 'Error 1')],
        warnings: [],
        info: [],
        summary: { errorCount: 1, warningCount: 0, infoCount: 0 }
      };

      const merged = ValidationUtils.mergeResults(result);

      expect(merged.valid).toBe(false);
      expect(merged.errors).toHaveLength(1);
    });
  });

  describe('formatError', () => {
    it('should format basic error', () => {
      const error = ValidationUtils.createError('TEST_ERROR', 'Test message', ValidationSeverity.ERROR);
      const formatted = ValidationUtils.formatError(error);

      expect(formatted).toContain('[ERROR] TEST_ERROR: Test message');
    });

    it('should format error with path', () => {
      const error = ValidationUtils.createError('TEST_ERROR', 'Test message', ValidationSeverity.WARNING, {
        path: 'test.field'
      });
      const formatted = ValidationUtils.formatError(error);

      expect(formatted).toContain('[WARNING] TEST_ERROR: Test message');
      expect(formatted).toContain('(at test.field)');
    });

    it('should format error with expected/actual values', () => {
      const error = ValidationUtils.createError('TEST_ERROR', 'Test message', ValidationSeverity.ERROR, {
        expected: 'string',
        actual: 'number'
      });
      const formatted = ValidationUtils.formatError(error);

      expect(formatted).toContain('Expected: string');
      expect(formatted).toContain('Actual: number');
    });

    it('should format error with spec reference', () => {
      const error = ValidationUtils.createError('TEST_ERROR', 'Test message', ValidationSeverity.ERROR, {
        specReference: 'JSON Schema Core'
      });
      const formatted = ValidationUtils.formatError(error);

      expect(formatted).toContain('Reference: JSON Schema Core');
    });
  });

  describe('calculateComplexity', () => {
    it('should calculate complexity for simple schema', () => {
      const schema = { type: 'string' };
      const complexity = ValidationUtils.calculateComplexity(schema);

      expect(complexity).toBe(1);
    });

    it('should calculate complexity for object schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' }
        }
      };
      const complexity = ValidationUtils.calculateComplexity(schema);

      expect(complexity).toBeGreaterThan(1);
      expect(complexity).toBe(4); // 1 base + 3 properties
    });

    it('should calculate complexity for nested schema', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              profile: {
                type: 'object',
                properties: {
                  bio: { type: 'string' }
                }
              }
            }
          }
        }
      };
      const complexity = ValidationUtils.calculateComplexity(schema);

      expect(complexity).toBeGreaterThan(1);
    });

    it('should handle null/undefined schema', () => {
      expect(ValidationUtils.calculateComplexity(null as any)).toBe(0);
      expect(ValidationUtils.calculateComplexity(undefined as any)).toBe(0);
      expect(ValidationUtils.calculateComplexity('not an object' as any)).toBe(0);
    });

    it('should handle empty schema', () => {
      const complexity = ValidationUtils.calculateComplexity({});
      expect(complexity).toBe(1); // Base complexity
    });
  });
}); 