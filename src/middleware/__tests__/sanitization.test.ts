import { Request, Response, NextFunction } from 'express';
import { createSanitizationMiddleware, SanitizationMiddleware, ManualSanitization, SanitizationMiddlewareOptions } from '../sanitization';
import { SanitizationPresets } from '../../utils/input-sanitizer';

describe('Sanitization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

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
    (nextFunction as jest.Mock).mockClear();
  });

  describe('createSanitizationMiddleware', () => {
    it('should sanitize body, query, and params by default', () => {
      mockRequest.body = { name: '<script>alert("xss")</script>', email: ' test@test.com ' };
      mockRequest.query = { search: '  <p>search term</p>  ' };
      mockRequest.params = { id: '   123   ' };

      const middleware = createSanitizationMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.name).toBe('alert("xss")'); // Strips tags
      expect(mockRequest.body.email).toBe('test@test.com'); // Trims whitespace
      expect(mockRequest.query.search).toBe('&lt;p&gt;search term&lt;/p&gt;'); // Encodes HTML
      expect(mockRequest.params.id).toBe('123'); // Trims whitespace
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should use specified presets', () => {
        mockRequest.body = { content: '<b>Bold</b> and <i>italic</i>' };
        const middleware = createSanitizationMiddleware({ bodyOptions: SanitizationPresets.RICH_TEXT });
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockRequest.body.content).toBe('<b>Bold</b> and <i>italic</i>');
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should skip routes matching a pattern', () => {
        const specificMockRequest = {
            ...mockRequest,
            path: '/skip-me',
            body: { data: '<script>no</script>' }
        };

        const middleware = createSanitizationMiddleware({ skipRoutes: [/^\/skip-me/] });
        middleware(specificMockRequest as Request, mockResponse as Response, nextFunction);

        expect(specificMockRequest.body.data).toBe('<script>no</script>');
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should apply custom sanitizers', () => {
        mockRequest.body = { userId: '  user-123  ', value: 'a' };
        const middleware = createSanitizationMiddleware({
            customSanitizers: {
                userId: (val) => `sanitized-${val.trim()}`,
                value: (val) => val.toUpperCase(),
            }
        });
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.body.userId).toBe('sanitized-user-123');
        expect(mockRequest.body.value).toBe('A');
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
        mockRequest.body = { user: { name: '  <p>Test</p>  ' } };
        const middleware = createSanitizationMiddleware();
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.body.user.name).toBe('&lt;p&gt;Test&lt;/p&gt;');
        expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Pre-configured SanitizationMiddleware', () => {
    it('SanitizationMiddleware.apiParams should use strict sanitization', () => {
        mockRequest.body = { id: '<script>id</script>' };
        SanitizationMiddleware.apiParams(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockRequest.body.id).toBe('id');
    });

    it('SanitizationMiddleware.formInput should allow some HTML', () => {
        mockRequest.body = { comment: '<p>A nice comment.</p><script>bad</script>' };
        SanitizationMiddleware.formInput(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockRequest.body.comment).toBe('<p>A nice comment.</p>bad');
    });

    it('SanitizationMiddleware.richText should allow more formatting', () => {
        mockRequest.body = { article: '<b>Bold</b> <a href="http://example.com">link</a>' };
        SanitizationMiddleware.richText(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockRequest.body.article).toBe('<b>Bold</b> <a href="http://example.com" rel="noopener noreferrer">link</a>');
    });
  });

  describe('ManualSanitization', () => {
    it('ManualSanitization.formData should sanitize object', () => {
        const dirty = { name: '<p>Name</p>', email: ' email@example.com ' };
        const clean = ManualSanitization.formData(dirty);
        expect(clean.name).toBe('Name');
        expect(clean.email).toBe('email@example.com');
    });

    it('ManualSanitization.apiResponse should sanitize strictly', () => {
        const dirty = { data: '<b>Hello</b>' };
        const clean = ManualSanitization.apiResponse(dirty);
        expect(clean.data).toBe('Hello');
    });

    it('ManualSanitization.logMessage should strip HTML and newlines', () => {
        const dirty = 'Error: <script>oops</script>\nNew line';
        const clean = ManualSanitization.logMessage(dirty);
        expect(clean).toBe('Error: oops New line');
    });
  });
}); 