import { MCPTool, ValidationResult, ValidationReport, SchemaValidationOptions, ValidationRule } from './types';
export interface MCPToolValidatorConfig extends SchemaValidationOptions {
    includeMetrics?: boolean;
    checkUniqueNames?: boolean;
    deepValidation?: boolean;
}
export declare class MCPToolValidator {
    private config;
    private schemaValidator;
    private validationRules;
    constructor(config?: MCPToolValidatorConfig);
    validateTool(tool: MCPTool, toolIndex?: number): ValidationResult;
    validateTools(tools: MCPTool[]): ValidationResult;
    generateReport(tools: MCPTool[]): ValidationReport;
    private validateUniqueNames;
    addValidationRule(rule: ValidationRule): void;
    removeValidationRule(ruleId: string): boolean;
    getValidationRules(): ValidationRule[];
    updateConfig(newConfig: Partial<MCPToolValidatorConfig>): void;
    getConfig(): MCPToolValidatorConfig;
}
//# sourceMappingURL=mcp-tool-validator.d.ts.map