/**
 * JSON Schema Validator for MCP Tools
 * 
 * Validates tool input schemas against JSON Schema specification
 */

import {
  ValidationResult,
  ValidationError,
  ValidationSeverity,
  SchemaValidationOptions
} from './types';
import {
  SUPPORTED_JSON_SCHEMA_VERSION,
  VALID_JSON_SCHEMA_TYPES,
  MAX_SCHEMA_DEPTH
} from './constants';

/**
 * JSON Schema validation utilities
 */
export class SchemaValidator {
  private config: SchemaValidationOptions;

  constructor(config: SchemaValidationOptions = {}) {
    this.config = {
      strict: true,
      validateJsonSchemaDraft: true,
      maxSchemaDepth: MAX_SCHEMA_DEPTH,
      ...config
    };
  }

  /**
   * Validate a JSON Schema object
   */
  public validateSchema(schema: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Handle null or undefined schema
    if (!schema || typeof schema !== 'object') {
      errors.push({
        code: 'SCHEMA_INVALID',
        message: 'Schema must be a valid object',
        severity: ValidationSeverity.ERROR,
        path: '',
        expected: 'object',
        actual: schema === null ? 'null' : typeof schema,
        specReference: 'JSON Schema Core Specification'
      });
      return {
        valid: false,
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

    // Basic structure validation
    this.validateBasicStructure(schema, errors, warnings);
    
    // JSON Schema draft validation
    if (this.config.validateJsonSchemaDraft) {
      this.validateJsonSchemaDraft(schema, errors, warnings);
    }
    
    // Schema depth validation
    if (this.config.maxSchemaDepth) {
      this.validateSchemaDepth(schema, this.config.maxSchemaDepth, errors, warnings);
    }
    
    // Type-specific validation
    this.validateTypeSpecificRules(schema, errors, warnings, info);

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

  /**
   * Validate basic JSON Schema structure
   */
  private validateBasicStructure(
    schema: Record<string, any>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Check if type is specified
    if (!schema.type && this.config.strict) {
      errors.push({
        code: 'SCHEMA_TYPE_MISSING',
        message: 'Schema must specify a type property',
        severity: ValidationSeverity.ERROR,
        path: 'type',
        expected: 'one of: ' + VALID_JSON_SCHEMA_TYPES.join(', '),
        actual: undefined,
        specReference: 'JSON Schema Core Specification'
      });
    }

    // Validate type value
    if (schema.type && !VALID_JSON_SCHEMA_TYPES.includes(schema.type)) {
      errors.push({
        code: 'SCHEMA_TYPE_INVALID',
        message: `Invalid schema type: ${schema.type}`,
        severity: ValidationSeverity.ERROR,
        path: 'type',
        expected: VALID_JSON_SCHEMA_TYPES.join(', '),
        actual: schema.type,
        specReference: 'JSON Schema Core Specification'
      });
    }

    // Check for required properties in object schemas
    if (schema.type === 'object') {
      if (!schema.properties && this.config.strict) {
        warnings.push({
          code: 'OBJECT_SCHEMA_NO_PROPERTIES',
          message: 'Object schemas should define properties',
          severity: ValidationSeverity.WARNING,
          path: 'properties',
          expected: 'object defining schema properties',
          actual: undefined,
          specReference: 'JSON Schema Validation'
        });
      }

      // Validate required array
      if (schema.required) {
        if (!Array.isArray(schema.required)) {
          errors.push({
            code: 'REQUIRED_NOT_ARRAY',
            message: 'Required property must be an array',
            severity: ValidationSeverity.ERROR,
            path: 'required',
            expected: 'array of strings',
            actual: typeof schema.required,
            specReference: 'JSON Schema Validation'
          });
        } else {
          // Check each required item
          schema.required.forEach((item: any, index: number) => {
            if (typeof item !== 'string') {
              errors.push({
                code: 'REQUIRED_ITEM_NOT_STRING',
                message: `Required item at index ${index} must be a string`,
                severity: ValidationSeverity.ERROR,
                path: `required[${index}]`,
                expected: 'string',
                actual: typeof item,
                specReference: 'JSON Schema Validation'
              });
            }
          });
        }
      }
    }

    // Check for array items schema
    if (schema.type === 'array' && !schema.items && this.config.strict) {
      warnings.push({
        code: 'ARRAY_SCHEMA_NO_ITEMS',
        message: 'Array schemas should define items',
        severity: ValidationSeverity.WARNING,
        path: 'items',
        expected: 'schema for array items',
        actual: undefined,
        specReference: 'JSON Schema Validation'
      });
    }
  }

  /**
   * Validate JSON Schema draft compliance
   */
  private validateJsonSchemaDraft(
    schema: Record<string, any>,
    _errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Check for $schema property
    if (schema.$schema) {
      if (schema.$schema !== SUPPORTED_JSON_SCHEMA_VERSION) {
        warnings.push({
          code: 'UNSUPPORTED_SCHEMA_VERSION',
          message: `Unsupported JSON Schema version: ${schema.$schema}`,
          severity: ValidationSeverity.WARNING,
          path: '$schema',
          expected: SUPPORTED_JSON_SCHEMA_VERSION,
          actual: schema.$schema,
          specReference: 'JSON Schema Meta-Schema'
        });
      }
    }

    // Check for deprecated keywords
    const deprecatedKeywords = ['id']; // 'id' is deprecated in favor of '$id'
    deprecatedKeywords.forEach(keyword => {
      if (schema[keyword]) {
        warnings.push({
          code: 'DEPRECATED_KEYWORD',
          message: `Keyword '${keyword}' is deprecated`,
          severity: ValidationSeverity.WARNING,
          path: keyword,
          expected: keyword === 'id' ? '$id' : 'updated keyword',
          actual: keyword,
          specReference: 'JSON Schema Migration Guide'
        });
      }
    });
  }

  /**
   * Validate schema nesting depth
   */
  private validateSchemaDepth(
    schema: Record<string, any>,
    maxDepth: number,
    errors: ValidationError[],
    _warnings: ValidationError[],
    currentDepth: number = 0,
    path: string = ''
  ): void {
    if (currentDepth > maxDepth) {
      errors.push({
        code: 'SCHEMA_DEPTH_EXCEEDED',
        message: `Schema nesting depth exceeds maximum of ${maxDepth}`,
        severity: ValidationSeverity.ERROR,
        path,
        expected: `depth <= ${maxDepth}`,
        actual: `depth > ${maxDepth}`,
        specReference: 'Best Practices - Schema Complexity'
      });
      return; // Stop checking deeper
    }

    // Recursively check nested schemas
    if (schema.properties && typeof schema.properties === 'object') {
      Object.entries(schema.properties).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          this.validateSchemaDepth(
            value as Record<string, any>,
            maxDepth,
            errors,
            _warnings,
            currentDepth + 1,
            path ? `${path}.properties.${key}` : `properties.${key}`
          );
        }
      });
    }

    if (schema.items && typeof schema.items === 'object') {
      this.validateSchemaDepth(
        schema.items as Record<string, any>,
        maxDepth,
        errors,
        _warnings,
        currentDepth + 1,
        path ? `${path}.items` : 'items'
      );
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      this.validateSchemaDepth(
        schema.additionalProperties as Record<string, any>,
        maxDepth,
        errors,
        _warnings,
        currentDepth + 1,
        path ? `${path}.additionalProperties` : 'additionalProperties'
      );
    }
  }

