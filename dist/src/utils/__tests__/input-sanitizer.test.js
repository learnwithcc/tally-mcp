import { sanitize, sanitizeObject, sanitizeArray } from '../input-sanitizer';
import { dangerousStrings, safeStrings } from './fixtures';
describe('Input Sanitization', () => {
    describe('sanitize', () => {
        test.each(Object.entries(dangerousStrings))('should remove or neutralize dangerous string: %s', (_, dangerousString) => {
            const sanitized = sanitize(dangerousString);
            expect(sanitized).not.toContain('<script');
            expect(sanitized).not.toContain('javascript:');
            expect(sanitized).not.toContain('onclick');
            expect(sanitized).not.toContain('onerror');
            expect(sanitized).toMatchSnapshot();
        });
        test.each(Object.entries(safeStrings))('should correctly handle safe string: %s', (_, safeString) => {
            const sanitized = sanitize(safeString);
            if (safeString.includes('<b>')) {
                expect(sanitized).toContain('<b>');
            }
            if (safeString.includes('<a>')) {
                expect(sanitized).toContain('<a href');
            }
            expect(sanitized).toMatchSnapshot();
        });
        it('should correctly handle non-string inputs', () => {
            expect(sanitize(null)).toBe('');
            expect(sanitize(undefined)).toBe('');
            expect(sanitize(123)).toBe('123');
            expect(sanitize({ a: 1 })).toBe('[object Object]');
        });
        it('should add security attributes to links', () => {
            const link = '<a href="https://example.com">Click</a>';
            const sanitized = sanitize(link);
            expect(sanitized).toContain('rel="noopener noreferrer"');
            expect(sanitized).toContain('target="_blank"');
            expect(sanitized).toMatchSnapshot();
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
            expect(sanitized).toMatchSnapshot();
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
            const sanitized = sanitizeArray(dirtyArray);
            expect(sanitized[0]).not.toContain('<script');
            expect(sanitized[1]).toContain('<a href');
            expect(sanitized[2].deep).not.toContain('javascript:');
            expect(sanitized).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=input-sanitizer.test.js.map