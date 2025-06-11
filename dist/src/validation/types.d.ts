import { z } from 'zod';
export declare enum ValidationSeverity {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
export interface ValidationError {
    code: string;
    message: string;
    severity: ValidationSeverity;
    path?: string;
    expected?: any;
    actual?: any;
    context?: Record<string, any>;
    specReference?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    info: ValidationError[];
    summary: {
        errorCount: number;
        warningCount: number;
        infoCount: number;
    };
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}
export interface ToolValidationContext {
    tool: MCPTool;
    toolIndex?: number | undefined;
    options?: SchemaValidationOptions;
}
export interface SchemaValidationOptions {
    strict?: boolean;
    mcpVersion?: string;
    checkDeprecated?: boolean;
    customRules?: ValidationRule[];
    validateJsonSchemaDraft?: boolean;
    maxSchemaDepth?: number;
}
export interface ValidationRule {
    id: string;
    description: string;
    severity: ValidationSeverity;
    validate: (tool: MCPTool, context?: ToolValidationContext) => ValidationError[];
}
export interface ValidationReport {
    timestamp: string;
    validatorVersion: string;
    mcpVersion: string;
    toolCount: number;
    overall: ValidationResult;
    toolResults: Array<{
        toolName: string;
        toolIndex: number;
        result: ValidationResult;
    }>;
    metrics: {
        validationDurationMs: number;
        rulesExecuted: number;
        averageTimePerTool: number;
    };
    config: SchemaValidationOptions;
}
export declare const MCPToolSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodAny>, Record<string, any>, Record<string, any>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    inputSchema: Record<string, any>;
}, {
    description: string;
    name: string;
    inputSchema: Record<string, any>;
}>;
export declare const ValidationErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    severity: z.ZodNativeEnum<typeof ValidationSeverity>;
    path: z.ZodOptional<z.ZodString>;
    expected: z.ZodOptional<z.ZodAny>;
    actual: z.ZodOptional<z.ZodAny>;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    specReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    code: string;
    severity: ValidationSeverity;
    path?: string | undefined;
    expected?: any;
    context?: Record<string, any> | undefined;
    actual?: any;
    specReference?: string | undefined;
}, {
    message: string;
    code: string;
    severity: ValidationSeverity;
    path?: string | undefined;
    expected?: any;
    context?: Record<string, any> | undefined;
    actual?: any;
    specReference?: string | undefined;
}>;
export declare const ValidationResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodNativeEnum<typeof ValidationSeverity>;
        path: z.ZodOptional<z.ZodString>;
        expected: z.ZodOptional<z.ZodAny>;
        actual: z.ZodOptional<z.ZodAny>;
        context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        specReference: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }>, "many">;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodNativeEnum<typeof ValidationSeverity>;
        path: z.ZodOptional<z.ZodString>;
        expected: z.ZodOptional<z.ZodAny>;
        actual: z.ZodOptional<z.ZodAny>;
        context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        specReference: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }>, "many">;
    info: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodNativeEnum<typeof ValidationSeverity>;
        path: z.ZodOptional<z.ZodString>;
        expected: z.ZodOptional<z.ZodAny>;
        actual: z.ZodOptional<z.ZodAny>;
        context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        specReference: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }, {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        errorCount: z.ZodNumber;
        warningCount: z.ZodNumber;
        infoCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        errorCount: number;
        warningCount: number;
        infoCount: number;
    }, {
        errorCount: number;
        warningCount: number;
        infoCount: number;
    }>;
}, "strip", z.ZodTypeAny, {
    info: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
    valid: boolean;
    errors: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
    summary: {
        errorCount: number;
        warningCount: number;
        infoCount: number;
    };
    warnings: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
}, {
    info: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
    valid: boolean;
    errors: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
    summary: {
        errorCount: number;
        warningCount: number;
        infoCount: number;
    };
    warnings: {
        message: string;
        code: string;
        severity: ValidationSeverity;
        path?: string | undefined;
        expected?: any;
        context?: Record<string, any> | undefined;
        actual?: any;
        specReference?: string | undefined;
    }[];
}>;
//# sourceMappingURL=types.d.ts.map