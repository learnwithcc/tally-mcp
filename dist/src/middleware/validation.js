import { z, ZodError } from 'zod';
import { InputValidator } from '../utils/input-sanitizer';
export const CommonSchemas = {
    pagination: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).optional(),
    }),
    formId: z.object({
        formId: z.string().min(1, 'Form ID is required').refine((val) => InputValidator.isValidId(val), 'Form ID contains invalid characters'),
    }),
    workspaceId: z.object({
        workspaceId: z.string().min(1, 'Workspace ID is required').refine((val) => InputValidator.isValidId(val), 'Workspace ID contains invalid characters'),
    }),
    userId: z.object({
        userId: z.string().min(1, 'User ID is required').refine((val) => InputValidator.isValidId(val), 'User ID contains invalid characters'),
    }),
    submissionId: z.object({
        submissionId: z.string().min(1, 'Submission ID is required').refine((val) => InputValidator.isValidId(val), 'Submission ID contains invalid characters'),
    }),
    dateRange: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        timezone: z.string().optional(),
    }).refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
    }, 'Start date must be before or equal to end date'),
    fileUpload: z.object({
        filename: z.string().min(1).max(255),
        mimetype: z.string().refine((val) => /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(val), 'Invalid MIME type format'),
        size: z.number().int().min(1).max(50 * 1024 * 1024),
    }),
    apiKey: z.object({
        apiKey: z.string().min(20).max(200).refine((val) => /^[A-Za-z0-9_\-]+$/.test(val), 'API key contains invalid characters'),
    }),
    email: z.object({
        email: z.string().email('Invalid email format').refine((val) => InputValidator.isValidEmail(val), 'Email contains potentially unsafe characters'),
    }),
    url: z.object({
        url: z.string().url('Invalid URL format').refine((val) => InputValidator.isValidUrl(val), 'URL contains unsafe protocol or characters'),
    }),
    search: z.object({
        q: z.string().min(1).max(200).refine((val) => !InputValidator.containsSqlInjectionPatterns(val), 'Search query contains potentially dangerous patterns').refine((val) => !InputValidator.containsXssPatterns(val), 'Search query contains potentially malicious content'),
        fields: z.array(z.string()).optional(),
        sort: z.enum(['asc', 'desc']).optional(),
    }),
};
export function createValidationMiddleware(options) {
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
                res.status(400).json({
                    error: 'Validation failed',
                    message: options.errorMessage || 'Request data is invalid',
                    details: errors,
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                error: 'Validation error',
                message: 'An error occurred during request validation',
            });
            return;
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
        if (error instanceof ZodError) {
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
            if (InputValidator.containsSqlInjectionPatterns(obj)) {
                errors.push({
                    field: prefix,
                    message: 'Contains potential SQL injection patterns',
                    code: 'security_violation',
                    value: obj,
                });
            }
            if (InputValidator.containsXssPatterns(obj)) {
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
export const ValidationMiddleware = {
    pagination: createValidationMiddleware({
        query: CommonSchemas.pagination,
    }),
    formParams: createValidationMiddleware({
        params: CommonSchemas.formId,
        securityChecks: true,
    }),
    workspaceParams: createValidationMiddleware({
        params: CommonSchemas.workspaceId,
        securityChecks: true,
    }),
    userParams: createValidationMiddleware({
        params: CommonSchemas.userId,
        securityChecks: true,
    }),
    submissionParams: createValidationMiddleware({
        params: CommonSchemas.submissionId,
        securityChecks: true,
    }),
    search: createValidationMiddleware({
        query: CommonSchemas.search,
        securityChecks: true,
    }),
    fileUpload: createValidationMiddleware({
        body: CommonSchemas.fileUpload,
        securityChecks: true,
    }),
    apiKey: createValidationMiddleware({
        headers: z.object({
            'x-api-key': z.string().min(20).max(200),
        }),
        securityChecks: true,
    }),
    mcpRequest: createValidationMiddleware({
        body: z.object({
            method: z.string().min(1).max(100),
            params: z.record(z.any()).optional(),
        }),
        stripUnknown: true,
        securityChecks: true,
    }),
};
export function validateWithSchema(data, schema, options = {}) {
    const result = validateData(data, schema, 'data', options);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.errors };
}
export function createTypedValidator(schema) {
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
export function formatValidationError(errors) {
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