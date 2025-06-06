import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration options for input sanitization
 */
export interface SanitizationOptions {
  /** Allow basic formatting tags like <b>, <i>, <u> */
  allowBasicFormatting?: boolean;
  /** Allow links */
  allowLinks?: boolean;
  /** Custom allowed tags */
  allowedTags?: string[];
  /** Custom allowed attributes */
  allowedAttributes?: string[];
  /** Strip all HTML completely */
  stripAllHtml?: boolean;
}

/**
 * Default sanitization configuration for strict security
 */
const DEFAULT_STRICT_CONFIG: SanitizationOptions = {
  allowBasicFormatting: false,
  allowLinks: false,
  stripAllHtml: true,
};

/**
 * Sanitizes a single string input to prevent XSS and injection attacks
 * 
 * @param input - The input string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeString(
  input: string, 
  options: SanitizationOptions = DEFAULT_STRICT_CONFIG
): string {
  if (typeof input !== 'string') {
    return '';
  }

  // If we want to strip all HTML, use a simple approach
  if (options.stripAllHtml) {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }

  // Configure DOMPurify based on options
  const config: any = {
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };

  if (options.allowedTags) {
    config.ALLOWED_TAGS = options.allowedTags;
  } else {
    const allowedTags: string[] = [];
    
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
  } else {
    const allowedAttrs: string[] = [];
    
    if (options.allowLinks) {
      allowedAttrs.push('href', 'title');
    }
    
    config.ALLOWED_ATTR = allowedAttrs;
  }

  return String(DOMPurify.sanitize(input, config));
}

/**
 * Sanitizes an object recursively, applying sanitization to all string values
 * 
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T, 
  options: SanitizationOptions = DEFAULT_STRICT_CONFIG
): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Record<string, any> = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeString(item, options)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item, options)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    }
  }

  return sanitized;
}

/**
 * Sanitizes array of strings
 * 
 * @param arr - Array to sanitize
 * @param options - Sanitization options
 * @returns Sanitized array
 */
export function sanitizeArray(
  arr: any[], 
  options: SanitizationOptions = DEFAULT_STRICT_CONFIG
): any[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map(item => {
    if (typeof item === 'string') {
      return sanitizeString(item, options);
    } else if (typeof item === 'object' && item !== null) {
      return sanitizeObject(item, options);
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
  STRICT: DEFAULT_STRICT_CONFIG,
  
  /** Form input sanitization - allows basic text formatting */
  FORM_INPUT: {
    allowBasicFormatting: true,
    allowLinks: false,
    stripAllHtml: false,
  } as SanitizationOptions,
  
  /** Rich text sanitization - allows formatting and links */
  RICH_TEXT: {
    allowBasicFormatting: true,
    allowLinks: true,
    stripAllHtml: false,
  } as SanitizationOptions,
  
  /** API parameter sanitization - very strict */
  API_PARAM: {
    stripAllHtml: true,
    allowBasicFormatting: false,
    allowLinks: false,
  } as SanitizationOptions,
} as const; 