"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = exports.CommonSchemas = void 0;
exports.createValidationMiddleware = createValidationMiddleware;
exports.validateWithSchema = validateWithSchema;
exports.createTypedValidator = createTypedValidator;
exports.formatValidationError = formatValidationError;
const zod_1 = require("zod");
const input_sanitizer_1 = require("../utils/input-sanitizer");
exports.CommonSchemas = {
    pagination: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
        offset: zod_1.z.coerce.number().int().min(0).optional(),
    }),
    formId: zod_1.z.object({
        formId: zod_1.z.string().min(1, 'Form ID is required').refine((val) => input_sanitizer_1.InputValidator.isValidId(val), 'Form ID contains invalid characters'),
    }),
    workspaceId: zod_1.z.object({
        workspaceId: zod_1.z.string().min(1, 'Workspace ID is required').refine((val) => input_sanitizer_1.InputValidator.isValidId(val), 'Workspace ID contains invalid characters'),
    }),
    userId: zod_1.z.object({
        userId: zod_1.z.string().min(1, 'User ID is required').refine((val) => input_sanitizer_1.InputValidator.isValidId(val), 'User ID contains invalid characters'),
    }),
    submissionId: zod_1.z.object({
        submissionId: zod_1.z.string().min(1, 'Submission ID is required').refine((val) => input_sanitizer_1.InputValidator.isValidId(val), 'Submission ID contains invalid characters'),
    }),
    dateRange: zod_1.z.object({
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        timezone: zod_1.z.string().optional(),
    }).refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
    }, 'Start date must be before or equal to end date'),
    fileUpload: zod_1.z.object({
        filename: zod_1.z.string().min(1).max(255),
        mimetype: zod_1.z.string().refine((val) => /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(val), 'Invalid MIME type format'),
        size: zod_1.z.number().int().min(1).max(50 * 1024 * 1024),
    }),
    apiKey: zod_1.z.object({
        apiKey: zod_1.z.string().min(20).max(200).refine((val) => /^[A-Za-z0-9_\-]+$/.test(val), 'API key contains invalid characters'),
    }),
    email: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format').refine((val) => input_sanitizer_1.InputValidator.isValidEmail(val), 'Email contains potentially unsafe characters'),
    }),
    url: zod_1.z.object({
        url: zod_1.z.string().url('Invalid URL format').refine((val) => input_sanitizer_1.InputValidator.isValidUrl(val), 'URL contains unsafe protocol or characters'),
    }),
    search: zod_1.z.object({
        q: zod_1.z.string().min(1).max(200).refine((val) => !input_sanitizer_1.InputValidator.containsSqlInjectionPatterns(val), 'Search query contains potentially dangerous patterns').refine((val) => !input_sanitizer_1.InputValidator.containsXssPatterns(val), 'Search query contains potentially malicious content'),
        fields: zod_1.z.array(zod_1.z.string()).optional(),
        sort: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
};
function createValidationMiddleware(options) {
    return (req, res, next) => {
        const errors = [];
        try {
            if (options.body) {
                const bodyResult = validateData(req.body || {}, options.body, 'body', options);
                if (!bodyResult.success) {
                    errors.push(...bodyResult.errors);
                }
                else {
                    req.body = bodyResult.data;
                }
            }
            if (options.query) {
                const queryResult = validateData(req.query || {}, options.query, 'query', options);
                if (!queryResult.success) {
                    errors.push(...queryResult.errors);
                }
                else {
                    req.query = queryResult.data;
                }
            }
            if (options.params) {
                const paramsResult = validateData(req.params || {}, options.params, 'params', options);
                if (!paramsResult.success) {
                    errors.push(...paramsResult.errors);
                }
                else {
                    req.params = paramsResult.data;
                }
            }
            if (options.headers) {
                const headersResult = validateData(req.headers || {}, options.headers, 'headers', options);
                if (!headersResult.success) {
                    errors.push(...headersResult.errors);
                }
            }
            if (options.securityChecks) {
                const securityErrors = performSecurityChecks(req);
                errors.push(...securityErrors);
            }
            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: options.errorMessage || 'Request data is invalid',
                    details: errors,
                });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                error: 'Validation error',
                message: 'An error occurred during request validation',
            });
        }
    };
}
function validateData(data, schema, field, options) {
    try {
        let processedSchema = schema;
        if (options.partial && 'partial' in schema) {
            processedSchema = schema.partial();
        }
        if (options.stripUnknown && 'strip' in processedSchema) {
            processedSchema = processedSchema.strip();
        }
        const result = processedSchema.parse(data);
        return {
            success: true,
            data: result,
        };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map(err => ({
                field: `${field}.${err.path.join('.')}`,
                message: err.message,
                code: err.code,
                value: err.path.reduce((obj, key) => obj?.[key], data),
            }));
            return {
                success: false,
                errors,
            };
        }
        return {
            success: false,
            errors: [{
                    field,
                    message: 'Validation failed',
                    code: 'validation_error',
                }],
        };
    }
}
function performSecurityChecks(req) {
    const errors = [];
    const checkObject = (obj, prefix) => {
        if (typeof obj === 'string') {
            if (input_sanitizer_1.InputValidator.containsSqlInjectionPatterns(obj)) {
                errors.push({
                    field: prefix,
                    message: 'Contains potential SQL injection patterns',
                    code: 'security_violation',
                    value: obj,
                });
            }
            if (input_sanitizer_1.InputValidator.containsXssPatterns(obj)) {
                errors.push({
                    field: prefix,
                    message: 'Contains potential XSS patterns',
                    code: 'security_violation',
                    value: obj,
                });
            }
        }
        else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                checkObject(obj[key], `${prefix}.${key}`);
            });
        }
    };
    if (req.body)
        checkObject(req.body, 'body');
    if (req.query)
        checkObject(req.query, 'query');
    if (req.params)
        checkObject(req.params, 'params');
    const checkLength = (obj, prefix, maxLength = 10000) => {
        if (typeof obj === 'string' && obj.length > maxLength) {
            errors.push({
                field: prefix,
                message: `Value exceeds maximum length of ${maxLength} characters`,
                code: 'length_violation',
                value: `${obj.substring(0, 100)}...`,
            });
        }
        else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                checkLength(obj[key], `${prefix}.${key}`, maxLength);
            });
        }
    };
    if (req.body)
        checkLength(req.body, 'body');
    if (req.query)
        checkLength(req.query, 'query', 1000);
    return errors;
}
exports.ValidationMiddleware = {
    pagination: createValidationMiddleware({
        query: exports.CommonSchemas.pagination,
    }),
    formParams: createValidationMiddleware({
        params: exports.CommonSchemas.formId,
        securityChecks: true,
    }),
    workspaceParams: createValidationMiddleware({
        params: exports.CommonSchemas.workspaceId,
        securityChecks: true,
    }),
    userParams: createValidationMiddleware({
        params: exports.CommonSchemas.userId,
        securityChecks: true,
    }),
    submissionParams: createValidationMiddleware({
        params: exports.CommonSchemas.submissionId,
        securityChecks: true,
    }),
    search: createValidationMiddleware({
        query: exports.CommonSchemas.search,
        securityChecks: true,
    }),
    fileUpload: createValidationMiddleware({
        body: exports.CommonSchemas.fileUpload,
        securityChecks: true,
    }),
    apiKey: createValidationMiddleware({
        headers: zod_1.z.object({
            'x-api-key': zod_1.z.string().min(20).max(200),
        }),
        securityChecks: true,
    }),
    mcpRequest: createValidationMiddleware({
        body: zod_1.z.object({
            method: zod_1.z.string().min(1).max(100),
            params: zod_1.z.record(zod_1.z.any()).optional(),
        }),
        stripUnknown: true,
        securityChecks: true,
    }),
};
function validateWithSchema(data, schema, options = {}) {
    const result = validateData(data, schema, 'data', options);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.errors };
}
function createTypedValidator(schema) {
    return (data) => {
        try {
            schema.parse(data);
            return true;
        }
        catch {
            return false;
        }
    };
}
function formatValidationError(errors) {
    return {
        error: 'Validation failed',
        message: 'The provided data is invalid',
        details: errors.map(err => ({
            field: err.field,
            message: err.message,
            code: err.code,
        })),
    };
}
//# sourceMappingURL=validation.js.map