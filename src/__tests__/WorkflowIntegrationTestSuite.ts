/**
 * @file Comprehensive integration test suite for validating complete workflows
 * from MCP client request through API calls to Tally.so and back.
 */

import request from 'supertest';
import axios from 'axios';
import { MCPServer } from '../server';
import { TallyApiClient } from '../services/TallyApiClient';
import { TallyApiService } from '../services/tally-api-service';
import { NlpService } from '../services/nlp-service';
import { FormCreationTool } from '../tools/form-creation-tool';
import { FormModificationTool } from '../tools/form-modification-tool';
import { FormSharingTool } from '../tools/form-sharing-tool';
import { TeamManager } from '../tools/team-manager';
import { SubmissionAnalysisTool } from '../tools/submission-tool';
import { TallyForm, FormConfig, QuestionType, SubmissionBehavior, FormTheme } from '../models';

// Mock all external dependencies
jest.mock('axios');
jest.mock('../services/tally-api-service');
jest.mock('../services/nlp-service');
jest.mock('../tools/form-creation-tool');
jest.mock('../tools/form-modification-tool');
jest.mock('../tools/form-sharing-tool');
jest.mock('../tools/team-manager');
jest.mock('../tools/submission-tool');

interface WorkflowTestConfig {
  port?: number;
  host?: string;
  debug?: boolean;
  enableRealAPI?: boolean;
  tallyApiKey?: string;
  mockResponses?: MockResponseConfig;
}

interface MockResponseConfig {
  [key: string]: {
    status: number;
    data: any;
    delay?: number;
  };
}

interface WorkflowExecutionLog {
  timestamp: string;
  workflow: string;
  stage: string;
  action: string;
  duration?: number;
  data?: any;
  error?: any;
}

interface DataTransformationValidation {
  input: any;
  expectedOutput: any;
  actualOutput: any;
  transformationStages: string[];
  isValid: boolean;
  errors: string[];
}

/**
 * Base class for comprehensive workflow integration testing
 * Provides setup, teardown, logging, and validation utilities
 */
export class WorkflowIntegrationTestSuite {
  protected server: MCPServer | null = null;
  protected baseUrl: string = '';
  protected testPort: number = 0;
  protected config: WorkflowTestConfig;
  protected executionLogs: WorkflowExecutionLog[] = [];
  protected mockedAxios = axios as jest.Mocked<typeof axios>;
  protected startTime: number = 0;

  // Mock instances
  protected mockTallyApiService = TallyApiService as jest.MockedClass<typeof TallyApiService>;
  protected mockNlpService = NlpService as jest.MockedClass<typeof NlpService>;
  protected mockFormCreationTool = FormCreationTool as jest.MockedClass<typeof FormCreationTool>;
  protected mockFormModificationTool = FormModificationTool as jest.MockedClass<typeof FormModificationTool>;
  protected mockFormSharingTool = FormSharingTool as jest.MockedClass<typeof FormSharingTool>;
  protected mockTeamManager = TeamManager as jest.MockedClass<typeof TeamManager>;
  protected mockSubmissionTool = SubmissionAnalysisTool as jest.MockedClass<typeof SubmissionAnalysisTool>;

  constructor(config: WorkflowTestConfig = {}) {
    this.config = {
      host: '127.0.0.1',
      debug: true,
      enableRealAPI: false,
      ...config
    };
  }

  /**
   * Initialize the test environment
   */
  async setUp(): Promise<void> {
    this.startTime = Date.now();
    this.log('setup', 'start', 'Initializing test environment');

    try {
      // Generate unique port for this test instance
      this.testPort = this.config.port || (4000 + Math.floor(Math.random() * 1000));
      this.baseUrl = `http://${this.config.host}:${this.testPort}`;

      // Setup mock configurations
      this.setupMockResponses();

      // Create and initialize server
      const serverConfig = {
        port: this.testPort,
        host: this.config.host!,
        debug: this.config.debug!,
      };

      this.server = new MCPServer(serverConfig);
      await this.server.initialize();

      this.log('setup', 'complete', 'Test environment initialized successfully', {
        port: this.testPort,
        baseUrl: this.baseUrl
      });
    } catch (error) {
      this.log('setup', 'error', 'Failed to initialize test environment', { error });
      throw error;
    }
  }

  /**
   * Clean up test environment
   */
  async tearDown(): Promise<void> {
    this.log('teardown', 'start', 'Cleaning up test environment');

    try {
      if (this.server) {
        await this.server.shutdown();
        this.server = null;
      }

      // Clear all mocks
      this.clearAllMocks();

      const duration = Date.now() - this.startTime;
      this.log('teardown', 'complete', 'Test environment cleaned up successfully', {
        totalDuration: duration,
        totalLogs: this.executionLogs.length
      });

      // Output execution logs for debugging
      if (this.config.debug) {
        this.outputExecutionLogs();
      }
    } catch (error) {
      this.log('teardown', 'error', 'Failed to clean up test environment', { error });
      throw error;
    }
  }

