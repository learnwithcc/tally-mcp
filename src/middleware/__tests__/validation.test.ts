import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  createValidationMiddleware, 
  ValidationMiddleware, 
  CommonSchemas,
  validateWithSchema,
  createTypedValidator,
  formatValidationError 
} from '../validation';

// Mock Express objects
const mockRequest = (overrides: Partial<Request> = {}): Request => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ...overrides,
} as Request);

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('Validation Middleware', () => {
  describe('createValidationMiddleware', () => {
    it('should validate request body successfully', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      const middleware = createValidationMiddleware({ body: schema });
      const req = mockRequest({ body: { name: 'John', age: 25 } });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John', age: 25 });
    });

    it('should reject invalid request body', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      const middleware = createValidationMiddleware({ body: schema });
      const req = mockRequest({ body: { name: '', age: -1 } });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate query parameters', () => {
      const schema = z.object({
        page: z.coerce.number().min(1),
        limit: z.coerce.number().max(100),
      });

      const middleware = createValidationMiddleware({ query: schema });
      const req = mockRequest({ query: { page: '2', limit: '50' } });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ page: 2, limit: 50 });
    });

    it('should validate URL parameters', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      const middleware = createValidationMiddleware({ params: schema });
      const req = mockRequest({ 
        params: { id: '123e4567-e89b-12d3-a456-426614174000' } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate headers', () => {
      const schema = z.object({
        'x-api-key': z.string().min(10),
      });

      const middleware = createValidationMiddleware({ headers: schema });
      const req = mockRequest({ 
        headers: { 'x-api-key': 'valid-api-key-123' } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should perform security checks when enabled', () => {
      const middleware = createValidationMiddleware({ 
        securityChecks: true,
        body: z.object({ message: z.string() }),
      });
      
      const req = mockRequest({ 
        body: { message: '<script>alert("xss")</script>' } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should detect SQL injection patterns', () => {
      const middleware = createValidationMiddleware({ 
        securityChecks: true,
        body: z.object({ query: z.string() }),
      });
      
      const req = mockRequest({ 
        body: { query: "'; DROP TABLE users; --" } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              code: 'security_violation',
              message: expect.stringContaining('SQL injection'),
            }),
          ]),
        })
      );
    });

    it('should handle partial validation', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
        email: z.string().email(),
      });

      const middleware = createValidationMiddleware({ 
        body: schema,
        partial: true,
      });
      
      const req = mockRequest({ body: { name: 'John' } }); // Missing age and email
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John' });
    });

    it('should strip unknown fields when configured', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const middleware = createValidationMiddleware({ 
        body: schema,
        stripUnknown: true,
      });
      
      const req = mockRequest({ 
        body: { 
          name: 'John', 
          age: 25, 
          extraField: 'should be removed' 
        } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John', age: 25 });
      expect(req.body).not.toHaveProperty('extraField');
    });

    it('should handle validation errors gracefully', () => {
      const middleware = createValidationMiddleware({ 
        body: z.object({ name: z.string() }),
      });
      
      const req = mockRequest({ body: { name: 123 } }); // Wrong type
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('CommonSchemas', () => {
    describe('pagination', () => {
      it('should validate valid pagination parameters', () => {
        const data = { page: '2', limit: '50' };
        const result = CommonSchemas.pagination.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(2);
          expect(result.data.limit).toBe(50);
        }
      });

      it('should apply default values', () => {
        const data = {};
        const result = CommonSchemas.pagination.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
          expect(result.data.limit).toBe(20);
        }
      });

      it('should reject invalid pagination', () => {
        const data = { page: '0', limit: '200' };
        const result = CommonSchemas.pagination.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });

    describe('formId', () => {
      it('should validate valid form IDs', () => {
        const data = { formId: 'form-123' };
        const result = CommonSchemas.formId.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid form IDs', () => {
        const data = { formId: 'form@123' };
        const result = CommonSchemas.formId.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should reject empty form IDs', () => {
        const data = { formId: '' };
        const result = CommonSchemas.formId.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });

    describe('dateRange', () => {
      it('should validate valid date ranges', () => {
        const data = {
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2023-12-31T23:59:59Z',
        };
        const result = CommonSchemas.dateRange.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid date ranges', () => {
        const data = {
          startDate: '2023-12-31T23:59:59Z',
          endDate: '2023-01-01T00:00:00Z',
        };
        const result = CommonSchemas.dateRange.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });

    describe('search', () => {
      it('should validate safe search queries', () => {
        const data = { q: 'normal search query' };
        const result = CommonSchemas.search.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject SQL injection attempts', () => {
        const data = { q: "'; DROP TABLE users; --" };
        const result = CommonSchemas.search.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should reject XSS attempts', () => {
        const data = { q: '<script>alert("xss")</script>' };
        const result = CommonSchemas.search.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });

    describe('fileUpload', () => {
      it('should validate valid file uploads', () => {
        const data = {
          filename: 'document.pdf',
          mimetype: 'application/pdf',
          size: 1024 * 1024, // 1MB
        };
        const result = CommonSchemas.fileUpload.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject files that are too large', () => {
        const data = {
          filename: 'huge-file.zip',
          mimetype: 'application/zip',
          size: 100 * 1024 * 1024, // 100MB
        };
        const result = CommonSchemas.fileUpload.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should reject invalid MIME types', () => {
        const data = {
          filename: 'file.txt',
          mimetype: 'invalid-mime-type',
          size: 1024,
        };
        const result = CommonSchemas.fileUpload.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('ValidationMiddleware presets', () => {
    it('should validate pagination middleware', () => {
      const req = mockRequest({ query: { page: '2', limit: '50' } });
      const res = mockResponse();
      const next = mockNext();

      ValidationMiddleware.pagination(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ page: 2, limit: 50 });
    });

    it('should validate form params middleware', () => {
      const req = mockRequest({ params: { formId: 'form-123' } });
      const res = mockResponse();
      const next = mockNext();

      ValidationMiddleware.formParams(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate search middleware', () => {
      const req = mockRequest({ query: { q: 'safe search' } });
      const res = mockResponse();
      const next = mockNext();

      ValidationMiddleware.search(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject malicious search queries', () => {
      const req = mockRequest({ query: { q: '<script>alert(1)</script>' } });
      const res = mockResponse();
      const next = mockNext();

      ValidationMiddleware.search(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Helper functions', () => {
    describe('validateWithSchema', () => {
      it('should validate data successfully', () => {
        const schema = z.object({ name: z.string() });
        const data = { name: 'John' };
        
        const result = validateWithSchema(data, schema);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({ name: 'John' });
        }
      });

      it('should return errors for invalid data', () => {
        const schema = z.object({ name: z.string() });
        const data = { name: 123 };
        
        const result = validateWithSchema(data, schema);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveLength(1);
        }
      });
    });

    describe('createTypedValidator', () => {
      it('should create a type guard function', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        const validator = createTypedValidator(schema);
        
        expect(validator({ name: 'John', age: 25 })).toBe(true);
        expect(validator({ name: 'John' })).toBe(false);
        expect(validator({ name: 123, age: 25 })).toBe(false);
      });
    });

    describe('formatValidationError', () => {
      it('should format validation errors correctly', () => {
        const errors = [
          {
            field: 'body.name',
            message: 'String must contain at least 1 character(s)',
            code: 'too_small',
            value: '',
          },
          {
            field: 'body.age',
            message: 'Number must be greater than or equal to 0',
            code: 'too_small',
            value: -1,
          },
        ];
        
        const formatted = formatValidationError(errors);
        
        expect(formatted).toEqual({
          error: 'Validation failed',
          message: 'The provided data is invalid',
          details: [
            {
              field: 'body.name',
              message: 'String must contain at least 1 character(s)',
              code: 'too_small',
            },
            {
              field: 'body.age',
              message: 'Number must be greater than or equal to 0',
              code: 'too_small',
            },
          ],
        });
      });
    });
  });

  describe('Security Features', () => {
    it('should detect and block length-based attacks', () => {
      const middleware = createValidationMiddleware({ 
        securityChecks: true,
        body: z.object({ message: z.string() }),
      });
      
      const longString = 'a'.repeat(15000); // Exceeds 10000 char limit
      const req = mockRequest({ body: { message: longString } });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              code: 'length_violation',
            }),
          ]),
        })
      );
    });

    it('should handle nested object security checks', () => {
      const middleware = createValidationMiddleware({ 
        securityChecks: true,
        body: z.object({ 
          user: z.object({ 
            profile: z.object({ 
              bio: z.string() 
            }) 
          }) 
        }),
      });
      
      const req = mockRequest({ 
        body: { 
          user: { 
            profile: { 
              bio: '<script>alert("nested xss")</script>' 
            } 
          } 
        } 
      });
      const res = mockResponse();
      const next = mockNext();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
}); 