  /**
   * Validate type-specific schema rules
   */
  private validateTypeSpecificRules(
    schema: Record<string, any>,
    errors: ValidationError[],
    warnings: ValidationError[],
    info: ValidationError[]
  ): void {
    switch (schema.type) {
      case 'string':
        this.validateStringSchema(schema, errors, warnings, info);
        break;
      case 'number':
      case 'integer':
        this.validateNumericSchema(schema, errors, warnings, info);
        break;
      case 'object':
        this.validateObjectSchema(schema, errors, warnings, info);
        break;
      case 'array':
        this.validateArraySchema(schema, errors, warnings, info);
        break;
    }
  }

  /**
   * Validate string-specific schema properties
   */
  private validateStringSchema(
    schema: Record<string, any>,
    errors: ValidationError[],
    _warnings: ValidationError[],
    _info: ValidationError[]
  ): void {
    // Check for conflicting constraints
    if (schema.minLength !== undefined && schema.maxLength !== undefined) {
      if (schema.minLength > schema.maxLength) {
        errors.push({
          code: 'STRING_LENGTH_CONFLICT',
          message: 'minLength cannot be greater than maxLength',
          severity: ValidationSeverity.ERROR,
          path: 'minLength',
          expected: `<= ${schema.maxLength}`,
          actual: schema.minLength,
          specReference: 'JSON Schema Validation'
        });
      }
    }

    // Check for negative lengths
    if (schema.minLength !== undefined && schema.minLength < 0) {
      errors.push({
        code: 'NEGATIVE_MIN_LENGTH',
        message: 'minLength cannot be negative',
        severity: ValidationSeverity.ERROR,
        path: 'minLength',
        expected: '>= 0',
        actual: schema.minLength,
        specReference: 'JSON Schema Validation'
      });
    }
  }

