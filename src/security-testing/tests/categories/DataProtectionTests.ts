import { SecurityTest, SecurityTestCategory, SecurityTestResult } from '../../types';
import { apiKeyService } from '../../../services/api-key-service';
import { ApiKeyScope } from '../../../models/api-key';
import axios from 'axios';

export class DataProtectionTests implements SecurityTestCategory {
  name = 'Data Protection';
  description = 'Tests for data protection and privacy';
  enabled = true;
  tests: SecurityTest[];
  private target: { baseUrl: string };

  constructor(target: { baseUrl: string }) {
    this.target = target;
    this.tests = [
      {
        id: 'DP-001',
        name: 'PII Exposure in Error Messages',
        description: 'Tests for exposure of Personally Identifiable Information (PII) in error messages when access is denied.',
        category: 'Data Protection',
        severity: 'critical',
        tags: ['api', 'pii', 'privacy', 'error-handling'],
        execute: async (): Promise<SecurityTestResult> => {
          const startTime = Date.now();
          const piiTitle = "John Doe's Secret Medical Form";
          let formId = '';

          try {
            // 1. Create user with permission to create forms
            const creatorApiKey = await apiKeyService.createApiKey({
              name: 'pii-test-creator',
              scopes: [ApiKeyScope.FORMS_WRITE, ApiKeyScope.FORMS_READ],
            });

            // 2. Create a form with a PII-laden title
            const createResponse = await axios.post(
              `${this.target.baseUrl}/mcp`,
              {
                jsonrpc: '2.0',
                method: 'form_creation_tool',
                params: { formTitle: piiTitle },
                id: '1',
              },
              { headers: { 'x-api-key': creatorApiKey.key } }
            );

            if (createResponse.data.error) {
              throw new Error(`Failed to create form for PII test: ${createResponse.data.error.message}`);
            }
            formId = createResponse.data.result.formId;

            // 3. Create another user with no permissions
            const attackerApiKey = await apiKeyService.createApiKey({
              name: 'pii-test-attacker',
              scopes: [ApiKeyScope.READ], // A basic scope with no form access
            });

            // 4. Try to access the form with the attacker's key
            const attackResponse = await axios.post(
              `${this.target.baseUrl}/mcp`,
              {
                jsonrpc: '2.0',
                method: 'form_retrieval_tool',
                params: { formId: formId },
                id: '2',
              },
              { headers: { 'x-api-key': attackerApiKey.key } }
            );
            
            // 5. Check the error message
            if (attackResponse.data.result) {
                throw new Error('Attacker was able to retrieve the form. Access control is broken.');
            }

            const errorMessage = attackResponse.data.error?.message || '';

            if (errorMessage.includes(piiTitle)) {
              return {
                id: 'DP-001',
                name: 'PII Exposure in Error Messages',
                suite: 'custom',
                status: 'failed',
                severity: 'critical',
                description: 'Error message exposed PII (form title) when access was denied.',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: { category: 'Data Protection', tags: ['api', 'pii', 'privacy'] }
              };
            }

            return {
              id: 'DP-001',
              name: 'PII Exposure in Error Messages',
              suite: 'custom',
              status: 'passed',
              severity: 'critical',
              description: 'Error message did not expose PII when access was denied.',
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'Data Protection', tags: ['api', 'pii', 'privacy'] }
            };

          } catch (error: any) {
             return {
              id: 'DP-001',
              name: 'PII Exposure in Error Messages',
              suite: 'custom',
              status: 'failed',
              severity: 'critical',
              description: `Test setup or execution failed unexpectedly: ${error.message}`,
              duration: Date.now() - startTime,
              timestamp: new Date(),
              metadata: { category: 'Data Protection', tags: ['api', 'pii', 'privacy'] }
            };
          }
        },
      },
    ];
  }
} 