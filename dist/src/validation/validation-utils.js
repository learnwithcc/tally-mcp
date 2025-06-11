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
}
//# sourceMappingURL=validation-utils.js.map