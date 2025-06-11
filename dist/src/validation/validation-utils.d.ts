import { ValidationError, ValidationResult, ValidationSeverity } from './types';
export declare class ValidationUtils {
    static createError(code: string, message: string, severity?: ValidationSeverity, options?: Partial<ValidationError>): ValidationError;
    static mergeResults(...results: ValidationResult[]): ValidationResult;
    static formatError(error: ValidationError): string;
    static calculateComplexity(schema: Record<string, any>): number;
}
//# sourceMappingURL=validation-utils.d.ts.map