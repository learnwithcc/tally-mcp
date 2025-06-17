import DOMPurify from 'isomorphic-dompurify';
export function sanitize(input) {
    if (input === null || input === undefined) {
        return '';
    }
    let stringifiedInput = String(input);
    stringifiedInput = stringifiedInput.replace(/javascript:/gi, '');
    const sanitized = DOMPurify.sanitize(stringifiedInput, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
    });
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.hasAttribute('href')) {
            node.setAttribute('rel', 'noopener noreferrer');
            node.setAttribute('target', '_blank');
        }
    });
    const final = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });
    DOMPurify.removeHook('afterSanitizeAttributes');
    return final;
}
export function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const sanitizedObj = { ...obj };
    for (const key in sanitizedObj) {
        const value = sanitizedObj[key];
        if (typeof value === 'string') {
            sanitizedObj[key] = sanitize(value);
        }
        else if (typeof value === 'object') {
            sanitizedObj[key] = sanitizeObject(value);
        }
    }
    return sanitizedObj;
}
export function sanitizeArray(arr) {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr.map(item => {
        if (typeof item === 'string') {
            return sanitize(item);
        }
        if (typeof item === 'object' && item !== null) {
            return sanitizeObject(item);
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