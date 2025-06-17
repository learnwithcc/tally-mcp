import { createSanitizationMiddleware, SanitizationMiddleware, ManualSanitization } from '../sanitization';
describe('Sanitization Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();
    beforeEach(() => {
        mockRequest = {
            body: {},
            query: {},
            params: {},
            path: '/test'
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction.mockClear();
    });
    describe('createSanitizationMiddleware', () => {
        it('should sanitize body, query, and params by default', async () => {
            const middleware = createSanitizationMiddleware();
            mockRequest.body = {
                name: '<script>alert("xss")</script>',
                email: ' test@test.com '
            };
            mockRequest.query = { search: '<b>search term</b>' };
            mockRequest.params = { id: ' 123 ' };
            middleware(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.name).toBe('');
            expect(mockRequest.body.email).toBe(' test@test.com ');
            expect(mockRequest.query.search).toBe('search term');
            expect(mockRequest.params.id).toBe(' 123 ');
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should use specified presets', async () => {
            const middleware = createSanitizationMiddleware({
                bodyOptions: { stripAllHtml: true }
            });
            mockRequest.body = { content: '<b>bold text</b>' };
            middleware(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.content).toBe('bold text');
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should skip routes matching a pattern', async () => {
            const middleware = createSanitizationMiddleware({
                skipRoutes: [/\/skip/]
            });
            const skipRequest = { ...mockRequest, path: '/skip' };
            skipRequest.body = { content: '<script>alert("xss")</script>' };
            middleware(skipRequest, mockResponse, nextFunction);
            expect(skipRequest.body.content).toBe('<script>alert("xss")</script>');
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should apply custom sanitizers', async () => {
            const middleware = createSanitizationMiddleware({
                customSanitizers: {
                    email: (value) => value.trim().toLowerCase()
                }
            });
            mockRequest.body = { email: ' TEST@EXAMPLE.COM ' };
            middleware(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.email).toBe('test@example.com');
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should handle nested objects', async () => {
            const middleware = createSanitizationMiddleware({
                bodyOptions: { stripAllHtml: true }
            });
            mockRequest.body = {
                user: {
                    name: '  <p>Test</p>  '
                }
            };
            middleware(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.user.name).toBe('  Test  ');
            expect(nextFunction).toHaveBeenCalled();
        });
    });
    describe('Pre-configured SanitizationMiddleware', () => {
        it('SanitizationMiddleware.apiParams should use strict sanitization', async () => {
            mockRequest.body = { id: '<script>alert("xss")</script>', name: '<b>test</b>' };
            SanitizationMiddleware.apiParams(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.id).toBe('');
            expect(mockRequest.body.name).toBe('test');
        });
        it('SanitizationMiddleware.formInput should allow some HTML', async () => {
            mockRequest.body = { content: '<b>Bold</b> <script>alert("xss")</script>' };
            SanitizationMiddleware.formInput(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.content).toBe('<b>Bold</b> ');
        });
        it('SanitizationMiddleware.richText should allow more formatting', async () => {
            mockRequest.body = { article: '<b>Bold</b> <a href="http://example.com">link</a>' };
            SanitizationMiddleware.richText(mockRequest, mockResponse, nextFunction);
            expect(mockRequest.body.article).toBe('<b>Bold</b> <a href="http://example.com">link</a>');
        });
    });
    describe('ManualSanitization', () => {
        it('ManualSanitization.formData should sanitize object', async () => {
            const dirty = { name: '<p>Name</p>', email: ' email@example.com ' };
            const clean = ManualSanitization.formData(dirty);
            expect(clean.name).toBe('<p>Name</p>');
            expect(clean.email).toBe(' email@example.com ');
        });
        it('ManualSanitization.apiResponse should sanitize strictly', async () => {
            const dirty = { content: '<b>bold</b> <script>alert("xss")</script>' };
            const clean = ManualSanitization.apiResponse(dirty);
            expect(clean.content).toBe('bold ');
        });
        it('ManualSanitization.logMessage should strip HTML and newlines', async () => {
            const dirty = 'Log message with <b>HTML</b>\nand\twhitespace';
            const clean = ManualSanitization.logMessage(dirty);
            expect(clean).toBe('Log message with HTML and whitespace');
        });
    });
});
//# sourceMappingURL=sanitization.test.js.map