/**
 * Constants for MCP Tool Schema Validation
 */

import { ValidationRule, ValidationSeverity, ValidationError } from './types';

/**
 * MCP Protocol version being validated against
 */
export const MCP_SPECIFICATION_VERSION = '2024-11-05';

/**
 * Supported JSON Schema draft version
 */
export const SUPPORTED_JSON_SCHEMA_VERSION = 'http://json-schema.org/draft-07/schema#';

/**
 * Maximum allowed schema nesting depth
 */
export const MAX_SCHEMA_DEPTH = 10;

/**
 * Reserved tool names that cannot be used
 */
export const RESERVED_TOOL_NAMES = [
  'initialize',
  'ping',
  'list',
  'call',
  'cancel',
  'notifications/initialized',
  'notifications/cancelled',
  'notifications/progress'
];

/**
 * Required JSON Schema properties for MCP tools
 */
export const REQUIRED_SCHEMA_PROPERTIES = [
  'type',
  'properties'
];

/**
 * Valid JSON Schema types
 */
export const VALID_JSON_SCHEMA_TYPES = [
  'null',
  'boolean',
  'object',
  'array',
  'number',
  'string',
  'integer'
];

/**
 * MCP-specific validation rules
 */
export const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'tool-name-required',
    description: 'Tool name is required and must be non-empty',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      if (!tool.name || typeof tool.name !== 'string' || tool.name.trim().length === 0) {
        errors.push({
          code: 'TOOL_NAME_REQUIRED',
          message: 'Tool name is required and must be a non-empty string',
          severity: ValidationSeverity.ERROR,
          path: 'name',
          expected: 'non-empty string',
          actual: tool.name,
          specReference: 'MCP Specification - Tool Definition'
        });
      }
      return errors;
    }
  },
  {
    id: 'tool-name-format',
    description: 'Tool name must follow valid naming conventions',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      if (tool.name) {
        // Check for valid characters (alphanumeric, underscore, hyphen)
        if (!/^[a-zA-Z0-9_-]+$/.test(tool.name)) {
          errors.push({
            code: 'TOOL_NAME_INVALID_FORMAT',
            message: 'Tool name must contain only alphanumeric characters, underscores, and hyphens',
            severity: ValidationSeverity.ERROR,
            path: 'name',
            expected: 'alphanumeric characters, _, or -',
            actual: tool.name,
            specReference: 'MCP Specification - Tool Naming'
          });
        }
        
        // Check for reserved names
        if (RESERVED_TOOL_NAMES.includes(tool.name)) {
          errors.push({
            code: 'TOOL_NAME_RESERVED',
            message: `Tool name '${tool.name}' is reserved and cannot be used`,
            severity: ValidationSeverity.ERROR,
            path: 'name',
            expected: 'non-reserved name',
            actual: tool.name,
            context: { reservedNames: RESERVED_TOOL_NAMES },
            specReference: 'MCP Specification - Tool Naming'
          });
        }
      }
      return errors;
    }
  },
  {
    id: 'tool-description-required',
    description: 'Tool description is required and must be meaningful',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      if (!tool.description || typeof tool.description !== 'string' || tool.description.trim().length === 0) {
        errors.push({
          code: 'TOOL_DESCRIPTION_REQUIRED',
          message: 'Tool description is required and must be a non-empty string',
          severity: ValidationSeverity.ERROR,
          path: 'description',
          expected: 'non-empty string',
          actual: tool.description,
          specReference: 'MCP Specification - Tool Definition'
        });
      } else if (tool.description.trim().length < 10) {
        errors.push({
          code: 'TOOL_DESCRIPTION_TOO_SHORT',
          message: 'Tool description should be at least 10 characters long for clarity',
          severity: ValidationSeverity.WARNING,
          path: 'description',
          expected: 'string with at least 10 characters',
          actual: tool.description,
          specReference: 'Best Practices - Tool Documentation'
        });
      }
      return errors;
    }
  },
  {
    id: 'input-schema-required',
    description: 'Input schema is required and must be a valid object',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      if (!tool.inputSchema) {
        errors.push({
          code: 'INPUT_SCHEMA_REQUIRED',
          message: 'Input schema is required',
          severity: ValidationSeverity.ERROR,
          path: 'inputSchema',
          expected: 'object',
          actual: tool.inputSchema,
          specReference: 'MCP Specification - Tool Schema'
        });
      } else if (typeof tool.inputSchema !== 'object' || tool.inputSchema === null || Array.isArray(tool.inputSchema)) {
        errors.push({
          code: 'INPUT_SCHEMA_INVALID_TYPE',
          message: 'Input schema must be a valid object',
          severity: ValidationSeverity.ERROR,
          path: 'inputSchema',
          expected: 'object',
          actual: typeof tool.inputSchema,
          specReference: 'MCP Specification - Tool Schema'
        });
      }
      return errors;
    }
  },
  {
    id: 'json-schema-structure',
    description: 'Input schema must follow JSON Schema structure',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      if (tool.inputSchema && typeof tool.inputSchema === 'object') {
        // Check for required JSON Schema properties
        if (!tool.inputSchema.type) {
          errors.push({
            code: 'JSON_SCHEMA_TYPE_MISSING',
            message: 'Input schema must specify a type property',
            severity: ValidationSeverity.ERROR,
            path: 'inputSchema.type',
            expected: 'string indicating schema type',
            actual: tool.inputSchema.type,
            specReference: 'JSON Schema Specification'
          });
        } else if (!VALID_JSON_SCHEMA_TYPES.includes(tool.inputSchema.type)) {
          errors.push({
            code: 'JSON_SCHEMA_TYPE_INVALID',
            message: `Invalid JSON Schema type: ${tool.inputSchema.type}`,
            severity: ValidationSeverity.ERROR,
            path: 'inputSchema.type',
            expected: VALID_JSON_SCHEMA_TYPES.join(', '),
            actual: tool.inputSchema.type,
            specReference: 'JSON Schema Specification'
          });
        }
        
        // For object types, properties should be defined
        if (tool.inputSchema.type === 'object' && !tool.inputSchema.properties) {
          errors.push({
            code: 'JSON_SCHEMA_PROPERTIES_MISSING',
            message: 'Object type schemas should define properties',
            severity: ValidationSeverity.WARNING,
            path: 'inputSchema.properties',
            expected: 'object defining schema properties',
            actual: tool.inputSchema.properties,
            specReference: 'JSON Schema Specification'
          });
        }
      }
      return errors;
    }
  },
  {
    id: 'schema-depth-check',
    description: 'Schema nesting should not exceed maximum depth',
    severity: ValidationSeverity.WARNING,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      
      function checkDepth(obj: any, currentDepth = 0, path = 'inputSchema'): number {
        if (currentDepth > MAX_SCHEMA_DEPTH) {
          errors.push({
            code: 'SCHEMA_DEPTH_EXCEEDED',
            message: `Schema nesting depth exceeds maximum of ${MAX_SCHEMA_DEPTH}`,
            severity: ValidationSeverity.WARNING,
            path,
            expected: `depth <= ${MAX_SCHEMA_DEPTH}`,
            actual: `depth > ${MAX_SCHEMA_DEPTH}`,
            specReference: 'Best Practices - Schema Complexity'
          });
          return currentDepth;
        }
        
        if (typeof obj !== 'object' || obj === null) {
          return currentDepth;
        }
        
        let maxDepth = currentDepth;
        for (const [key, value] of Object.entries(obj)) {
          const newPath = `${path}.${key}`;
          const depth = checkDepth(value, currentDepth + 1, newPath);
          maxDepth = Math.max(maxDepth, depth);
        }
        
        return maxDepth;
      }
      
      if (tool.inputSchema) {
        checkDepth(tool.inputSchema);
      }
      
      return errors;
    }
  },
  {
    id: 'required-fields-format',
    description: 'Required fields must be properly formatted',
    severity: ValidationSeverity.ERROR,
    validate: (tool) => {
      const errors: ValidationError[] = [];
      
      if (tool.inputSchema && tool.inputSchema.required) {
        if (!Array.isArray(tool.inputSchema.required)) {
          errors.push({
            code: 'REQUIRED_FIELDS_INVALID_FORMAT',
            message: 'Required fields must be an array of strings',
            severity: ValidationSeverity.ERROR,
            path: 'inputSchema.required',
            expected: 'array of strings',
            actual: typeof tool.inputSchema.required,
            specReference: 'JSON Schema Specification'
          });
        } else {
          // Check each required field is a string and exists in properties
          tool.inputSchema.required.forEach((field: any, index: number) => {
            if (typeof field !== 'string') {
              errors.push({
                code: 'REQUIRED_FIELD_INVALID_TYPE',
                message: `Required field at index ${index} must be a string`,
                severity: ValidationSeverity.ERROR,
                path: `inputSchema.required[${index}]`,
                expected: 'string',
                actual: typeof field,
                specReference: 'JSON Schema Specification'
              });
            } else if (tool.inputSchema.properties && !tool.inputSchema.properties[field]) {
              errors.push({
                code: 'REQUIRED_FIELD_NOT_DEFINED',
                message: `Required field '${field}' is not defined in properties`,
                severity: ValidationSeverity.ERROR,
                path: `inputSchema.required[${index}]`,
                expected: 'field defined in properties',
                actual: field,
                context: { availableProperties: Object.keys(tool.inputSchema.properties) },
                specReference: 'JSON Schema Specification'
              });
            }
          });
        }
      }
      
      return errors;
    }
  }
]; 