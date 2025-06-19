import DOMPurify from 'isomorphic-dompurify';
export function sanitizeString(input, options = {}) {
    if (input === null || input === undefined) {
        return '';
    }
    let stringifiedInput = String(input);
    stringifiedInput = stringifiedInput.replace(/javascript:/gi, '');
    let allowedTags = options.allowedTags ?? [];
    if (options.allowBasicFormatting) {
        allowedTags = [...new Set([...allowedTags, 'b', 'i', 'u', 'strong', 'em', 'br', 'p'])];
    }
    if (options.allowLinks) {
        allowedTags = [...new Set([...allowedTags, 'a'])];
    }
    let allowedAttr = options.allowedAttr ?? [];
    if (options.allowLinks) {
        allowedAttr = [...new Set([...allowedAttr, 'href', 'title', 'target', 'rel'])];
    }
    const domPurifyOptions = {
        ALLOWED_TAGS: options.stripAllHtml ? [] : allowedTags,
        ALLOWED_ATTR: options.stripAllHtml ? [] : allowedAttr,
        ALLOW_DATA_ATTR: options.allowDataAttr ?? false,
        ALLOW_UNKNOWN_PROTOCOLS: options.allowUnknownProtocols ?? false,
    };
    const sanitized = DOMPurify.sanitize(stringifiedInput, domPurifyOptions);
    if (options.allowLinks) {
        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
            if (node.tagName === 'A' && node.hasAttribute('href')) {
                node.setAttribute('rel', 'noopener noreferrer');
                node.setAttribute('target', '_blank');
            }
        });
    }
    const final = DOMPurify.sanitize(sanitized, domPurifyOptions);
    if (options.allowLinks) {
        DOMPurify.removeHook('afterSanitizeAttributes');
    }
    return final;
}
export function sanitizeObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const sanitizedObj = { ...obj };
    for (const key in sanitizedObj) {
        const value = sanitizedObj[key];
        if (typeof value === 'string') {
            sanitizedObj[key] = sanitizeString(value, options);
        }
        else if (typeof value === 'object') {
            sanitizedObj[key] = sanitizeObject(value, options);
        }
    }
    return sanitizedObj;
}
export function sanitizeArray(arr, options = {}) {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr.map(item => {
        if (typeof item === 'string') {
            return sanitizeString(item, options);
        }
        if (typeof item === 'object' && item !== null) {
            return sanitizeObject(item, options);
        }
        return item;
    });
}
export class InputValidator {
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
export const SanitizationPresets = {
    STRICT: {
        allowBasicFormatting: false,
        allowLinks: false,
        stripAllHtml: true,
    },
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