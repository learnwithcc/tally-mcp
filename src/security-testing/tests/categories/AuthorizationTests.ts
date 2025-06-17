import { SecurityTest, SecurityTestCategory, SecurityTestResult } from '../../types';
import { apiKeyService } from '../../../services/api-key-service';
import axios from 'axios';
import { ApiKeyScope } from '../../../models/api-key';

export class AuthorizationTests implements SecurityTestCategory {
  name = 'Authorization Security Tests';
  description = 'Tests for authorization controls and permission enforcement';
  enabled = true;
  tests: SecurityTest[];
  private target: { baseUrl: string };

  constructor(target: { baseUrl: string }) {
    this.target = target;
    this.tests = [
      {
        id: 'AUTHZ-001',
        name: 'API Key Scope Violation',
        description: 'Ensures that an API key cannot access resources outside of its defined scopes.',
        category: 'Authorization',
        severity: 'high',
        tags: ['api', 'authz', 'scope'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
            // Create a key with a restrictive scope
            const apiKey = await apiKeyService.createApiKey({
              name: 'test-key-scope-violation',
              scopes: [ApiKeyScope.FORMS_READ],
            });

            // Attempt to perform a write operation
            await axios.post(
              `${this.target.baseUrl}/mcp`,
              { jsonrpc: '2.0', method: 'create_form', params: { name: 'New Form' }, id: '1' },
              { headers: { 'x-api-key': apiKey.key } }
            );
            
            throw new Error('Write operation succeeded with a read-only key.');
          } catch (error: any) {
            if (error.response && error.response.status === 403) {
              return {
                id: 'AUTHZ-001',
                name: 'API Key Scope Violation',
                suite: 'custom',
                status: 'passed',
                severity: 'high',
                description: 'Correctly blocked a write attempt with a read-only key.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'Authorization', tags: ['api', 'authz', 'scope'] }
              };
            }
            return {
              id: 'AUTHZ-001',
              name: 'API Key Scope Violation',
              suite: 'custom',
              status: 'failed',
              severity: 'high',
              description: `API call did not fail with 403 as expected: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'Authorization', tags: ['api', 'authz', 'scope'] }
            };
          }
        },
      },
      {
        id: 'AUTHZ-002',
        name: 'Read-Only API Key Write Attempt',
        description: 'Confirms that a key with only read permissions cannot perform write actions.',
        category: 'Authorization',
        severity: 'medium',
        tags: ['api', 'authz', 'read-only'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          try {
              const apiKey = await apiKeyService.createApiKey({
                  name: 'test-key-readonly-write',
                  scopes: [ApiKeyScope.FORMS_READ],
                });
      
                await axios.post(
                  `${this.target.baseUrl}/mcp`,
                  { jsonrpc: '2.0', method: 'create_form', params: { name: 'New Form' }, id: '1' },
                  { headers: { 'x-api-key': apiKey.key } }
                );
                throw new Error('Create form succeeded with a read-only key.');
          } catch (error: any) {
              if (error.response && error.response.status === 403) {
                  return {
                      id: 'AUTHZ-002',
                      name: 'Read-Only API Key Write Attempt',
                      suite: 'custom',
                      status: 'passed',
                      severity: 'medium',
                      description: 'Correctly prevented a write operation with a read-only key.',
                      duration: Date.now() - startTime,
                      timestamp: new Date(),
                      metadata: { category: 'Authorization', tags: ['api', 'authz', 'read-only'] }
                  };
              }
              return {
                  id: 'AUTHZ-002',
                  name: 'Read-Only API Key Write Attempt',
                  suite: 'custom',
                  status: 'failed',
                  severity: 'medium',
                  description: `Request did not fail as expected: ${error.message}`,
                  duration: Date.now() - startTime,
                  timestamp: new Date(),
                  metadata: { category: 'Authorization', tags: ['api', 'authz', 'read-only'] }
              };
          }
        }
      },
      {
          id: 'AUTHZ-003',
          name: 'Admin Scope Access Control',
          description: 'Ensures an admin-scoped key can perform administrative actions.',
          category: 'Authorization',
          severity: 'critical',
          tags: ['api', 'authz', 'admin'],
          execute: async (): Promise<SecurityTestResult> => {
              const startTime = Date.now();
              try {
                  const apiKey = await apiKeyService.createApiKey({
                      name: 'test-key-admin-access',
                      scopes: [ApiKeyScope.ADMIN],
                    });
          
                    const response = await axios.post(
                      `${this.target.baseUrl}/mcp`,
                      { jsonrpc: '2.0', method: 'list_tools', id: '1' },
                      { headers: { 'x-api-key': apiKey.key } }
                    );
                    
                    if (response.status === 200) {
                        return {
                            id: 'AUTHZ-003',
                            name: 'Admin Scope Access Control',
                            suite: 'custom',
                            status: 'passed',
                            severity: 'critical',
                            description: 'Admin-scoped key successfully accessed a protected endpoint.',
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: { category: 'Authorization', tags: ['api', 'authz', 'admin'] }
                        };
                    }
                    throw new Error(`Expected status 200 but got ${response.status}`);
              } catch (error: any) {
                  return {
                      id: 'AUTHZ-003',
                      name: 'Admin Scope Access Control',
                      suite: 'custom',
                      status: 'failed',
                      severity: 'critical',
                      description: `Admin action failed unexpectedly: ${error.message}`,
                      duration: Date.now() - startTime,
                      timestamp: new Date(),
                      metadata: { category: 'Authorization', tags: ['api', 'authz', 'admin'] }
                  };
              }
          }
      },
      {
        id: 'AUTHZ-004',
        name: 'List Forms Scope',
        description: 'Ensures that listing forms requires the FORMS_READ scope.',
        category: 'Authorization',
        severity: 'medium',
        tags: ['api', 'authz', 'scope'],
        execute: async (): Promise<SecurityTestResult> => {
            const startTime = Date.now();
            try {
              // Key with correct scope
              const readKey = await apiKeyService.createApiKey({
                name: 'test-key-forms-read',
                scopes: [ApiKeyScope.FORMS_READ],
              });

              const readResponse = await axios.post(
                `${this.target.baseUrl}/mcp`,
                { jsonrpc: '2.0', method: 'list_forms', id: '1' },
                { headers: { 'x-api-key': readKey.key } }
              );

              if (readResponse.status !== 200) {
                throw new Error(`Expected status 200 for read request, but got ${readResponse.status}`);
              }

              // Key without correct scope
              const noReadKey = await apiKeyService.createApiKey({
                name: 'test-key-no-forms-read',
                scopes: [ApiKeyScope.SUBMISSIONS_READ],
              });

              await axios.post(
                `${this.target.baseUrl}/mcp`,
                { jsonrpc: '2.0', method: 'list_forms', id: '1' },
                { headers: { 'x-api-key': noReadKey.key } }
              );

              throw new Error('List forms succeeded without the required scope.');
            } catch (error: any) {
              if (error.response && error.response.status === 403) {
                return {
                  id: 'AUTHZ-004',
                  name: 'List Forms Scope',
                  suite: 'custom',
                  status: 'passed',
                  severity: 'medium',
                  description: 'Correctly blocked list_forms without the required scope.',
                  duration: Date.now() - startTime,
                  timestamp: new Date(),
                  metadata: { category: 'Authorization', tags: ['api', 'authz', 'scope'] }
                };
              }
              return {
                id: 'AUTHZ-004',
                name: 'List Forms Scope',
                suite: 'custom',
                status: 'failed',
                severity: 'medium',
                description: `Request did not fail as expected: ${error.message}`,
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'Authorization', tags: ['api', 'authz', 'scope'] }
              };
            }
        }
      }
    ];
  }
} 