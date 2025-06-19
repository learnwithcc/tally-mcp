import { SchemaValidator } from '../schema-validator';
import { ValidationSeverity } from '../types';
import { SUPPORTED_JSON_SCHEMA_VERSION, VALID_JSON_SCHEMA_TYPES } from '../constants';
describe('SchemaValidator', () => {
    let validator;
    beforeEach(() => {
        validator = new SchemaValidator();
    });
    describe('constructor', () => {
        it('should create instance with default config', () => {
            expect(validator).toBeInstanceOf(SchemaValidator);
        });
        it('should create instance with custom config', () => {
            const config = {
                strict: false,
                validateJsonSchemaDraft: false,
                maxSchemaDepth: 5
            };
            const customValidator = new SchemaValidator(config);
            expect(customValidator).toBeInstanceOf(SchemaValidator);
        });
    });
    describe('validateSchema', () => {
        it('should validate a simple valid schema', () => {
            const schema = {
                type: 'string',
                description: 'A simple string'
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.summary.errorCount).toBe(0);
        });
        it('should validate a complex valid object schema', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number', minimum: 0 },
                    email: { type: 'string', format: 'email' }
                },
                required: ['name', 'email']
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should validate array schema', () => {
            const schema = {
                type: 'array',
                items: { type: 'string' },
                minItems: 1
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should return validation summary', () => {
            const schema = { type: 'string' };
            const result = validator.validateSchema(schema);
            expect(result.summary).toEqual({
                errorCount: 0,
                warningCount: 0,
                infoCount: 0
            });
        });
    });
    describe('basic structure validation', () => {
        it('should error when type is missing in strict mode', () => {
            const schema = { description: 'No type specified' };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                code: 'SCHEMA_TYPE_MISSING',
                severity: ValidationSeverity.ERROR,
                path: 'type'
            });
        });
        it('should not error when type is missing in non-strict mode', () => {
            const nonStrictValidator = new SchemaValidator({ strict: false });
            const schema = { description: 'No type specified' };
            const result = nonStrictValidator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should error for invalid schema type', () => {
            const schema = { type: 'invalid-type' };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                code: 'SCHEMA_TYPE_INVALID',
                severity: ValidationSeverity.ERROR,
                path: 'type',
                actual: 'invalid-type'
            });
        });
        it('should accept all valid JSON Schema types', () => {
            VALID_JSON_SCHEMA_TYPES.forEach(type => {
                const schema = { type };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(true);
            });
        });
    });
    describe('object schema validation', () => {
        it('should warn when object schema has no properties in strict mode', () => {
            const schema = { type: 'object' };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toMatchObject({
                code: 'OBJECT_SCHEMA_NO_PROPERTIES',
                severity: ValidationSeverity.WARNING,
                path: 'properties'
            });
        });
        it('should not warn when object schema has no properties in non-strict mode', () => {
            const nonStrictValidator = new SchemaValidator({ strict: false });
            const schema = { type: 'object' };
            const result = nonStrictValidator.validateSchema(schema);
            expect(result.warnings).toHaveLength(0);
        });
        it('should error when required is not an array', () => {
            const schema = {
                type: 'object',
                properties: { name: { type: 'string' } },
                required: 'name'
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                code: 'REQUIRED_NOT_ARRAY',
                severity: ValidationSeverity.ERROR,
                path: 'required'
            });
        });
        it('should error when required item is not a string', () => {
            const schema = {
                type: 'object',
                properties: { name: { type: 'string' } },
                required: ['name', 123]
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                code: 'REQUIRED_ITEM_NOT_STRING',
                severity: ValidationSeverity.ERROR,
                path: 'required[1]'
            });
        });
        it('should validate valid required array', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' }
                },
                required: ['name', 'email']
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
    describe('array schema validation', () => {
        it('should warn when array schema has no items in strict mode', () => {
            const schema = { type: 'array' };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toMatchObject({
                code: 'ARRAY_SCHEMA_NO_ITEMS',
                severity: ValidationSeverity.WARNING,
                path: 'items'
            });
        });
        it('should not warn when array schema has no items in non-strict mode', () => {
            const nonStrictValidator = new SchemaValidator({ strict: false });
            const schema = { type: 'array' };
            const result = nonStrictValidator.validateSchema(schema);
            expect(result.warnings).toHaveLength(0);
        });
        it('should validate array schema with items', () => {
            const schema = {
                type: 'array',
                items: { type: 'string' }
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });
    describe('JSON Schema draft validation', () => {
        it('should warn for unsupported schema version', () => {
            const schema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'string'
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toMatchObject({
                code: 'UNSUPPORTED_SCHEMA_VERSION',
                severity: ValidationSeverity.WARNING,
                path: '$schema',
                actual: 'http://json-schema.org/draft-04/schema#'
            });
        });
        it('should not warn for supported schema version', () => {
            const schema = {
                $schema: SUPPORTED_JSON_SCHEMA_VERSION,
                type: 'string'
            };
            const result = validator.validateSchema(schema);
            expect(result.warnings.filter(w => w.code === 'UNSUPPORTED_SCHEMA_VERSION')).toHaveLength(0);
        });
        it('should warn for deprecated keywords', () => {
            const schema = {
                type: 'string',
                id: 'deprecated-id'
            };
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toMatchObject({
                code: 'DEPRECATED_KEYWORD',
                severity: ValidationSeverity.WARNING,
                path: 'id'
            });
        });
        it('should skip draft validation when disabled', () => {
            const validatorNoDraft = new SchemaValidator({ validateJsonSchemaDraft: false });
            const schema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'string'
            };
            const result = validatorNoDraft.validateSchema(schema);
            expect(result.warnings.filter(w => w.code === 'UNSUPPORTED_SCHEMA_VERSION')).toHaveLength(0);
        });
    });
    describe('schema depth validation', () => {
        it('should error when schema exceeds max depth', () => {
            const deepSchema = {
                type: 'object',
                properties: {
                    level1: {
                        type: 'object',
                        properties: {
                            level2: {
                                type: 'object',
                                properties: {
                                    level3: {
                                        type: 'object',
                                        properties: {
                                            level4: {
                                                type: 'object',
                                                properties: {
                                                    level5: {
                                                        type: 'object',
                                                        properties: {
                                                            level6: { type: 'string' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            const result = validator.validateSchema(deepSchema);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'SCHEMA_DEPTH_EXCEEDED')).toBe(true);
        });
        it('should allow custom max depth', () => {
            const customValidator = new SchemaValidator({ maxSchemaDepth: 10 });
            const deepSchema = {
                type: 'object',
                properties: {
                    level1: {
                        type: 'object',
                        properties: {
                            level2: { type: 'string' }
                        }
                    }
                }
            };
            const result = customValidator.validateSchema(deepSchema);
            expect(result.valid).toBe(true);
        });
        it('should skip depth validation when maxSchemaDepth is undefined', () => {
            const noDepthValidator = new SchemaValidator({});
            const deepSchema = {
                type: 'object',
                properties: {
                    level1: {
                        type: 'object',
                        properties: {
                            level2: { type: 'string' }
                        }
                    }
                }
            };
            const result = noDepthValidator.validateSchema(deepSchema);
            expect(result.valid).toBe(true);
        });
    });
    describe('type-specific validation', () => {
        describe('string schema validation', () => {
            it('should error for negative minLength', () => {
                const schema = {
                    type: 'string',
                    minLength: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'NEGATIVE_MIN_LENGTH')).toBe(true);
            });
            it('should error for negative maxLength', () => {
                const schema = {
                    type: 'string',
                    maxLength: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'STRING_MAX_LENGTH_NEGATIVE')).toBe(true);
            });
            it('should error when minLength > maxLength', () => {
                const schema = {
                    type: 'string',
                    minLength: 10,
                    maxLength: 5
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'STRING_LENGTH_CONFLICT')).toBe(true);
            });
            it('should validate valid string constraints', () => {
                const schema = {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                    pattern: '^[a-zA-Z]+$'
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(true);
            });
        });
        describe('numeric schema validation', () => {
            it('should error when minimum > maximum', () => {
                const schema = {
                    type: 'number',
                    minimum: 10,
                    maximum: 5
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'NUMERIC_RANGE_CONFLICT')).toBe(true);
            });
            it('should error when exclusiveMinimum >= exclusiveMaximum', () => {
                const schema = {
                    type: 'number',
                    exclusiveMinimum: 10,
                    exclusiveMaximum: 10
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'NUMERIC_EXCLUSIVE_RANGE_CONFLICT')).toBe(true);
            });
            it('should error for negative multipleOf', () => {
                const schema = {
                    type: 'number',
                    multipleOf: -2
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'MULTIPLE_OF_NOT_POSITIVE')).toBe(true);
            });
            it('should validate valid numeric constraints', () => {
                const schema = {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    multipleOf: 0.5
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(true);
            });
        });
        describe('object schema validation', () => {
            it('should error for negative minProperties', () => {
                const schema = {
                    type: 'object',
                    minProperties: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'OBJECT_MIN_PROPERTIES_NEGATIVE')).toBe(true);
            });
            it('should error for negative maxProperties', () => {
                const schema = {
                    type: 'object',
                    maxProperties: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'OBJECT_MAX_PROPERTIES_NEGATIVE')).toBe(true);
            });
            it('should error when minProperties > maxProperties', () => {
                const schema = {
                    type: 'object',
                    minProperties: 10,
                    maxProperties: 5
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'OBJECT_PROPERTIES_CONFLICT')).toBe(true);
            });
        });
        describe('array schema validation', () => {
            it('should error for negative minItems', () => {
                const schema = {
                    type: 'array',
                    minItems: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'ARRAY_MIN_ITEMS_NEGATIVE')).toBe(true);
            });
            it('should error for negative maxItems', () => {
                const schema = {
                    type: 'array',
                    maxItems: -1
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'ARRAY_MAX_ITEMS_NEGATIVE')).toBe(true);
            });
            it('should error when minItems > maxItems', () => {
                const schema = {
                    type: 'array',
                    minItems: 10,
                    maxItems: 5
                };
                const result = validator.validateSchema(schema);
                expect(result.valid).toBe(false);
                expect(result.errors.some(e => e.code === 'ARRAY_ITEMS_CONFLICT')).toBe(true);
            });
        });
    });
    describe('edge cases', () => {
        it('should handle empty schema object', () => {
            const schema = {};
            const result = validator.validateSchema(schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
        });
        it('should handle null schema', () => {
            const result = validator.validateSchema(null);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        it('should handle schema with circular references', () => {
            const schema = { type: 'object' };
            schema.properties = { self: schema };
            const result = validator.validateSchema(schema);
            expect(result).toBeDefined();
        });
        it('should handle very large schema', () => {
            const largeSchema = {
                type: 'object',
                properties: {}
            };
            for (let i = 0; i < 1000; i++) {
                largeSchema.properties[`prop${i}`] = { type: 'string' };
            }
            const result = validator.validateSchema(largeSchema);
            expect(result).toBeDefined();
            expect(result.valid).toBe(true);
        });
    });
});
//# sourceMappingURL=schema-validator.test.js.map