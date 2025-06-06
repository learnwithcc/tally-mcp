import { 
  sanitizeString, 
  sanitizeObject, 
  sanitizeArray, 
  InputValidator, 
  SanitizationPresets 
} from '../input-sanitizer';

describe('Input Sanitization', () => {
  describe('sanitizeString', () => {
    it('should strip script tags by default', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const result = sanitizeString(malicious);
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<script>');
    });

    it('should remove javascript: protocols', () => {
      const malicious = '<a href="javascript:alert(\'xss\')">Click</a>';
      const result = sanitizeString(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });

    it('should strip event handlers', () => {
      const malicious = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeString(malicious);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should allow basic formatting when configured', () => {
      const input = '<b>Bold</b> and <i>italic</i> text';
      const result = sanitizeString(input, SanitizationPresets.FORM_INPUT);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>italic</i>');
    });

    it('should allow links when configured', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeString(input, SanitizationPresets.RICH_TEXT);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('<a');
    });

    it('should handle non-string input gracefully', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeString(123 as any)).toBe('');
    });

    it('should remove potentially dangerous iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>Normal text';
      const result = sanitizeString(malicious);
      expect(result).toBe('Normal text');
      expect(result).not.toContain('<iframe>');
    });

    it('should sanitize data attributes', () => {
      const malicious = '<div data-evil="alert(1)">Content</div>';
      const result = sanitizeString(malicious);
      expect(result).not.toContain('data-evil');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values in an object', () => {
      const input = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
        bio: '<b>Bold</b> description',
        age: 25,
      };
      
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.bio).toBe('Bold description'); // DOMPurify removes tags but keeps content
      expect(result.age).toBe(25);
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          profile: {
            name: '<script>alert("xss")</script>Jane',
            settings: {
              theme: 'dark',
              notifications: '<iframe>evil</iframe>enabled',
            },
          },
        },
      };
      
      const result = sanitizeObject(input);
      expect(result.user.profile.name).toBe('Jane');
      expect(result.user.profile.settings.notifications).toBe('enabled');
    });

    it('should handle arrays within objects', () => {
      const input = {
        tags: ['<script>evil</script>tag1', 'normal-tag', '<b>formatted</b>'],
        count: 3,
      };
      
      const result = sanitizeObject(input);
      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('normal-tag');
      expect(result.tags[2]).toBe('formatted');
    });

    it('should handle null and undefined values', () => {
      const input = {
        name: 'John',
        value: null,
        other: undefined,
      };
      
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.value).toBeNull();
      expect(result.other).toBeUndefined();
    });
  });

  describe('sanitizeArray', () => {
    it('should sanitize string elements in arrays', () => {
      const input = [
        '<script>alert("xss")</script>Hello',
        'normal string',
        '<b>formatted</b>',
        123,
        { name: '<script>evil</script>John' },
      ];
      
      const result = sanitizeArray(input);
      expect(result[0]).toBe('Hello');
      expect(result[1]).toBe('normal string');
      expect(result[2]).toBe('formatted');
      expect(result[3]).toBe(123);
      expect(result[4].name).toBe('John');
    });

    it('should handle non-array input', () => {
      const result = sanitizeArray(null as any);
      expect(result).toEqual([]);
    });
  });

  describe('InputValidator', () => {
    describe('isValidId', () => {
      it('should accept valid IDs', () => {
        expect(InputValidator.isValidId('user123')).toBe(true);
        expect(InputValidator.isValidId('form-id-456')).toBe(true);
        expect(InputValidator.isValidId('workspace_789')).toBe(true);
      });

      it('should reject invalid IDs', () => {
        expect(InputValidator.isValidId('user@123')).toBe(false);
        expect(InputValidator.isValidId('form id')).toBe(false);
        expect(InputValidator.isValidId('<script>alert(1)</script>')).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      it('should accept valid emails', () => {
        expect(InputValidator.isValidEmail('user@example.com')).toBe(true);
        expect(InputValidator.isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(InputValidator.isValidEmail('invalid-email')).toBe(false);
        expect(InputValidator.isValidEmail('user@')).toBe(false);
        expect(InputValidator.isValidEmail('<script>@evil.com')).toBe(false);
      });
    });

    describe('isValidUrl', () => {
      it('should accept valid URLs', () => {
        expect(InputValidator.isValidUrl('https://example.com')).toBe(true);
        expect(InputValidator.isValidUrl('http://localhost:3000')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(InputValidator.isValidUrl('javascript:alert(1)')).toBe(false);
        expect(InputValidator.isValidUrl('ftp://evil.com')).toBe(false);
        expect(InputValidator.isValidUrl('not-a-url')).toBe(false);
      });
    });

    describe('containsOnlySafeChars', () => {
      it('should accept safe text', () => {
        expect(InputValidator.containsOnlySafeChars('Hello World! How are you?')).toBe(true);
        expect(InputValidator.containsOnlySafeChars('User123 (admin)')).toBe(true);
      });

      it('should reject potentially dangerous characters', () => {
        expect(InputValidator.containsOnlySafeChars('<script>')).toBe(false);
        expect(InputValidator.containsOnlySafeChars('user@domain.com')).toBe(false);
      });
    });

    describe('containsSqlInjectionPatterns', () => {
      it('should detect SQL injection attempts', () => {
        expect(InputValidator.containsSqlInjectionPatterns('1 UNION SELECT * FROM users')).toBe(true);
        expect(InputValidator.containsSqlInjectionPatterns("'; DROP TABLE users; --")).toBe(true);
        expect(InputValidator.containsSqlInjectionPatterns('/* comment */ SELECT')).toBe(true);
      });

      it('should not flag normal text', () => {
        expect(InputValidator.containsSqlInjectionPatterns('normal text')).toBe(false);
        expect(InputValidator.containsSqlInjectionPatterns('user@example.com')).toBe(false);
      });
    });

    describe('containsXssPatterns', () => {
      it('should detect XSS attempts', () => {
        expect(InputValidator.containsXssPatterns('<script>alert(1)</script>')).toBe(true);
        expect(InputValidator.containsXssPatterns('javascript:alert(1)')).toBe(true);
        expect(InputValidator.containsXssPatterns('<div onclick="evil()">test</div>')).toBe(true);
        expect(InputValidator.containsXssPatterns('<iframe src="evil.com"></iframe>')).toBe(true);
      });

      it('should not flag normal HTML', () => {
        expect(InputValidator.containsXssPatterns('<p>Normal paragraph</p>')).toBe(false);
        expect(InputValidator.containsXssPatterns('<a href="https://example.com">Link</a>')).toBe(false);
      });
    });
  });

  describe('Edge Cases and Security Tests', () => {
    it('should handle unicode and special characters', () => {
      const input = 'Hello 世界 🌍 café résumé';
      const result = sanitizeString(input);
      expect(result).toContain('世界');
      expect(result).toContain('🌍');
      expect(result).toContain('café');
    });

    it('should prevent script injection through encoded characters', () => {
      const malicious = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitizeString(malicious);
      // DOMPurify keeps encoded text as-is since it's not parsed as HTML
      expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000) + '<script>alert(1)</script>';
      const result = sanitizeString(longString);
      expect(result).not.toContain('<script>');
      expect(result.length).toBeLessThan(longString.length);
    });

    it('should handle empty and whitespace-only strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('   ');
      expect(sanitizeString('\n\t\r')).toBe('\n\t\r');
    });

    it('should prevent style-based attacks', () => {
      const malicious = '<div style="background:url(javascript:alert(1))">test</div>';
      const result = sanitizeString(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });
  });

  describe('SanitizationPresets', () => {
    it('should have different levels of strictness', () => {
      const input = '<b>Bold</b> <a href="https://example.com">Link</a> <script>evil</script>';
      
      const strict = sanitizeString(input, SanitizationPresets.STRICT);
      const formInput = sanitizeString(input, SanitizationPresets.FORM_INPUT);
      const richText = sanitizeString(input, SanitizationPresets.RICH_TEXT);
      
      // Strict should strip everything
      expect(strict).not.toContain('<b>');
      expect(strict).not.toContain('<a>');
      
      // Form input should allow basic formatting
      expect(formInput).toContain('<b>');
      expect(formInput).not.toContain('href');
      
      // Rich text should allow both formatting and links
      expect(richText).toContain('<b>');
      expect(richText).toContain('href');
      
      // All should strip script tags
      expect(strict).not.toContain('<script>');
      expect(formInput).not.toContain('<script>');
      expect(richText).not.toContain('<script>');
    });
  });
}); 