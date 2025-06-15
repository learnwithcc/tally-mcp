import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string to prevent XSS attacks.
 * It allows a safe subset of HTML tags for basic formatting.
 *
 * @param input The string or other value to sanitize.
 * @returns A sanitized string.
 */
export function sanitize(input: any): string {
  if (input === null || input === undefined) {
    return '';
  }
  let stringifiedInput = String(input);

  // Manually remove javascript protocol to be safe
  stringifiedInput = stringifiedInput.replace(/javascript:/gi, '');

  const sanitized = DOMPurify.sanitize(stringifiedInput, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  // Add a hook to enforce secure links
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

/**
 * Recursively sanitizes an object by applying the `sanitize` function to all its string values.
 *
 * @param obj The object to sanitize.
 * @returns A new object with all string values sanitized.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitizedObj = { ...obj };

  for (const key in sanitizedObj) {
    const value = sanitizedObj[key];
    if (typeof value === 'string') {
      sanitizedObj[key] = sanitize(value) as T[Extract<keyof T, string>];
    } else if (typeof value === 'object') {
      sanitizedObj[key] = sanitizeObject(value);
    }
  }

  return sanitizedObj;
}

/**
 * Sanitizes an array by applying sanitization to its elements.
 *
 * @param arr The array to sanitize.
 * @returns A new array with sanitized elements.
 */
export function sanitizeArray(arr: any[]): any[] {
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

/**
 * Validates that a string contains only safe characters for specific use cases
 */
export class InputValidator {
  /**
   * Validates that a string is safe for use as an ID (alphanumeric + hyphens/underscores)
   */
  static isValidId(input: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(input);
  }

  /**
   * Validates that a string is a safe email format
   */
  static isValidEmail(input: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(input);
  }

  /**
   * Validates that a string is safe for use as a URL
   */
  static isValidUrl(input: string): boolean {
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validates that a string contains no potentially dangerous characters
   */
  static containsOnlySafeChars(input: string): boolean {
    // Allow letters, numbers, spaces, and basic punctuation
    return /^[a-zA-Z0-9\s.,!?;:()\-_"']+$/.test(input);
  }

  /**
   * Checks if string contains potential SQL injection patterns
   */
  static containsSqlInjectionPatterns(input: string): boolean {
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

  /**
   * Checks if string contains potential XSS patterns
   */
  static containsXssPatterns(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onload, etc.
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /vbscript:/i,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }
}

/**
 * Sanitization presets for different use cases
 */
export const SanitizationPresets = {
  /** Strict sanitization - strips all HTML and special characters */
  STRICT: {
    allowBasicFormatting: false,
    allowLinks: false,
    stripAllHtml: true,
  },
  
  /** Form input sanitization - allows basic text formatting */
  FORM_INPUT: {
    allowBasicFormatting: true,
    allowLinks: false,
    stripAllHtml: false,
  },
  
  /** Rich text sanitization - allows formatting and links */
  RICH_TEXT: {
    allowBasicFormatting: true,
    allowLinks: true,
    stripAllHtml: false,
  },
  
  /** API parameter sanitization - very strict */
  API_PARAM: {
    stripAllHtml: true,
    allowBasicFormatting: false,
    allowLinks: false,
  },
} as const; 