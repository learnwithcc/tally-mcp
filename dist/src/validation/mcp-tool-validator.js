import { ValidationSeverity } from './types';
import { VALIDATION_RULES, MCP_SPECIFICATION_VERSION } from './constants';
import { SchemaValidator } from './schema-validator';
export class MCPToolValidator {
    constructor(config = {}) {
        this.config = {
            strict: true,
            mcpVersion: MCP_SPECIFICATION_VERSION,
            checkDeprecated: true,
            validateJsonSchemaDraft: true,
            maxSchemaDepth: 10,
            includeMetrics: true,
            checkUniqueNames: true,
            deepValidation: true,
            ...config
        };
        this.schemaValidator = new SchemaValidator(this.config);
        this.validationRules = [
            ...VALIDATION_RULES,
            ...(this.config.customRules || [])
        ];
    }
    validateTool(tool, toolIndex) {
        const context = {
            tool,
            toolIndex,
            options: this.config
        };
        const allErrors = [];
        const allWarnings = [];
        const allInfo = [];
        for (const rule of this.validationRules) {
            try {
                const ruleErrors = rule.validate(tool, context);
                for (const error of ruleErrors) {
                    switch (error.severity) {
                        case ValidationSeverity.ERROR:
                            allErrors.push(error);
                            break;
                        case ValidationSeverity.WARNING:
                            allWarnings.push(error);
                            break;
                        case ValidationSeverity.INFO:
                            allInfo.push(error);
                            break;
                    }
                }
            }
            catch (validationError) {
                allErrors.push({
                    code: 'VALIDATION_RULE_ERROR',
                    message: `Error executing validation rule '${rule.id}': ${validationError instanceof Error ? validationError.message : 'Unknown error'}`,
                    severity: ValidationSeverity.ERROR,
                    context: {
                        ruleId: rule.id,
                        error: validationError instanceof Error ? validationError.message : validationError
                    }
                });
            }
        }
        if (this.config.deepValidation && tool.inputSchema) {
            const schemaResult = this.schemaValidator.validateSchema(tool.inputSchema);
            allErrors.push(...schemaResult.errors);
            allWarnings.push(...schemaResult.warnings);
            allInfo.push(...schemaResult.info);
        }
        const result = {
            valid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            info: allInfo,
            summary: {
                errorCount: allErrors.length,
                warningCount: allWarnings.length,
                infoCount: allInfo.length
            }
        };
        return result;
    }
    validateTools(tools) {
        const allErrors = [];
        const allWarnings = [];
        const allInfo = [];
        if (this.config.checkUniqueNames) {
            const nameErrors = this.validateUniqueNames(tools);
            allErrors.push(...nameErrors);
        }
        for (let i = 0; i < tools.length; i++) {
            const tool = tools[i];
            if (!tool)
                continue;
            const result = this.validateTool(tool, i);
            const contextualizeError = (error) => ({
                ...error,
                path: error.path ? `tools[${i}].${error.path}` : `tools[${i}]`,
                context: {
                    ...error.context,
                    toolIndex: i,
                    toolName: tool.name
                }
            });
            allErrors.push(...result.errors.map(contextualizeError));
            allWarnings.push(...result.warnings.map(contextualizeError));
            allInfo.push(...result.info.map(contextualizeError));
        }
        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            info: allInfo,
            summary: {
                errorCount: allErrors.length,
                warningCount: allWarnings.length,
                infoCount: allInfo.length
            }
        };
    }
    generateReport(tools) {
        const startTime = Date.now();
        const overallResult = this.validateTools(tools);
        const toolResults = tools.map((tool, index) => ({
            toolName: tool.name || `Tool ${index}`,
            toolIndex: index,
            result: this.validateTool(tool, index)
        }));
        const endTime = Date.now();
        const validationDurationMs = endTime - startTime;
        const report = {
            timestamp: new Date().toISOString(),
            validatorVersion: '1.0.0',
            mcpVersion: this.config.mcpVersion || MCP_SPECIFICATION_VERSION,
            toolCount: tools.length,
            overall: overallResult,
            toolResults,
            metrics: {
                validationDurationMs,
                rulesExecuted: this.validationRules.length,
                averageTimePerTool: tools.length > 0 ? validationDurationMs / tools.length : 0
            },
            config: this.config
        };
        return report;
    }
    validateUniqueNames(tools) {
        const errors = [];
        const nameMap = new Map();
        tools.forEach((tool, index) => {
            if (tool.name) {
                if (!nameMap.has(tool.name)) {
                    nameMap.set(tool.name, []);
                }
                nameMap.get(tool.name).push(index);
            }
        });
        for (const [name, indices] of nameMap.entries()) {
            if (indices.length > 1) {
                indices.forEach(index => {
                    errors.push({
                        code: 'TOOL_NAME_DUPLICATE',
                        message: `Tool name '${name}' is used by multiple tools`,
                        severity: ValidationSeverity.ERROR,
                        path: `tools[${index}].name`,
                        expected: 'unique tool name',
                        actual: name,
                        context: {
                            duplicateIndices: indices,
                            toolName: name
                        },
                        specReference: 'MCP Specification - Tool Uniqueness'
                    });
                });
            }
        }
        return errors;
    }
    addValidationRule(rule) {
        this.validationRules.push(rule);
    }
    removeValidationRule(ruleId) {
        const initialLength = this.validationRules.length;
        this.validationRules = this.validationRules.filter(rule => rule.id !== ruleId);
        return this.validationRules.length < initialLength;
    }
    getValidationRules() {
        return [...this.validationRules];
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.schemaValidator = new SchemaValidator(this.config);
    }
    getConfig() {
        return { ...this.config };
    }
}
//# sourceMappingURL=mcp-tool-validator.js.map