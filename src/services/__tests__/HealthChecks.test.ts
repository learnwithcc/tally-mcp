import express from 'express';
import request from 'supertest';
import { MCPServer } from '../../server';

describe('Health and Metrics Endpoints', () => {
  let server: MCPServer;
  let app: express.Express;

  beforeAll((done) => {
    // Mock methods that are not relevant to these tests
    jest.spyOn(MCPServer.prototype as any, 'initializeTools').mockImplementation(() => {});
    jest.spyOn(MCPServer.prototype as any, 'setupMCPHandlers').mockImplementation(() => {});

    server = new MCPServer({
      port: 3001,
      debug: false,
    });

    server.on('ready', () => {
        app = (server as any).app;
        done();
    });
    
    server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
    jest.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK with status "ok" when the server is healthy', async () => {
      const originalIsHealthy = server.isHealthy;
      (server as any).isHealthy = jest.fn().mockReturnValue(true);

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');

      (server as any).isHealthy = originalIsHealthy;
    });

    it('should return 503 Service Unavailable when the server is unhealthy', async () => {
      const originalIsHealthy = server.isHealthy;
      (server as any).isHealthy = jest.fn().mockReturnValue(false);
      
      const response = await request(app).get('/health');
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');

      // Restore the original method
      (server as any).isHealthy = originalIsHealthy;
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