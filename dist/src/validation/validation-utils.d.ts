import { ValidationError, ValidationResult, ValidationSeverity } from './types';
export declare class ValidationUtils {
    static createError(code: string, message: string, severity?: ValidationSeverity, options?: Partial<ValidationError>): ValidationError;
    static mergeResults(...results: ValidationResult[]): ValidationResult;
    static formatError(error: ValidationError): string;
    static calculateComplexity(schema: Record<string, any>): number;
    static formatPath(path: string[]): string;
    static isValidJsonSchemaType(type: string): boolean;
    static mergeValidationResults(...results: ValidationResult[]): ValidationResult;
    static validateRequired(data: any, required: string[]): ValidationError[];
    static sanitizeErrorMessage(message: any): string;
    static getErrorSeverityLevel(severity: ValidationSeverity): number;
    static sortErrorsBySeverity(errors: ValidationError[]): ValidationError[];
}
//# sourceMappingURL=validation-utils.d.ts.map