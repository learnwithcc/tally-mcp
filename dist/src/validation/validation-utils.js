import { ValidationSeverity } from './types';
export class ValidationUtils {
    static createError(code, message, severity = ValidationSeverity.ERROR, options = {}) {
        return {
            code,
            message,
            severity,
            ...options
        };
    }
    static mergeResults(...results) {
        const errors = [];
        const warnings = [];
        const info = [];
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
    static formatError(error) {
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
    static calculateComplexity(schema) {
        if (!schema || typeof schema !== 'object') {
            return 0;
        }
        let complexity = 1;
        if (schema.properties && typeof schema.properties === 'object') {
            complexity += Object.keys(schema.properties).length;
            for (const value of Object.values(schema.properties)) {
                if (value && typeof value === 'object') {
                    complexity += ValidationUtils.calculateComplexity(value) * 0.5;
                }
            }
        }
        return Math.round(complexity * 10) / 10;
    }
    static formatPath(path) {
        if (!path || path.length === 0) {
            return '';
        }
        let formatted = path[0] || '';
        for (let i = 1; i < path.length; i++) {
            const segment = path[i] || '';
            if (/^\d+$/.test(segment)) {
                formatted += `[${segment}]`;
            }
            else {
                formatted += `.${segment}`;
            }
        }
        return formatted;
    }
    static isValidJsonSchemaType(type) {
        if (!type || typeof type !== 'string') {
            return false;
        }
        const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];
        return validTypes.includes(type);
    }
    static mergeValidationResults(...results) {
        return ValidationUtils.mergeResults(...results);
    }
    static validateRequired(data, required) {
        const errors = [];
        if (!data || typeof data !== 'object') {
            for (const field of required) {
                errors.push(ValidationUtils.createError('REQUIRED_FIELD_MISSING', `Required field '${field}' is missing`, ValidationSeverity.ERROR, { path: field }));
            }
            return errors;
        }
        for (const field of required) {
            if (!(field in data) || data[field] === undefined || data[field] === null) {
                errors.push(ValidationUtils.createError('REQUIRED_FIELD_MISSING', `Required field '${field}' is missing`, ValidationSeverity.ERROR, { path: field }));
            }
        }
        return errors;
    }
    static sanitizeErrorMessage(message) {
        if (!message) {
            return '';
        }
        const str = String(message);
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
    static getErrorSeverityLevel(severity) {
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
    static sortErrorsBySeverity(errors) {
        return [...errors].sort((a, b) => {
            const levelA = ValidationUtils.getErrorSeverityLevel(a.severity);
            const levelB = ValidationUtils.getErrorSeverityLevel(b.severity);
            return levelB - levelA;
        });
    }
}
//# sourceMappingURL=validation-utils.js.map