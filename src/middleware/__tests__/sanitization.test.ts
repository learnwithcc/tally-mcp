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
    it('should sanitize body, query, and params by default', async () => {
      const middleware = createSanitizationMiddleware();
      mockRequest.body = { 
        name: '<script>alert("xss")</script>',
        email: ' test@test.com ' // Note: whitespace is preserved by DOMPurify
      };
      mockRequest.query = { search: '<b>search term</b>' };
      mockRequest.params = { id: ' 123 ' }; // Note: whitespace is preserved

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.name).toBe(''); // Strips script tags completely
      expect(mockRequest.body.email).toBe(' test@test.com '); // Preserves whitespace as DOMPurify doesn't trim
      expect(mockRequest.query.search).toBe('search term'); // API_PARAM preset strips all HTML in query params
      expect(mockRequest.params.id).toBe(' 123 '); // Preserves whitespace
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should use specified presets', async () => {
      const middleware = createSanitizationMiddleware({
        bodyOptions: { stripAllHtml: true }
      });
      mockRequest.body = { content: '<b>bold text</b>' };

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.content).toBe('bold text'); // Strips all HTML when configured
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should skip routes matching a pattern', async () => {
      const middleware = createSanitizationMiddleware({
        skipRoutes: [/\/skip/]
      });
      const skipRequest = { ...mockRequest, path: '/skip' };
      skipRequest.body = { content: '<script>alert("xss")</script>' };

      middleware(skipRequest as Request, mockResponse as Response, nextFunction);

      expect(skipRequest.body.content).toBe('<script>alert("xss")</script>'); // No sanitization on skipped routes
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should apply custom sanitizers', async () => {
      const middleware = createSanitizationMiddleware({
        customSanitizers: {
          email: (value: string) => value.trim().toLowerCase()
        }
      });
      mockRequest.body = { email: ' TEST@EXAMPLE.COM ' };

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.email).toBe('test@example.com'); // Custom sanitizer applies trimming and lowercasing
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle nested objects', async () => {
        const middleware = createSanitizationMiddleware({
          bodyOptions: { stripAllHtml: true } // Use strict config to strip HTML
        });
        mockRequest.body = { 
          user: { 
            name: '  <p>Test</p>  ' 
          } 
        };

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.body.user.name).toBe('  Test  '); // Strips HTML but preserves whitespace
        expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Pre-configured SanitizationMiddleware', () => {
    it('SanitizationMiddleware.apiParams should use strict sanitization', async () => {
      mockRequest.body = { id: '<script>alert("xss")</script>', name: '<b>test</b>' };
      SanitizationMiddleware.apiParams(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.id).toBe(''); // Strips all HTML
      expect(mockRequest.body.name).toBe('test'); // Strips all HTML
    });

    it('SanitizationMiddleware.formInput should allow some HTML', async () => {
      mockRequest.body = { content: '<b>Bold</b> <script>alert("xss")</script>' };
      SanitizationMiddleware.formInput(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.content).toBe('<b>Bold</b> '); // Allows basic formatting, strips scripts
    });

    it('SanitizationMiddleware.richText should allow more formatting', async () => {
        mockRequest.body = { article: '<b>Bold</b> <a href="http://example.com">link</a>' };
        SanitizationMiddleware.richText(mockRequest as Request, mockResponse as Response, nextFunction);
        
        // DOMPurify adds security attributes to external links for safety
        expect(mockRequest.body.article).toBe('<b>Bold</b> <a href="http://example.com" rel="noopener noreferrer" target="_blank">link</a>');
    });
  });

  describe('ManualSanitization', () => {
    it('ManualSanitization.formData should sanitize object', async () => {
        const dirty = { name: '<p>Name</p>', email: ' email@example.com ' };
        const clean = ManualSanitization.formData(dirty);
        
        // FORM_INPUT preset allows paragraph tags, so they're not stripped
        expect(clean.name).toBe('<p>Name</p>'); 
        expect(clean.email).toBe(' email@example.com '); // Preserves whitespace
    });

    it('ManualSanitization.apiResponse should sanitize strictly', async () => {
      const dirty = { content: '<b>bold</b> <script>alert("xss")</script>' };
      const clean = ManualSanitization.apiResponse(dirty);
      expect(clean.content).toBe('bold '); // Strips all HTML including bold tags
    });

    it('ManualSanitization.logMessage should strip HTML and newlines', async () => {
      const dirty = 'Log message with <b>HTML</b>\nand\twhitespace';
      const clean = ManualSanitization.logMessage(dirty);
      expect(clean).toBe('Log message with HTML and whitespace'); // Strips HTML and normalizes whitespace
    });
  });
}); 