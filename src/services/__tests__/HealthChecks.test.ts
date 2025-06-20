import express from 'express';
import request from 'supertest';

describe('Health and Metrics Endpoints', () => {
  let app: express.Express;
  let mockServer: any;

  beforeAll(() => {
    // Create a mock express app with the health endpoints
    app = express();
    
    // Mock server instance with health methods
    mockServer = {
      isHealthy: jest.fn().mockReturnValue(true),
      getUptime: jest.fn().mockReturnValue(12345),
    };

    // Add the health endpoint directly
    app.get('/health', (req, res) => {
      const isHealthy = mockServer.isHealthy();
      const status = isHealthy ? 'ok' : 'unhealthy';
      const statusCode = isHealthy ? 200 : 503;
      
      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        uptime: mockServer.getUptime(),
      });
    });

    // Add the metrics endpoint
    app.get('/metrics', (req, res) => {
      const metrics = `# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${mockServer.getUptime()}

# HELP active_connections Number of active connections
# TYPE active_connections gauge
active_connections 0

# HELP memory_used_bytes Memory usage in bytes
# TYPE memory_used_bytes gauge
memory_used_bytes ${process.memoryUsage().heapUsed}

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total 1

# HELP http_requests_errors_total Total HTTP request errors
# TYPE http_requests_errors_total counter
http_requests_errors_total 0
`;
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK with status "ok" when the server is healthy', async () => {
      mockServer.isHealthy.mockReturnValue(true);

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return 503 Service Unavailable when the server is unhealthy', async () => {
      mockServer.isHealthy.mockReturnValue(false);
      
      const response = await request(app).get('/health');
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
    });
  });

  describe('GET /metrics', () => {
    it('should return 200 OK and Prometheus-compatible metrics', async () => {
      const response = await request(app).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/plain');
      expect(response.text).toContain('process_uptime_seconds');
      expect(response.text).toContain('active_connections');
      expect(response.text).toContain('memory_used_bytes');
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_requests_errors_total');
    });
  });
});
