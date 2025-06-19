import { SecurityTest, SecurityTestCategory, SecurityTestResult } from '../../types';
import axios from 'axios';

export class HTTPHeaderTests implements SecurityTestCategory {
  name = 'HTTP Header Tests';
  description = 'Tests for secure HTTP headers';
  enabled = true;
  tests: SecurityTest[];
  private target: { baseUrl: string };

  constructor(target: { baseUrl: string }) {
    this.target = target;
    this.tests = [
      {
        id: 'HTTP-001',
        name: 'Strict-Transport-Security Header',
        description: 'Checks for the presence of the HSTS header.',
        category: 'HTTP Headers',
        severity: 'medium',
        tags: ['http', 'headers'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
            const response = await axios.get(this.target.baseUrl);
            const hstsHeader = response.headers['strict-transport-security'];
            if (hstsHeader && hstsHeader.includes('max-age')) {
              return {
                id: 'HTTP-001',
                name: 'Strict-Transport-Security Header',
                suite: 'custom',
                status: 'passed',
                severity: 'medium',
                description: 'HSTS header is present and correctly configured.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
              };
            }
            throw new Error('HSTS header is missing or invalid.');
          } catch (error: any) {
            return {
              id: 'HTTP-001',
              name: 'Strict-Transport-Security Header',
              suite: 'custom',
              status: 'failed',
              severity: 'medium',
              description: `HSTS header test failed: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
            };
          }
        },
      },
      {
        id: 'HTTP-002',
        name: 'X-Frame-Options Header',
        description: 'Checks for the presence of the X-Frame-Options header.',
        category: 'HTTP Headers',
        severity: 'medium',
        tags: ['http', 'headers'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
            const response = await axios.get(this.target.baseUrl);
            const header = response.headers['x-frame-options'];
            if (header && header.toLowerCase() === 'deny') {
              return {
                id: 'HTTP-002',
                name: 'X-Frame-Options Header',
                suite: 'custom',
                status: 'passed',
                severity: 'medium',
                description: 'X-Frame-Options header is present and set to DENY.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
              };
            }
            throw new Error('X-Frame-Options header is missing or invalid.');
          } catch (error: any) {
            return {
              id: 'HTTP-002',
              name: 'X-Frame-Options Header',
              suite: 'custom',
              status: 'failed',
              severity: 'medium',
              description: `X-Frame-Options test failed: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
            };
          }
        },
      },
      {
        id: 'HTTP-003',
        name: 'X-Content-Type-Options Header',
        description: 'Checks for the presence of the X-Content-Type-Options header.',
        category: 'HTTP Headers',
        severity: 'medium',
        tags: ['http', 'headers'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
            const response = await axios.get(this.target.baseUrl);
            const header = response.headers['x-content-type-options'];
            if (header && header.toLowerCase() === 'nosniff') {
              return {
                id: 'HTTP-003',
                name: 'X-Content-Type-Options Header',
                suite: 'custom',
                status: 'passed',
                severity: 'medium',
                description: 'X-Content-Type-Options header is present and set to nosniff.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
              };
            }
            throw new Error('X-Content-Type-Options header is missing or invalid.');
          } catch (error: any) {
            return {
              id: 'HTTP-003',
              name: 'X-Content-Type-Options Header',
              suite: 'custom',
              status: 'failed',
              severity: 'medium',
              description: `X-Content-Type-Options test failed: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'HTTP Headers', tags: ['http', 'headers'] }
            };
          }
        },
      },
    ];
  }
} 