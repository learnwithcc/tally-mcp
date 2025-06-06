"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualSanitization = exports.SanitizationMiddleware = void 0;
exports.createSanitizationMiddleware = createSanitizationMiddleware;
const input_sanitizer_1 = require("../utils/input-sanitizer");
const DEFAULT_OPTIONS = {
    bodyOptions: input_sanitizer_1.SanitizationPresets.FORM_INPUT,
    queryOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
    paramsOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
    skipRoutes: [],
    customSanitizers: {},
};
function createSanitizationMiddleware(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    return (req, res, next) => {
        try {
            const shouldSkip = config.skipRoutes.some(pattern => pattern.test(req.path));
            if (shouldSkip) {
                return next();
            }
            if (req.body && typeof req.body === 'object') {
                req.body = sanitizeRequestObject(req.body, config.bodyOptions, config.customSanitizers);
            }
            if (req.query && typeof req.query === 'object') {
                req.query = sanitizeRequestObject(req.query, config.queryOptions, config.customSanitizers);
            }
            if (req.params && typeof req.params === 'object') {
                req.params = sanitizeRequestObject(req.params, config.paramsOptions, config.customSanitizers);
            }
            next();
        }
        catch (error) {
            res.status(400).json({
                error: 'Invalid request data',
                message: 'Request contains invalid or potentially malicious content',
            });
        }
    };
}
function sanitizeRequestObject(obj, options, customSanitizers) {
    const sanitized = (0, input_sanitizer_1.sanitizeObject)(obj, options);
    for (const [fieldName, sanitizer] of Object.entries(customSanitizers)) {
        if (sanitized[fieldName] !== undefined) {
            sanitized[fieldName] = sanitizer(sanitized[fieldName]);
        }
    }
    return sanitized;
}
exports.SanitizationMiddleware = {
    apiParams: createSanitizationMiddleware({
        bodyOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        queryOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        paramsOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
    }),
    formInput: createSanitizationMiddleware({
        bodyOptions: input_sanitizer_1.SanitizationPresets.FORM_INPUT,
        queryOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        paramsOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
    }),
    richText: createSanitizationMiddleware({
        bodyOptions: input_sanitizer_1.SanitizationPresets.RICH_TEXT,
        queryOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        paramsOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
    }),
    mcpTools: createSanitizationMiddleware({
        bodyOptions: input_sanitizer_1.SanitizationPresets.FORM_INPUT,
        queryOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        paramsOptions: input_sanitizer_1.SanitizationPresets.API_PARAM,
        customSanitizers: {
            formId: (value) => {
                if (typeof value === 'string') {
                    return (0, input_sanitizer_1.sanitizeString)(value, input_sanitizer_1.SanitizationPresets.API_PARAM);
                }
                return value;
            },
            workspaceId: (value) => {
                if (typeof value === 'string') {
                    return (0, input_sanitizer_1.sanitizeString)(value, input_sanitizer_1.SanitizationPresets.API_PARAM);
                }
                return value;
            },
            userId: (value) => {
                if (typeof value === 'string') {
                    return (0, input_sanitizer_1.sanitizeString)(value, input_sanitizer_1.SanitizationPresets.API_PARAM);
                }
                return value;
            },
        },
    }),
};
exports.ManualSanitization = {
    formData: (data) => {
        return (0, input_sanitizer_1.sanitizeObject)(data, input_sanitizer_1.SanitizationPresets.FORM_INPUT);
    },
    apiResponse: (data) => {
        return (0, input_sanitizer_1.sanitizeObject)(data, input_sanitizer_1.SanitizationPresets.STRICT);
    },
    userProfile: (data) => {
        return (0, input_sanitizer_1.sanitizeObject)(data, {
            allowBasicFormatting: false,
            allowLinks: false,
            stripAllHtml: true,
        });
    },
    logMessage: (message) => {
        return (0, input_sanitizer_1.sanitizeString)(message, {
            stripAllHtml: true,
            allowBasicFormatting: false,
            allowLinks: false,
        }).replace(/[\r\n\t]/g, ' ');
    },
};
//# sourceMappingURL=sanitization.js.map