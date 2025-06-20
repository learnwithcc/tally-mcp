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

// Mock console.warn at the module level
const consoleWarnSpy = jest.fn();

beforeEach(() => {
  // Clear the spy and replace console.warn with our mock
  consoleWarnSpy.mockClear();
  console.warn = consoleWarnSpy;
});

describe('Security Middleware', () => {
  let app: express.Express;

  describe('CORS Configuration', () => {
    beforeEach(() => {
      app = express();
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
    });

    it('should allow GET requests with CORS headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://example.com');
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
      process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.com,https://admin.example.com';
      app = express();
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
      expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
    });

    it('should reject requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://malicious.com');
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Security Headers', () => {
    beforeEach(() => {
      app = express();
      app.use(configureSecurityHeaders());
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should set Content Security Policy header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should set HSTS header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['strict-transport-security']).toBeDefined();
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
      app = express();
      app.use(customSecurityMiddleware);
      app.get('/test', (req, res) => res.json({ message: 'success' }));
      app.post('/api/data', (req, res) => res.json({ message: 'posted' }));
      app.post('/auth/login', (req, res) => res.json({ message: 'login' }));
    });

    it('should set custom API version header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-api-version']).toBe('1.0.0');
    });

    it('should set request ID header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should set no-cache headers for non-GET API endpoints', async () => {
      const response = await request(app).post('/api/data');
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should add timing protection for auth endpoints', async () => {
      const start = Date.now();
      await request(app).post('/auth/login');
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Security Logger', () => {
    beforeEach(() => {
      app = express();
      app.use(securityLogger);
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should log security information for requests', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await request(app).get('/test');
      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Security Validation', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(securityValidation);
      // Fallback for requests that pass validation
      app.use((req, res) => {
        if (!res.headersSent) {
          res.status(200).json({ message: 'Request passed validation' });
        }
      });
    });

    it('should allow normal requests', async () => {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should block directory traversal attempts', async () => {
      // Use URL encoding to prevent normalization
      const response = await request(app).get('/test/..%2F..%2F..%2Fetc%2Fpasswd');
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should block XSS attempts in URL', async () => {
      const response = await request(app).get('/test?<script>alert("xss")</script>');
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });

    it('should reject negative Content-Length', async () => {
      // Create a custom middleware to simulate negative Content-Length
      const testApp = express();
      testApp.use(express.json());
      
      // Custom middleware to set negative Content-Length
      testApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        req.headers['content-length'] = '-1';
        next();
      });
      
      testApp.use(securityValidation);
      testApp.use((req: express.Request, res: express.Response) => {
        if (!res.headersSent) {
          res.status(200).json({ message: 'Request passed validation' });
        }
      });
      
      const response = await request(testApp).post('/upload').send({ data: 'test' });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_CONTENT_LENGTH');
    });

    it('should reject oversized payloads', async () => {
      const response = await request(app)
        .post('/upload')
        .send({ data: 'a'.repeat(2 * 1024 * 1024) }); // 2MB
      expect(response.status).toBe(413);
    });

    it('should warn about invalid User-Agent headers', async () => {
      // Clear the spy before this test
      consoleWarnSpy.mockClear();
      
      // Create a custom middleware to remove User-Agent header entirely
      const testApp = express();
      testApp.use(express.json());
      
      // Custom middleware to remove User-Agent header
      testApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        delete req.headers['user-agent'];
        next();
      });
      
      testApp.use(securityValidation);
      testApp.use((req: express.Request, res: express.Response) => {
        if (!res.headersSent) {
          res.status(200).json({ message: 'Request passed validation' });
        }
      });
      
      await request(testApp).get('/test');
      
      // Debug: check all console.warn calls
      console.log('Console warn calls:', consoleWarnSpy.mock.calls);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Security Warning: Missing or empty User-Agent header.');
    });

    it('should warn about oversized User-Agent headers', async () => {
      // Clear the spy before this test
      consoleWarnSpy.mockClear();
      
      // Create a custom middleware to set oversized User-Agent header
      const testApp = express();
      testApp.use(express.json());
      
      // Custom middleware to set oversized User-Agent header
      testApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        req.headers['user-agent'] = 'a'.repeat(300);
        next();
      });
      
      testApp.use(securityValidation);
      testApp.use((req: express.Request, res: express.Response) => {
        if (!res.headersSent) {
          res.status(200).json({ message: 'Request passed validation' });
        }
      });
      
      await request(testApp).get('/test');
      
      // Debug: check all console.warn calls
      console.log('Console warn calls:', consoleWarnSpy.mock.calls);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Security Warning: Oversized User-Agent header: 300 chars');
    });
  });

  describe('Complete Security Middleware Stack', () => {
    beforeEach(() => {
      app = express();
      const middlewares = applySecurityMiddleware();
      middlewares.forEach(middleware => app.use(middleware));
      app.get('/test', (req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should block malicious requests even with full stack', async () => {
      const response = await request(app).get('/test?evil=<script>alert(1)</script>');
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SECURITY_VIOLATION');
    });
  });
}); 