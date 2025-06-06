"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationPresets = exports.InputValidator = void 0;
exports.sanitizeString = sanitizeString;
exports.sanitizeObject = sanitizeObject;
exports.sanitizeArray = sanitizeArray;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const DEFAULT_STRICT_CONFIG = {
    allowBasicFormatting: false,
    allowLinks: false,
    stripAllHtml: true,
};
function sanitizeString(input, options = DEFAULT_STRICT_CONFIG) {
    if (typeof input !== 'string') {
        return '';
    }
    if (options.stripAllHtml) {
        return isomorphic_dompurify_1.default.sanitize(input, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
        });
    }
    const config = {
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
    };
    if (options.allowedTags) {
        config.ALLOWED_TAGS = options.allowedTags;
    }
    else {
        const allowedTags = [];
        if (options.allowBasicFormatting) {
            allowedTags.push('b', 'i', 'u', 'strong', 'em', 'br', 'p');
        }
        if (options.allowLinks) {
            allowedTags.push('a');
        }
        config.ALLOWED_TAGS = allowedTags;
    }
    if (options.allowedAttributes) {
        config.ALLOWED_ATTR = options.allowedAttributes;
    }
    else {
        const allowedAttrs = [];
        if (options.allowLinks) {
            allowedAttrs.push('href', 'title');
        }
        config.ALLOWED_ATTR = allowedAttrs;
    }
    return String(isomorphic_dompurify_1.default.sanitize(input, config));
}
function sanitizeObject(obj, options = DEFAULT_STRICT_CONFIG) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const sanitized = { ...obj };
    for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value, options);
        }
        else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => typeof item === 'string'
                ? sanitizeString(item, options)
                : typeof item === 'object' && item !== null
                    ? sanitizeObject(item, options)
                    : item);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, options);
        }
    }
    return sanitized;
}
function sanitizeArray(arr, options = DEFAULT_STRICT_CONFIG) {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr.map(item => {
        if (typeof item === 'string') {
            return sanitizeString(item, options);
        }
        else if (typeof item === 'object' && item !== null) {
            return sanitizeObject(item, options);
        }
        return item;
    });
}
class InputValidator {
    static isValidId(input) {
        return /^[a-zA-Z0-9_-]+$/.test(input);
    }
    static isValidEmail(input) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(input);
    }
    static isValidUrl(input) {
        try {
            const url = new URL(input);
            return ['http:', 'https:'].includes(url.protocol);
        }
        catch {
            return false;
        }
    }
    static containsOnlySafeChars(input) {
        return /^[a-zA-Z0-9\s.,!?;:()\-_"']+$/.test(input);
    }
    static containsSqlInjectionPatterns(input) {
        const sqlPatterns = [
            /union\s+select/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+.*\s+set/i,
            /drop\s+table/i,
            /--/,
            /\/\*/,
            /\*\//,
            /;\s*$/,
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
    }
    static containsXssPatterns(input) {
        const xssPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /vbscript:/i,
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }
}
exports.InputValidator = InputValidator;
exports.SanitizationPresets = {
    STRICT: DEFAULT_STRICT_CONFIG,
    FORM_INPUT: {
        allowBasicFormatting: true,
        allowLinks: false,
        stripAllHtml: false,
    },
    RICH_TEXT: {
        allowBasicFormatting: true,
        allowLinks: true,
        stripAllHtml: false,
    },
    API_PARAM: {
        stripAllHtml: true,
        allowBasicFormatting: false,
        allowLinks: false,
    },
};
//# sourceMappingURL=input-sanitizer.js.map