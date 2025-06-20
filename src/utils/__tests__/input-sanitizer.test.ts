import { sanitizeString, sanitizeObject, sanitizeArray } from '../input-sanitizer';
import { dangerousStrings, safeStrings } from './fixtures';

describe('Input Sanitization', () => {
  describe('sanitizeString', () => {
    test.each(Object.entries(dangerousStrings))(
      'should remove or neutralize dangerous string: %s',
      (_, dangerousString) => {
        const sanitized = sanitizeString(dangerousString);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('onerror');
      },
    );

    test.each(Object.entries(safeStrings))(
        'should correctly handle safe string: %s',
        (_, safeString) => {
            const sanitized = sanitizeString(safeString, { allowBasicFormatting: true, allowLinks: true });
            // It should not strip allowed tags
            if (safeString.includes('<b>')) {
                expect(sanitized).toContain('<b>');
            }
            if (safeString.includes('<a>')) {
                expect(sanitized).toContain('<a href');
            }
        }
    );

    it('should correctly handle non-string inputs', () => {
        expect(sanitizeString(null)).toBe('');
        expect(sanitizeString(undefined)).toBe('');
        expect(sanitizeString(123)).toBe('123');
        expect(sanitizeString({a: 1})).toBe('[object Object]');
    });

    it('should add security attributes to links', () => {
      const link = '<a href="https://example.com">Click</a>';
      const sanitized = sanitizeString(link, { allowLinks: true });
      expect(sanitized).toContain('rel="noopener noreferrer"');
      expect(sanitized).toContain('target="_blank"');
    });
  });

  describe('sanitizeObject', () => {
    it('should recursively sanitize all string values in an object', () => {
      const dirtyObject = {
        name: dangerousStrings.scriptTag,
        details: {
          description: safeStrings.withFormatting,
          link: dangerousStrings.eventHandler,
        },
        tags: [safeStrings.plainText, dangerousStrings.iframeTag],
        meta: null,
        count: 1,
      };
      const sanitized = sanitizeObject(dirtyObject);
      expect(sanitized.name).not.toContain('<script');
      expect(sanitized.details.link).not.toContain('onclick');
      expect(sanitized.tags[1]).not.toContain('<iframe');
    });
  });

  describe('sanitizeArray', () => {
    it('should recursively sanitize all elements in an array', () => {
      const dirtyArray = [
        dangerousStrings.scriptTag,
        safeStrings.withLinks,
        {
          deep: dangerousStrings.javascriptProtocol,
        },
        123,
        null
      ];
      const sanitized = sanitizeArray(dirtyArray, { allowLinks: true, allowBasicFormatting: true });
      expect(sanitized[0]).not.toContain('<script');
      expect(sanitized[1]).toContain('<a href');
      expect((sanitized[2] as any).deep).not.toContain('javascript:');
    });
  });
}); 