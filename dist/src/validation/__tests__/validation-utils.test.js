import { ValidationUtils } from '../validation-utils';
import { ValidationSeverity } from '../types';
describe('ValidationUtils', () => {
    describe('createError', () => {
        it('should create a validation error with required fields', () => {
            const error = ValidationUtils.createError('TEST_ERROR', 'Test error message', ValidationSeverity.ERROR);
            expect(error).toEqual({
                code: 'TEST_ERROR',
                message: 'Test error message',
                severity: ValidationSeverity.ERROR
            });
        });
        it('should create a validation error with optional fields', () => {
            const error = ValidationUtils.createError('TEST_ERROR', 'Test error message', ValidationSeverity.WARNING, {
                path: 'test.path',
                expected: 'expected value',
                actual: 'actual value',
                context: { context: 'test' },
                specReference: 'spec reference'
            });
            expect(error).toEqual({
                code: 'TEST_ERROR',
                message: 'Test error message',
                severity: ValidationSeverity.WARNING,
                path: 'test.path',
                expected: 'expected value',
                actual: 'actual value',
                context: { context: 'test' },
                specReference: 'spec reference'
            });
        });
    });
    describe('formatPath', () => {
        it('should format simple path', () => {
            const formatted = ValidationUtils.formatPath(['root', 'child']);
            expect(formatted).toBe('root.child');
        });
        it('should format array index path', () => {
            const formatted = ValidationUtils.formatPath(['root', '0', 'child']);
            expect(formatted).toBe('root[0].child');
        });
        it('should handle empty path', () => {
            const formatted = ValidationUtils.formatPath([]);
            expect(formatted).toBe('');
        });
        it('should handle single element path', () => {
            const formatted = ValidationUtils.formatPath(['root']);
            expect(formatted).toBe('root');
        });
    });
    describe('isValidJsonSchemaType', () => {
        it('should return true for valid types', () => {
            const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];
            validTypes.forEach(type => {
                expect(ValidationUtils.isValidJsonSchemaType(type)).toBe(true);
            });
        });
        it('should return false for invalid types', () => {
            const invalidTypes = ['text', 'int', 'float', 'list', 'dict', ''];
            invalidTypes.forEach(type => {
                expect(ValidationUtils.isValidJsonSchemaType(type)).toBe(false);
            });
        });
        it('should handle null and undefined', () => {
            expect(ValidationUtils.isValidJsonSchemaType(null)).toBe(false);
            expect(ValidationUtils.isValidJsonSchemaType(undefined)).toBe(false);
        });
    });
    describe('mergeValidationResults', () => {
        it('should merge two validation results', () => {
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
            const merged = ValidationUtils.mergeValidationResults(result1, result2);
            expect(merged.valid).toBe(false);
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
            const merged = ValidationUtils.mergeValidationResults(emptyResult, emptyResult);
            expect(merged.valid).toBe(true);
            expect(merged.errors).toHaveLength(0);
            expect(merged.warnings).toHaveLength(0);
            expect(merged.info).toHaveLength(0);
            expect(merged.summary).toEqual({
                errorCount: 0,
                warningCount: 0,
                infoCount: 0
            });
        });
    });
    describe('validateRequired', () => {
        it('should validate required fields are present', () => {
            const data = { name: 'test', age: 25 };
            const required = ['name', 'age'];
            const errors = ValidationUtils.validateRequired(data, required);
            expect(errors).toHaveLength(0);
        });
        it('should return errors for missing required fields', () => {
            const data = { name: 'test' };
            const required = ['name', 'age', 'email'];
            const errors = ValidationUtils.validateRequired(data, required);
            expect(errors).toHaveLength(2);
            expect(errors[0].code).toBe('REQUIRED_FIELD_MISSING');
            expect(errors[0].path).toBe('age');
            expect(errors[1].code).toBe('REQUIRED_FIELD_MISSING');
            expect(errors[1].path).toBe('email');
        });
        it('should handle empty required array', () => {
            const data = { name: 'test' };
            const required = [];
            const errors = ValidationUtils.validateRequired(data, required);
            expect(errors).toHaveLength(0);
        });
        it('should handle null/undefined data', () => {
            const required = ['name'];
            const errorsNull = ValidationUtils.validateRequired(null, required);
            const errorsUndefined = ValidationUtils.validateRequired(undefined, required);
            expect(errorsNull).toHaveLength(1);
            expect(errorsUndefined).toHaveLength(1);
        });
    });
    describe('sanitizeErrorMessage', () => {
        it('should sanitize error messages', () => {
            const message = 'Error with <script>alert("xss")</script> content';
            const sanitized = ValidationUtils.sanitizeErrorMessage(message);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).not.toContain('alert');
        });
        it('should preserve safe content', () => {
            const message = 'Simple error message with numbers 123 and symbols !@#';
            const sanitized = ValidationUtils.sanitizeErrorMessage(message);
            expect(sanitized).toBe(message);
        });
        it('should handle empty and null messages', () => {
            expect(ValidationUtils.sanitizeErrorMessage('')).toBe('');
            expect(ValidationUtils.sanitizeErrorMessage(null)).toBe('');
            expect(ValidationUtils.sanitizeErrorMessage(undefined)).toBe('');
        });
    });
    describe('getErrorSeverityLevel', () => {
        it('should return correct numeric levels for severities', () => {
            expect(ValidationUtils.getErrorSeverityLevel(ValidationSeverity.ERROR)).toBe(3);
            expect(ValidationUtils.getErrorSeverityLevel(ValidationSeverity.WARNING)).toBe(2);
            expect(ValidationUtils.getErrorSeverityLevel(ValidationSeverity.INFO)).toBe(1);
        });
        it('should handle invalid severity', () => {
            expect(ValidationUtils.getErrorSeverityLevel('invalid')).toBe(0);
        });
    });
    describe('sortErrorsBySeverity', () => {
        it('should sort errors by severity (highest first)', () => {
            const errors = [
                ValidationUtils.createError('INFO1', 'Info', ValidationSeverity.INFO),
                ValidationUtils.createError('ERR1', 'Error', ValidationSeverity.ERROR),
                ValidationUtils.createError('WARN1', 'Warning', ValidationSeverity.WARNING),
                ValidationUtils.createError('ERR2', 'Error 2', ValidationSeverity.ERROR)
            ];
            const sorted = ValidationUtils.sortErrorsBySeverity(errors);
            expect(sorted[0].severity).toBe(ValidationSeverity.ERROR);
            expect(sorted[1].severity).toBe(ValidationSeverity.ERROR);
            expect(sorted[2].severity).toBe(ValidationSeverity.WARNING);
            expect(sorted[3].severity).toBe(ValidationSeverity.INFO);
        });
        it('should handle empty array', () => {
            const sorted = ValidationUtils.sortErrorsBySeverity([]);
            expect(sorted).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=validation-utils.test.js.map