  /**
   * Setup mock responses for external dependencies
   */
  protected setupMockResponses(): void {
    const defaultResponses = {
      'tally-api-success': {
        status: 200,
        data: { success: true, id: 'mock-id' }
      },
      'mcp-success': {
        status: 200,
        data: {
          jsonrpc: '2.0',
          id: 'test-id',
          result: { success: true }
        }
      }
    };

    const responses = { ...defaultResponses, ...this.config.mockResponses };

    // Setup axios mocks
    this.mockedAxios.get.mockImplementation(async (url: string) => {
      await this.simulateNetworkDelay();
      return responses['tally-api-success'];
    });

    this.mockedAxios.post.mockImplementation(async (url: string, data?: any) => {
      await this.simulateNetworkDelay();
      if (url.includes('/message')) {
        // Return unique ID for each MCP request to support concurrency tests
        const uniqueMcpResponse = {
          ...responses['mcp-success'],
          data: {
            ...responses['mcp-success'].data,
            id: `test-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        };
        return uniqueMcpResponse;
      }
      // Return unique ID for each API call to support concurrency tests
      const uniqueResponse = {
        ...responses['tally-api-success'],
        data: {
          ...responses['tally-api-success'].data,
          id: `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      };
      return uniqueResponse;
    });

    this.log('setup', 'mocks', 'Mock responses configured', { responses: Object.keys(responses) });
  }

  /**
   * Clear all mock instances and history
   */
  protected clearAllMocks(): void {
    this.mockedAxios.get.mockClear();
    this.mockedAxios.post.mockClear();
    this.mockTallyApiService.mockClear();
    this.mockNlpService.mockClear();
    this.mockFormCreationTool.mockClear();
    this.mockFormModificationTool.mockClear();
    this.mockFormSharingTool.mockClear();
    this.mockTeamManager.mockClear();
    this.mockSubmissionTool.mockClear();
    jest.clearAllMocks();
  }

  /**
   * Execute a complete workflow and validate data transformation
   */
  async executeWorkflow(
    workflowName: string,
    mcpRequest: any,
    expectedTransformations: string[] = []
  ): Promise<DataTransformationValidation> {
    const workflowStart = Date.now();
    this.log(workflowName, 'start', 'Starting workflow execution', { request: mcpRequest });

    try {
      // Execute MCP request
      const response = await request(this.baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      const duration = Date.now() - workflowStart;
      this.log(workflowName, 'complete', 'Workflow execution completed', {
        status: response.status,
        duration,
        responseBody: response.body
      });

      // Validate data transformation
      return this.validateDataTransformation(
        workflowName,
        mcpRequest,
        response.body,
        expectedTransformations
      );
    } catch (error) {
      const duration = Date.now() - workflowStart;
      this.log(workflowName, 'error', 'Workflow execution failed', { error, duration });
      throw error;
    }
  }

  /**
   * Validate data transformation accuracy
   */
  protected validateDataTransformation(
    workflowName: string,
    input: any,
    output: any,
    expectedStages: string[]
  ): DataTransformationValidation {
    const validation: DataTransformationValidation = {
      input,
      expectedOutput: this.getExpectedOutput(workflowName, input),
      actualOutput: output,
      transformationStages: expectedStages,
      isValid: true,
      errors: []
    };

    // Validate JSON-RPC response structure
    if (!output.jsonrpc || output.jsonrpc !== '2.0') {
      validation.errors.push('Invalid JSON-RPC response format');
      validation.isValid = false;
    }

    // Validate request/response ID matching
    if (input.id && output.id !== input.id) {
      validation.errors.push(`Request/response ID mismatch: ${input.id} !== ${output.id}`);
      validation.isValid = false;
    }

    // Validate that either result or error is present
    if (!output.result && !output.error) {
      validation.errors.push('Response missing both result and error fields');
      validation.isValid = false;
    }

    this.log(workflowName, 'validation', 'Data transformation validation completed', {
      isValid: validation.isValid,
      errors: validation.errors
    });

    return validation;
  }

  /**
   * Get expected output for a given workflow and input
   */
  protected getExpectedOutput(workflowName: string, input: any): any {
    const baseExpected = {
      jsonrpc: '2.0',
      id: input.id
    };

    switch (workflowName) {
      case 'form-creation':
        return {
          ...baseExpected,
          result: {
            success: true,
            formId: expect.any(String),
            url: expect.any(String)
          }
        };
      case 'form-modification':
        return {
          ...baseExpected,
          result: {
            success: true,
            formId: input.params.arguments.formId,
            changes: expect.any(Object)
          }
        };
      default:
        return {
          ...baseExpected,
          result: expect.any(Object)
        };
    }
  }

  /**
   * Simulate network timeouts and failures
   */
  async simulateFailureScenario(
    scenarioName: string,
    errorType: 'timeout' | 'server-error' | 'auth-failure' | 'malformed-request',
    workflowName: string,
    mcpRequest: any
  ): Promise<any> {
    this.log(scenarioName, 'start', `Simulating ${errorType} scenario`);

    switch (errorType) {
      case 'timeout':
        this.mockedAxios.post.mockRejectedValueOnce(new Error('Request timeout'));
        break;
      case 'server-error':
        this.mockedAxios.post.mockResolvedValueOnce({
          status: 500,
          data: { error: 'Internal server error' }
        });
        break;
      case 'auth-failure':
        this.mockedAxios.post.mockResolvedValueOnce({
          status: 401,
          data: { error: 'Unauthorized' }
        });
        break;
      case 'malformed-request':
        // This will be handled by sending malformed request data
        break;
    }

    try {
      return await this.executeWorkflow(workflowName, mcpRequest);
    } catch (error) {
      this.log(scenarioName, 'error-captured', `${errorType} scenario executed`, { error });
      return { error };
    }
  }

  /**
   * Test concurrent workflow execution
   */
  async testConcurrentExecution(
    workflows: Array<{ name: string; request: any }>,
    maxConcurrency: number = 5
  ): Promise<Array<DataTransformationValidation | { error: any }>> {
    this.log('concurrency', 'start', `Testing concurrent execution of ${workflows.length} workflows`);

    const batches: Array<Array<{ name: string; request: any }>> = [];
    for (let i = 0; i < workflows.length; i += maxConcurrency) {
      batches.push(workflows.slice(i, i + maxConcurrency));
    }

    const results: Array<DataTransformationValidation | { error: any }> = [];

    for (const batch of batches) {
      const batchPromises = batch.map(workflow =>
        this.executeWorkflow(workflow.name, workflow.request).catch(error => ({ error }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    this.log('concurrency', 'complete', 'Concurrent execution completed', {
      totalWorkflows: workflows.length,
      batches: batches.length,
      maxConcurrency
    });

    return results;
  }

  /**
   * Generate test data factories
   */
  createTestData() {
    return {
      formCreationRequest: (title: string = 'Test Form') => ({
        jsonrpc: '2.0',
        id: `test-form-creation-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            naturalLanguagePrompt: `Create a form titled "${title}" with a single question: What is your name?`,
          }
        }
      }),

      formModificationRequest: (formId: string = 'form-123') => ({
        jsonrpc: '2.0',
        id: `test-form-modification-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: 'form_modification_tool',
          arguments: {
            formId,
            naturalLanguagePrompt: 'Change the title to "Updated Form Title"',
          }
        }
      }),

      submissionRequest: (formId: string = 'form-123') => ({
        jsonrpc: '2.0',
        id: `test-submission-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: 'submission_tool',
          arguments: {
            formId,
            action: 'get_submissions',
          }
        }
      }),

      teamManagementRequest: (teamId: string = 'team-456') => ({
        jsonrpc: '2.0',
        id: `test-team-management-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: 'team_manager',
          arguments: {
            teamId,
            action: 'invite_user',
            email: 'test@example.com',
            role: 'editor',
          }
        }
      })
    };
  }

  /**
   * Simulate network delays for realistic testing
   */
  protected async simulateNetworkDelay(minMs: number = 10, maxMs: number = 100): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Log workflow execution events
   */
  protected log(workflow: string, stage: string, action: string, data?: any): void {
    const logEntry: WorkflowExecutionLog = {
      timestamp: new Date().toISOString(),
      workflow,
      stage,
      action,
      data
    };

    this.executionLogs.push(logEntry);

    if (this.config.debug) {
      console.log(`[${logEntry.timestamp}] ${workflow}:${stage} - ${action}`, data || '');
    }
  }

  /**
   * Output all execution logs for debugging
   */
  protected outputExecutionLogs(): void {
    console.log('\n=== Workflow Execution Logs ===');
    this.executionLogs.forEach(log => {
      console.log(`[${log.timestamp}] ${log.workflow}:${log.stage} - ${log.action}`);
      if (log.data) {
        console.log('  Data:', JSON.stringify(log.data, null, 2));
      }
    });
    console.log('=== End Execution Logs ===\n');
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    const workflows = new Set(this.executionLogs.map(log => log.workflow));
    const errors = this.executionLogs.filter(log => log.stage === 'error');
    const successful = this.executionLogs.filter(log => log.stage === 'complete');

    return {
      totalLogs: this.executionLogs.length,
      uniqueWorkflows: workflows.size,
      errors: errors.length,
      successful: successful.length,
      totalDuration: Date.now() - this.startTime
    };
  }
} 