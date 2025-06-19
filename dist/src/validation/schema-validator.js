import { ValidationSeverity } from './types';
import { SUPPORTED_JSON_SCHEMA_VERSION, VALID_JSON_SCHEMA_TYPES, MAX_SCHEMA_DEPTH } from './constants';
export class SchemaValidator {
    constructor(config = {}) {
        this.config = {
            strict: true,
            validateJsonSchemaDraft: true,
            maxSchemaDepth: MAX_SCHEMA_DEPTH,
            ...config
        };
    }
    validateSchema(schema) {
        const errors = [];
        const warnings = [];
        const info = [];
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
        this.validateBasicStructure(schema, errors, warnings);
        if (this.config.validateJsonSchemaDraft) {
            this.validateJsonSchemaDraft(schema, errors, warnings);
        }
        if (this.config.maxSchemaDepth) {
            this.validateSchemaDepth(schema, this.config.maxSchemaDepth, errors, warnings);
        }
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
    validateBasicStructure(schema, errors, warnings) {
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
                }
                else {
                    schema.required.forEach((item, index) => {
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
    validateJsonSchemaDraft(schema, _errors, warnings) {
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
        const deprecatedKeywords = ['id'];
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
    validateSchemaDepth(schema, maxDepth, errors, _warnings, currentDepth = 0, path = '') {
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
            return;
        }
        if (schema.properties && typeof schema.properties === 'object') {
            Object.entries(schema.properties).forEach(([key, value]) => {
                if (value && typeof value === 'object') {
                    this.validateSchemaDepth(value, maxDepth, errors, _warnings, currentDepth + 1, path ? `${path}.properties.${key}` : `properties.${key}`);
                }
            });
        }
        if (schema.items && typeof schema.items === 'object') {
            this.validateSchemaDepth(schema.items, maxDepth, errors, _warnings, currentDepth + 1, path ? `${path}.items` : 'items');
        }
        if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
            this.validateSchemaDepth(schema.additionalProperties, maxDepth, errors, _warnings, currentDepth + 1, path ? `${path}.additionalProperties` : 'additionalProperties');
        }
    }
    validateTypeSpecificRules(schema, errors, warnings, info) {
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
    validateStringSchema(schema, errors, _warnings, _info) {
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
    validateNumericSchema(schema, errors, _warnings, _info) {
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
    validateObjectSchema(schema, errors, _warnings, _info) {
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
    validateArraySchema(schema, errors, _warnings, _info) {
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
//# sourceMappingURL=schema-validator.js.map