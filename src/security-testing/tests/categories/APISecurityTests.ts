import { SecurityTest, SecurityTestCategory, SecurityTestResult } from '../../types';
import axios from 'axios';

export class APISecurityTests implements SecurityTestCategory {
  name = 'API Security';
  description = 'Tests for general API security';
  enabled = true;
  tests: SecurityTest[];
  private target: { baseUrl: string };

  constructor(target: { baseUrl: string }) {
    this.target = target;
    this.tests = [
      {
        id: 'API-001',
        name: 'Rate Limiting',
        description: 'Tests for rate limiting on API endpoints.',
        category: 'API Security',
        severity: 'high',
        tags: ['api', 'rate-limiting'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
            const requests = [];
            // The default rate limit is 100 requests per minute.
            // Sending 150 should trigger it.
            for (let i = 0; i < 150; i++) {
              requests.push(axios.post(`${this.target.baseUrl}/mcp`, {
                jsonrpc: '2.0',
                method: 'health_check',
                id: i + 1
              }));
            }
            await Promise.all(requests);

            // If we reach here, it means we sent 150 requests without getting a 429, which is a failure.
            throw new Error('Rate limiting is not enforced. All 150 requests succeeded.');

          } catch (error: any) {
            // We expect an error because we are sending more requests than the limit.
            // Promise.all rejects with the first error. We need to check if that error is a 429.
            if (axios.isAxiosError(error) && error.response?.status === 429) {
              return {
                id: 'API-001',
                name: 'Rate Limiting',
                suite: 'custom',
                status: 'passed',
                severity: 'high',
                description: 'Rate limiting is enforced correctly, received a 429 response.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'API Security', tags: ['api', 'rate-limiting'] }
              };
            }

            // If we are here, something else went wrong.
            return {
              id: 'API-001',
              name: 'Rate Limiting',
              suite: 'custom',
              status: 'failed',
              severity: 'high',
              description: `Rate limiting test failed unexpectedly. Expected a 429 response, but got: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'API Security', tags: ['api', 'rate-limiting'] }
            };
          }
        },
      },
    ];
  }
} 