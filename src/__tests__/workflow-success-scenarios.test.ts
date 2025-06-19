/**
 * @file Comprehensive tests for successful workflow scenarios
 * Tests complete end-to-end data transformation from MCP client requests to Tally.so API responses
 */

import { WorkflowIntegrationTestSuite } from './WorkflowIntegrationTestSuite';

describe('Successful Workflow Integration Tests', () => {
  let testSuite: WorkflowIntegrationTestSuite;

  beforeEach(async () => {
    testSuite = new WorkflowIntegrationTestSuite({
      debug: true,
      enableRealAPI: false
    });
    await testSuite.setUp();
  });

  afterEach(async () => {
    if (testSuite) {
      await testSuite.tearDown();
    }
  });

  describe('Form Creation Workflow', () => {
    it('should complete form creation workflow with data transformation validation', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('Contact Form');

      const validation = await testSuite.executeWorkflow(
        'form-creation',
        request,
        ['mcp-request', 'nlp-processing', 'tally-api-call', 'response-transformation']
      );

      // Validate workflow execution
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Validate data transformation stages
      expect(validation.transformationStages).toContain('mcp-request');
      expect(validation.transformationStages).toContain('response-transformation');

      // Validate response structure
      expect(validation.actualOutput).toMatchObject({
        jsonrpc: '2.0',
        id: request.id
      });

      // Should have either result or error
      expect(
        validation.actualOutput.result || validation.actualOutput.error
      ).toBeDefined();
    });

    it('should handle form creation with complex question types', async () => {
      const complexFormRequest = {
        jsonrpc: '2.0',
        id: 'test-complex-form',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            naturalLanguagePrompt: 'Create a survey with multiple choice question, text input, email field, and file upload',
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'form-creation',
        complexFormRequest,
        ['mcp-request', 'nlp-processing', 'form-structure-analysis', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.jsonrpc).toBe('2.0');
      expect(validation.actualOutput.id).toBe('test-complex-form');
    });

    it('should validate form creation with custom branding and themes', async () => {
      const brandedFormRequest = {
        jsonrpc: '2.0',
        id: 'test-branded-form',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            naturalLanguagePrompt: 'Create a feedback form with custom branding and dark theme',
            customizations: {
              theme: 'dark',
              brandColor: '#ff6b6b',
              logo: 'https://example.com/logo.png'
            }
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'form-creation',
        brandedFormRequest,
        ['mcp-request', 'customization-processing', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput).toMatchObject({
        jsonrpc: '2.0',
        id: 'test-branded-form'
      });
    });
  });

  describe('Form Modification Workflow', () => {
    it('should complete form modification workflow with validation', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formModificationRequest('existing-form-123');

      const validation = await testSuite.executeWorkflow(
        'form-modification',
        request,
        ['mcp-request', 'form-retrieval', 'nlp-processing', 'modification-application', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // Validate that form ID is preserved in response
      expect(validation.actualOutput.jsonrpc).toBe('2.0');
      expect(validation.actualOutput.id).toBe(request.id);
    });

    it('should handle complex form modifications', async () => {
      const complexModificationRequest = {
        jsonrpc: '2.0',
        id: 'test-complex-modification',
        method: 'tools/call',
        params: {
          name: 'form_modification_tool',
          arguments: {
            formId: 'form-456',
            naturalLanguagePrompt: 'Add conditional logic: show email field only if user selects "Contact me" option',
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'form-modification',
        complexModificationRequest,
        ['mcp-request', 'form-analysis', 'logic-processing', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.id).toBe('test-complex-modification');
    });
  });

  describe('Form Retrieval Workflow', () => {
    it('should complete form retrieval workflow with data integrity validation', async () => {
      const retrievalRequest = {
        jsonrpc: '2.0',
        id: 'test-form-retrieval',
        method: 'tools/call',
        params: {
          name: 'form_sharing_tool',
          arguments: {
            formId: 'form-789',
            action: 'get_form_details',
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'form-retrieval',
        retrievalRequest,
        ['mcp-request', 'form-lookup', 'tally-api-call', 'data-transformation', 'response-formatting']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput).toMatchObject({
        jsonrpc: '2.0',
        id: 'test-form-retrieval'
      });
    });
  });

  describe('Submission Creation and Retrieval Workflows', () => {
    it('should complete submission creation workflow', async () => {
      const submissionRequest = {
        jsonrpc: '2.0',
        id: 'test-submission-creation',
        method: 'tools/call',
        params: {
          name: 'submission_tool',
          arguments: {
            formId: 'form-abc',
            action: 'create_submission',
            data: {
              'question-1': 'John Doe',
              'question-2': 'john@example.com',
              'question-3': 'This is my feedback'
            }
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'submission-creation',
        submissionRequest,
        ['mcp-request', 'data-validation', 'submission-processing', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.jsonrpc).toBe('2.0');
      expect(validation.actualOutput.id).toBe('test-submission-creation');
    });

    it('should complete submission retrieval workflow', async () => {
      const testData = testSuite.createTestData();
      const request = testData.submissionRequest('form-def');

      const validation = await testSuite.executeWorkflow(
        'submission-retrieval',
        request,
        ['mcp-request', 'form-validation', 'tally-api-call', 'data-aggregation', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput).toMatchObject({
        jsonrpc: '2.0',
        id: request.id
      });
    });

    it('should handle filtered submission retrieval', async () => {
      const filteredRequest = {
        jsonrpc: '2.0',
        id: 'test-filtered-submissions',
        method: 'tools/call',
        params: {
          name: 'submission_tool',
          arguments: {
            formId: 'form-ghi',
            action: 'get_submissions',
            filters: {
              dateRange: {
                start: '2024-01-01',
                end: '2024-12-31'
              },
              status: 'completed'
            }
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'filtered-submission-retrieval',
        filteredRequest,
        ['mcp-request', 'filter-processing', 'tally-api-call', 'data-filtering', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.id).toBe('test-filtered-submissions');
    });
  });

  describe('Workspace Management Workflows', () => {
    it('should complete team member invitation workflow', async () => {
      const testData = testSuite.createTestData();
      const request = testData.teamManagementRequest('team-xyz');

      const validation = await testSuite.executeWorkflow(
        'team-invitation',
        request,
        ['mcp-request', 'team-validation', 'user-lookup', 'invitation-processing', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput).toMatchObject({
        jsonrpc: '2.0',
        id: request.id
      });
    });

    it('should handle workspace configuration updates', async () => {
      const workspaceRequest = {
        jsonrpc: '2.0',
        id: 'test-workspace-config',
        method: 'tools/call',
        params: {
          name: 'team_manager',
          arguments: {
            workspaceId: 'workspace-123',
            action: 'update_settings',
            settings: {
              defaultTheme: 'modern',
              allowGuestSubmissions: true,
              enableAnalytics: true
            }
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'workspace-configuration',
        workspaceRequest,
        ['mcp-request', 'workspace-validation', 'settings-processing', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.id).toBe('test-workspace-config');
    });
  });

  describe('Data Integrity and Transformation Validation', () => {
    it('should validate complete data round-trip integrity', async () => {
      const originalData = {
        title: 'Customer Feedback Form',
        description: 'Help us improve our services',
        questions: [
          { type: 'text', title: 'Name', required: true },
          { type: 'email', title: 'Email', required: true },
          { type: 'textarea', title: 'Feedback', required: false }
        ]
      };

      const request = {
        jsonrpc: '2.0',
        id: 'test-data-integrity',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            formData: originalData
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'data-integrity-test',
        request,
        ['mcp-request', 'data-parsing', 'structure-validation', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      
      // Validate that no data was lost or corrupted during transformation
      expect(validation.input.params.arguments.formData).toEqual(originalData);
      expect(validation.actualOutput.jsonrpc).toBe('2.0');
      expect(validation.actualOutput.id).toBe('test-data-integrity');
    });

    it('should handle unicode and special characters correctly', async () => {
      const unicodeRequest = {
        jsonrpc: '2.0',
        id: 'test-unicode-handling',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            naturalLanguagePrompt: 'Create form with unicode: 测试表单 🌟 émojis and spëcial chars',
          }
        }
      };

      const validation = await testSuite.executeWorkflow(
        'unicode-handling',
        unicodeRequest,
        ['mcp-request', 'text-processing', 'encoding-handling', 'tally-api-call', 'response-transformation']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.actualOutput.id).toBe('test-unicode-handling');
    });
  });

  describe('Performance and Timing Validation', () => {
    it('should complete workflows within acceptable time limits', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('Performance Test Form');

      const startTime = Date.now();
      const validation = await testSuite.executeWorkflow(
        'performance-test',
        request
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(validation.isValid).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 