  /**
   * Validate numeric schema properties
   */
  private validateNumericSchema(
    schema: Record<string, any>,
    errors: ValidationError[],
    _warnings: ValidationError[],
    _info: ValidationError[]
  ): void {
    // Check for conflicting constraints
    if (schema.minimum !== undefined && schema.maximum !== undefined) {
      if (schema.minimum > schema.maximum) {
        errors.push({
          code: 'NUMERIC_RANGE_CONFLICT',
          message: 'minimum cannot be greater than maximum',
          severity: ValidationSeverity.ERROR,
          path: 'minimum',
          expected: `<= ${schema.maximum}`,
          actual: schema.minimum,
          specReference: 'JSON Schema Validation'
        });
      }
    }

    // Check exclusive range constraints
    if (schema.exclusiveMinimum !== undefined && schema.exclusiveMaximum !== undefined) {
      if (schema.exclusiveMinimum >= schema.exclusiveMaximum) {
        errors.push({
          code: 'NUMERIC_EXCLUSIVE_RANGE_CONFLICT',
          message: 'exclusiveMinimum cannot be greater than or equal to exclusiveMaximum',
          severity: ValidationSeverity.ERROR,
          path: 'exclusiveMinimum',
          expected: `< ${schema.exclusiveMaximum}`,
          actual: schema.exclusiveMinimum,
          specReference: 'JSON Schema Validation'
        });
      }
    }

    // Check multipleOf
    if (schema.multipleOf !== undefined && schema.multipleOf <= 0) {
      errors.push({
        code: 'MULTIPLE_OF_NOT_POSITIVE',
        message: 'multipleOf must be greater than 0',
        severity: ValidationSeverity.ERROR,
        path: 'multipleOf',
        expected: '> 0',
        actual: schema.multipleOf,
        specReference: 'JSON Schema Validation'
      });
    }
  }

  /**
   * Validate object schema properties
   */
  private validateObjectSchema(
    schema: Record<string, any>,
    errors: ValidationError[],
    _warnings: ValidationError[],
    _info: ValidationError[]
  ): void {
    // Check for negative minProperties
    if (schema.minProperties !== undefined && schema.minProperties < 0) {
      errors.push({
        code: 'OBJECT_MIN_PROPERTIES_NEGATIVE',
        message: 'minProperties cannot be negative',
        severity: ValidationSeverity.ERROR,
        path: 'minProperties',
        expected: '>= 0',
        actual: schema.minProperties,
        specReference: 'JSON Schema Validation'
      });
    }

    // Check for negative maxProperties
    if (schema.maxProperties !== undefined && schema.maxProperties < 0) {
      errors.push({
        code: 'OBJECT_MAX_PROPERTIES_NEGATIVE',
        message: 'maxProperties cannot be negative',
        severity: ValidationSeverity.ERROR,
        path: 'maxProperties',
        expected: '>= 0',
        actual: schema.maxProperties,
        specReference: 'JSON Schema Validation'
      });
    }

    // Check for property count constraints
    if (schema.minProperties !== undefined && schema.maxProperties !== undefined) {
      if (schema.minProperties > schema.maxProperties) {
        errors.push({
          code: 'OBJECT_PROPERTIES_CONFLICT',
          message: 'minProperties cannot be greater than maxProperties',
          severity: ValidationSeverity.ERROR,
          path: 'minProperties',
          expected: `<= ${schema.maxProperties}`,
          actual: schema.minProperties,
          specReference: 'JSON Schema Validation'
        });
      }
    }
  }

  /**
   * Validate array schema properties
   */
  private validateArraySchema(
    schema: Record<string, any>,
    errors: ValidationError[],
    _warnings: ValidationError[],
    _info: ValidationError[]
  ): void {
    // Check for negative minItems
    if (schema.minItems !== undefined && schema.minItems < 0) {
      errors.push({
        code: 'ARRAY_MIN_ITEMS_NEGATIVE',
        message: 'minItems cannot be negative',
        severity: ValidationSeverity.ERROR,
        path: 'minItems',
        expected: '>= 0',
        actual: schema.minItems,
        specReference: 'JSON Schema Validation'
      });
    }

    // Check for negative maxItems
    if (schema.maxItems !== undefined && schema.maxItems < 0) {
      errors.push({
        code: 'ARRAY_MAX_ITEMS_NEGATIVE',
        message: 'maxItems cannot be negative',
        severity: ValidationSeverity.ERROR,
        path: 'maxItems',
        expected: '>= 0',
        actual: schema.maxItems,
        specReference: 'JSON Schema Validation'
      });
    }

    // Check for item count constraints
    if (schema.minItems !== undefined && schema.maxItems !== undefined) {
      if (schema.minItems > schema.maxItems) {
        errors.push({
          code: 'ARRAY_ITEMS_CONFLICT',
          message: 'minItems cannot be greater than maxItems',
          severity: ValidationSeverity.ERROR,
          path: 'minItems',
          expected: `<= ${schema.maxItems}`,
          actual: schema.minItems,
          specReference: 'JSON Schema Validation'
        });
      }
    }
  }
} 