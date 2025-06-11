/**
 * Type definitions for the MCP Tool Schema Validation Framework
 */

import { z } from 'zod';

/**
 * Severity levels for validation issues
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Validation error structure
 */
export interface ValidationError {
  /** Unique identifier for the error type */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Severity level of the validation issue */
  severity: ValidationSeverity;
  /** JSON path to the problematic field */
  path?: string;
  /** Expected value or format */
  expected?: any;
  /** Actual value found */
  actual?: any;
  /** Additional context about the error */
  context?: Record<string, any>;
  /** Reference to MCP specification section */
  specReference?: string;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed without errors */
  valid: boolean;
  /** List of validation errors found */
  errors: ValidationError[];
  /** List of warnings (non-blocking issues) */
  warnings: ValidationError[];
  /** Informational messages */
  info: ValidationError[];
  /** Total count of issues by severity */
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

/**
 * MCP Tool definition structure
 */
export interface MCPTool {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** JSON Schema for tool input parameters */
  inputSchema: Record<string, any>;
}

/**
 * Context information for tool validation
 */
export interface ToolValidationContext {
  /** The tool being validated */
  tool: MCPTool;
  /** Index of the tool in the tools array */
  toolIndex?: number | undefined;
  /** Additional validation options */
  options?: SchemaValidationOptions;
}

/**
 * Configuration options for schema validation
 */
export interface SchemaValidationOptions {
  /** Whether to perform strict validation */
  strict?: boolean;
  /** Whether to validate against specific MCP version */
  mcpVersion?: string;
  /** Whether to check for deprecated features */
  checkDeprecated?: boolean;
  /** Custom validation rules to apply */
  customRules?: ValidationRule[];
  /** Whether to validate JSON Schema draft version */
  validateJsonSchemaDraft?: boolean;
  /** Maximum allowed schema depth */
  maxSchemaDepth?: number;
}

/**
 * Custom validation rule interface
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule description */
  description: string;
  /** Rule severity */
  severity: ValidationSeverity;
  /** Validation function */
  validate: (tool: MCPTool, context?: ToolValidationContext) => ValidationError[];
}

/**
 * Comprehensive validation report
 */
export interface ValidationReport {
  /** Timestamp of the validation */
  timestamp: string;
  /** Version of the validation framework */
  validatorVersion: string;
  /** MCP specification version used for validation */
  mcpVersion: string;
  /** Total number of tools validated */
  toolCount: number;
  /** Overall validation result */
  overall: ValidationResult;
  /** Individual tool validation results */
  toolResults: Array<{
    toolName: string;
    toolIndex: number;
    result: ValidationResult;
  }>;
  /** Performance metrics */
  metrics: {
    validationDurationMs: number;
    rulesExecuted: number;
    averageTimePerTool: number;
  };
  /** Configuration used for validation */
  config: SchemaValidationOptions;
}

/**
 * Zod schemas for runtime validation
 */
export const MCPToolSchema = z.object({
  name: z.string().min(1, 'Tool name cannot be empty'),
  description: z.string().min(1, 'Tool description cannot be empty'),
  inputSchema: z.record(z.any()).refine(
    (schema) => typeof schema === 'object' && schema !== null,
    'Input schema must be a valid object'
  )
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