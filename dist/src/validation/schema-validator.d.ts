import { ValidationResult, SchemaValidationOptions } from './types';
export declare class SchemaValidator {
    private config;
    constructor(config?: SchemaValidationOptions);
    validateSchema(schema: Record<string, any>): ValidationResult;
    private validateBasicStructure;
    private validateJsonSchemaDraft;
    private validateSchemaDepth;
    private validateTypeSpecificRules;
    private validateStringSchema;
    private validateNumericSchema;
    private validateObjectSchema;
    private validateArraySchema;
}
//# sourceMappingURL=schema-validator.d.ts.map