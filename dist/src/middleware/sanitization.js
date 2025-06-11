import { sanitizeObject, sanitizeString, SanitizationPresets } from '../utils/input-sanitizer';
const DEFAULT_OPTIONS = {
    bodyOptions: SanitizationPresets.FORM_INPUT,
    queryOptions: SanitizationPresets.API_PARAM,
    paramsOptions: SanitizationPresets.API_PARAM,
    skipRoutes: [],
    customSanitizers: {},
};
export function createSanitizationMiddleware(options = {}) {
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
    const sanitized = sanitizeObject(obj, options);
    for (const [fieldName, sanitizer] of Object.entries(customSanitizers)) {
        if (sanitized[fieldName] !== undefined) {
            sanitized[fieldName] = sanitizer(sanitized[fieldName]);
        }
    }
    return sanitized;
}
export const SanitizationMiddleware = {
    apiParams: createSanitizationMiddleware({
        bodyOptions: SanitizationPresets.API_PARAM,
        queryOptions: SanitizationPresets.API_PARAM,
        paramsOptions: SanitizationPresets.API_PARAM,
    }),
    formInput: createSanitizationMiddleware({
        bodyOptions: SanitizationPresets.FORM_INPUT,
        queryOptions: SanitizationPresets.API_PARAM,
        paramsOptions: SanitizationPresets.API_PARAM,
    }),
    richText: createSanitizationMiddleware({
        bodyOptions: SanitizationPresets.RICH_TEXT,
        queryOptions: SanitizationPresets.API_PARAM,
        paramsOptions: SanitizationPresets.API_PARAM,
    }),
    mcpTools: createSanitizationMiddleware({
        bodyOptions: SanitizationPresets.FORM_INPUT,
        queryOptions: SanitizationPresets.API_PARAM,
        paramsOptions: SanitizationPresets.API_PARAM,
        customSanitizers: {
            formId: (value) => {
                if (typeof value === 'string') {
                    return sanitizeString(value, SanitizationPresets.API_PARAM);
                }
                return value;
            },
            workspaceId: (value) => {
                if (typeof value === 'string') {
                    return sanitizeString(value, SanitizationPresets.API_PARAM);
                }
                return value;
            },
            userId: (value) => {
                if (typeof value === 'string') {
                    return sanitizeString(value, SanitizationPresets.API_PARAM);
                }
                return value;
            },
        },
    }),
};
export const ManualSanitization = {
    formData: (data) => {
        return sanitizeObject(data, SanitizationPresets.FORM_INPUT);
    },
    apiResponse: (data) => {
        return sanitizeObject(data, SanitizationPresets.STRICT);
    },
    userProfile: (data) => {
        return sanitizeObject(data, {
            allowBasicFormatting: false,
            allowLinks: false,
            stripAllHtml: true,
        });
    },
    logMessage: (message) => {
        return sanitizeString(message, {
            stripAllHtml: true,
            allowBasicFormatting: false,
            allowLinks: false,
        }).replace(/[\r\n\t]/g, ' ');
    },
};
//# sourceMappingURL=sanitization.js.map