/**
 * Main MCP Tool Validator
 * 
 * Orchestrates the validation of MCP tool schemas against the specification
 */

import {
  MCPTool,
  ValidationResult,
  ValidationError,
  ValidationSeverity,
  ValidationReport,
  ToolValidationContext,
  SchemaValidationOptions,
  ValidationRule
} from './types';
import { VALIDATION_RULES, MCP_SPECIFICATION_VERSION } from './constants';
import { SchemaValidator } from './schema-validator';

/**
 * Configuration for the MCP Tool Validator
 */
export interface MCPToolValidatorConfig extends SchemaValidationOptions {
  /** Whether to include performance metrics in reports */
  includeMetrics?: boolean;
  /** Whether to validate tool names for uniqueness */
  checkUniqueNames?: boolean;
  /** Whether to perform deep validation of nested schemas */
  deepValidation?: boolean;
}

/**
 * Main validator class for MCP tool schemas
 */
export class MCPToolValidator {
  private config: MCPToolValidatorConfig;
  private schemaValidator: SchemaValidator;
  private validationRules: ValidationRule[];

  constructor(config: MCPToolValidatorConfig = {}) {
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

  /**
   * Validate a single MCP tool
   */
  public validateTool(tool: MCPTool, toolIndex?: number): ValidationResult {
    const context: ToolValidationContext = {
      tool,
      toolIndex,
      options: this.config
    };

    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    const allInfo: ValidationError[] = [];

    // Run all validation rules
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
      } catch (validationError) {
        // Handle errors in validation rules themselves
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

    // Additional schema validation
    if (this.config.deepValidation && tool.inputSchema) {
      const schemaResult = this.schemaValidator.validateSchema(tool.inputSchema);
      allErrors.push(...schemaResult.errors);
      allWarnings.push(...schemaResult.warnings);
      allInfo.push(...schemaResult.info);
    }

    const result: ValidationResult = {
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

  /**
   * Validate multiple MCP tools
   */
  public validateTools(tools: MCPTool[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    const allInfo: ValidationError[] = [];

    // Check for unique tool names
    if (this.config.checkUniqueNames) {
      const nameErrors = this.validateUniqueNames(tools);
      allErrors.push(...nameErrors);
    }

    // Validate each tool individually
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      if (!tool) continue;
      
      const result = this.validateTool(tool, i);
      
      // Add tool index to error paths for context
      const contextualizeError = (error: ValidationError): ValidationError => ({
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

  /**
   * Generate a comprehensive validation report
   */
  public generateReport(tools: MCPTool[]): ValidationReport {
    const startTime = Date.now();
    
    // Overall validation
    const overallResult = this.validateTools(tools);
    
    // Individual tool results
    const toolResults = tools.map((tool, index) => ({
      toolName: tool.name || `Tool ${index}`,
      toolIndex: index,
      result: this.validateTool(tool, index)
    }));

    const endTime = Date.now();
    const validationDurationMs = endTime - startTime;

    const report: ValidationReport = {
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

  /**
   * Validate that tool names are unique
   */
  private validateUniqueNames(tools: MCPTool[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const nameMap = new Map<string, number[]>();

    // Build map of names to indices
    tools.forEach((tool, index) => {
      if (tool.name) {
        if (!nameMap.has(tool.name)) {
          nameMap.set(tool.name, []);
        }
        nameMap.get(tool.name)!.push(index);
      }
    });

    // Find duplicates
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

  /**
   * Add a custom validation rule
   */
  public addValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
  }

  /**
   * Remove a validation rule by ID
   */
  public removeValidationRule(ruleId: string): boolean {
    const initialLength = this.validationRules.length;
    this.validationRules = this.validationRules.filter(rule => rule.id !== ruleId);
    return this.validationRules.length < initialLength;
  }

  /**
   * Get all active validation rules
   */
  public getValidationRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Update validator configuration
   */
  public updateConfig(newConfig: Partial<MCPToolValidatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.schemaValidator = new SchemaValidator(this.config);
  }

  /**
   * Get current validator configuration
   */
  public getConfig(): MCPToolValidatorConfig {
    return { ...this.config };
  }
} 