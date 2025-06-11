import { z } from 'zod';
export var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity["ERROR"] = "error";
    ValidationSeverity["WARNING"] = "warning";
    ValidationSeverity["INFO"] = "info";
})(ValidationSeverity || (ValidationSeverity = {}));
export const MCPToolSchema = z.object({
    name: z.string().min(1, 'Tool name cannot be empty'),
    description: z.string().min(1, 'Tool description cannot be empty'),
    inputSchema: z.record(z.any()).refine((schema) => typeof schema === 'object' && schema !== null, 'Input schema must be a valid object')
});
export const ValidationErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    severity: z.nativeEnum(ValidationSeverity),
    path: z.string().optional(),
    expected: z.any().optional(),
    actual: z.any().optional(),
    context: z.record(z.any()).optional(),
    specReference: z.string().optional()
});
export const ValidationResultSchema = z.object({
    valid: z.boolean(),
    errors: z.array(ValidationErrorSchema),
    warnings: z.array(ValidationErrorSchema),
    info: z.array(ValidationErrorSchema),
    summary: z.object({
        errorCount: z.number(),
        warningCount: z.number(),
        infoCount: z.number()
    })
});
//# sourceMappingURL=types.js.map