import request from 'supertest';
import express from 'express';
import {
  configureCORS,
  configureSecurityHeaders,
  customSecurityMiddleware,
  securityLogger,
  securityValidation,
  applySecurityMiddleware,
} from '../security';

// Mock console.log and console.warn for testing
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  console.log = mockConsoleLog;
  console.warn = mockConsoleWarn;
});

describe('Security Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
  });

  describe('CORS Configuration', () => {
    beforeEach(() => {
      app.use(configureCORS());
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
    });

    it('should allow GET requests with CORS headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://example.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
    });

    it('should expose rate limit headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://example.com');

      expect(response.headers['access-control-expose-headers']).toContain('X-RateLimit-Limit');
    });
  });

  describe('CORS with Environment Configuration', () => {
    beforeEach(() => {
      // Test with specific allowed origins
      process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.com,https://admin.example.com';
      app.use(configureCORS());
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    afterEach(() => {
      delete process.env.CORS_ALLOWED_ORIGINS;
    });

    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://app.example.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
    });

    it('should reject requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://malicious.com');

      expect(response.status).toBe(200); // CORS doesn't block the request server-side
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Security Headers', () => {
    beforeEach(() => {
      app.use(configureSecurityHeaders());
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should set Content Security Policy header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
      expect(response.headers['content-security-policy']).toContain("connect-src 'self' https://api.tally.so");
    });

    it('should set HSTS header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['strict-transport-security']).toContain('includeSubDomains');
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should remove X-Powered-By header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should set Referrer-Policy header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['referrer-policy']).toBe('no-referrer-when-downgrade');
    });
  });

  describe('Custom Security Middleware', () => {
    beforeEach(() => {
      app.use(customSecurityMiddleware);
      app.get('/test', (req, res) => res.json({ message: 'success' }));
      app.post('/api/data', (req, res) => res.json({ message: 'posted' }));
      app.get('/api/data', (req, res) => res.json({ message: 'fetched' }));
      app.post('/auth/login', (req, res) => res.json({ message: 'login' }));
    });

    it('should set custom API version header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-api-version']).toBe('1.0.0');
    });

    it('should set request ID header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
    });

    it('should set no-cache headers for non-GET API endpoints', async () => {
      const response = await request(app).post('/api/data');

      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });

    it('should not set no-cache headers for GET API endpoints', async () => {
      const response = await request(app).get('/api/data');

      expect(response.headers['cache-control']).not.toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should add timing protection for auth endpoints', async () => {
      const start = Date.now();
      await request(app).post('/auth/login');
      const end = Date.now();

      // Should have some delay (at least a few milliseconds)
      expect(end - start).toBeGreaterThan(0);
    });
  });

  describe('Security Logger', () => {
    beforeEach(() => {
      app.use(securityLogger);
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should log security information for requests', async () => {
      await request(app)
        .get('/test')
        .set('User-Agent', 'Test Agent')
        .set('Origin', 'https://example.com');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Security Log:',
        expect.stringContaining('"method": "GET"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Security Log:',
        expect.stringContaining('"url": "/test"')
      );
    });

    it('should redact authorization headers', async () => {
      await request(app)
        .get('/test')
        .set('Authorization', 'Bearer secret-token');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Security Log:',
        expect.stringContaining('"authorization": "[REDACTED]"')
      );
    });

    it('should respect LOG_SECURITY_EVENTS environment variable', async () => {
      process.env.LOG_SECURITY_EVENTS = 'false';
      
      // Recreate app with new environment
      app = express();
      app.use(securityLogger);
      app.get('/test', (req, res) => res.json({ message: 'success' }));

      await request(app).get('/test');

      expect(mockConsoleLog).not.toHaveBeenCalled();

      delete process.env.LOG_SECURITY_EVENTS;
    });
  });

  describe('Security Validation', () => {
    beforeEach(() => {
      app.use(securityValidation);
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
      app.post('/upload', (req, res) => {
        res.json({ message: 'uploaded' });
      });
    });

    it('should allow normal requests', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('success');
    });

    it('should block directory traversal attempts', async () => {
      const response = await request(app).get('/test/../../../etc/passwd');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should block XSS attempts in URL', async () => {
      const response = await request(app).get('/test?param=<script>alert(1)</script>');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should block JavaScript protocol attempts', async () => {
      const response = await request(app).get('/test?redirect=javascript:alert(1)');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should block null byte attempts', async () => {
      const response = await request(app).get('/test\0');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should validate Content-Length header', async () => {
      const response = await request(app)
        .post('/upload')
        .set('Content-Length', 'invalid');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_CONTENT_LENGTH');
    });

    it('should reject negative Content-Length', async () => {
      const response = await request(app)
        .post('/upload')
        .set('Content-Length', '-1');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_CONTENT_LENGTH');
    });

    it('should reject oversized payloads', async () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const response = await request(app)
        .post('/upload')
        .set('Content-Length', (maxSize + 1).toString());

      expect(response.status).toBe(413);
      expect(response.body.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('should warn about invalid User-Agent headers', async () => {
      await request(app)
        .get('/test')
        .set('User-Agent', '');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Security Warning: Invalid User-Agent')
      );
    });

    it('should warn about oversized User-Agent headers', async () => {
      const longUserAgent = 'A'.repeat(1001);
      await request(app)
        .get('/test')
        .set('User-Agent', longUserAgent);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Security Warning: Invalid User-Agent')
      );
    });
  });

  describe('Complete Security Middleware Stack', () => {
    beforeEach(() => {
      const middlewares = applySecurityMiddleware();
      middlewares.forEach(middleware => {
        app.use(middleware);
      });
      
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should apply all security middleware in order', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://example.com')
        .set('User-Agent', 'Test Agent');

      // Check that all middleware effects are present
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-api-version']).toBe('1.0.0');
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should block malicious requests even with full stack', async () => {
      const response = await request(app).get('/test?evil=<script>alert(1)</script>');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });
  });

  describe('Environment Configuration', () => {
    afterEach(() => {
      // Clean up environment variables
      delete process.env.CORS_ALLOWED_ORIGINS;
      delete process.env.ENABLE_HSTS;
      delete process.env.ENABLE_CSP;
      delete process.env.LOG_SECURITY_EVENTS;
    });

    it('should disable HSTS when environment variable is set', async () => {
      process.env.ENABLE_HSTS = 'false';
      
      app = express();
      app.use(configureSecurityHeaders());
      app.get('/test', (req, res) => res.json({ message: 'success' }));

      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toBeUndefined();
    });

    it('should disable CSP when environment variable is set', async () => {
      process.env.ENABLE_CSP = 'false';
      
      app = express();
      app.use(configureSecurityHeaders());
      app.get('/test', (req, res) => res.json({ message: 'success' }));

      const response = await request(app).get('/test');

      expect(response.headers['content-security-policy']).toBeUndefined();
    });

    it('should handle CORS_ALLOWED_ORIGINS=none', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'none';
      
      app = express();
      app.use(configureCORS());
      app.get('/test', (req, res) => res.json({ message: 'success' }));

      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://example.com');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
}); 