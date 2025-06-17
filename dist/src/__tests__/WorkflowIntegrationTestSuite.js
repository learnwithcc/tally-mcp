import request from 'supertest';
import axios from 'axios';
import { MCPServer } from '../server';
import { TallyApiService } from '../services/tally-api-service';
import { NlpService } from '../services/nlp-service';
import { FormCreationTool } from '../tools/form-creation-tool';
import { FormModificationTool } from '../tools/form-modification-tool';
import { FormSharingTool } from '../tools/form-sharing-tool';
import { TeamManager } from '../tools/team-manager';
import { SubmissionAnalysisTool } from '../tools/submission-tool';
jest.mock('axios');
jest.mock('../services/tally-api-service');
jest.mock('../services/nlp-service');
jest.mock('../tools/form-creation-tool');
jest.mock('../tools/form-modification-tool');
jest.mock('../tools/form-sharing-tool');
jest.mock('../tools/team-manager');
jest.mock('../tools/submission-tool');
export class WorkflowIntegrationTestSuite {
    constructor(config = {}) {
        this.server = null;
        this.baseUrl = '';
        this.testPort = 0;
        this.executionLogs = [];
        this.mockedAxios = axios;
        this.startTime = 0;
        this.mockTallyApiService = TallyApiService;
        this.mockNlpService = NlpService;
        this.mockFormCreationTool = FormCreationTool;
        this.mockFormModificationTool = FormModificationTool;
        this.mockFormSharingTool = FormSharingTool;
        this.mockTeamManager = TeamManager;
        this.mockSubmissionTool = SubmissionAnalysisTool;
        this.config = {
            host: '127.0.0.1',
            debug: true,
            enableRealAPI: false,
            ...config
        };
    }
    async setUp() {
        this.startTime = Date.now();
        this.log('setup', 'start', 'Initializing test environment');
        try {
            this.testPort = this.config.port || (4000 + Math.floor(Math.random() * 1000));
            this.baseUrl = `http://${this.config.host}:${this.testPort}`;
            this.setupMockResponses();
            const serverConfig = {
                port: this.testPort,
                host: this.config.host,
                debug: this.config.debug,
            };
            this.server = new MCPServer(serverConfig);
            await this.server.initialize();
            this.log('setup', 'complete', 'Test environment initialized successfully', {
                port: this.testPort,
                baseUrl: this.baseUrl
            });
        }
        catch (error) {
            this.log('setup', 'error', 'Failed to initialize test environment', { error });
            throw error;
        }
    }
    async tearDown() {
        this.log('teardown', 'start', 'Cleaning up test environment');
        try {
            if (this.server) {
                await this.server.shutdown();
                this.server = null;
            }
            this.clearAllMocks();
            const duration = Date.now() - this.startTime;
            this.log('teardown', 'complete', 'Test environment cleaned up successfully', {
                totalDuration: duration,
                totalLogs: this.executionLogs.length
            });
            if (this.config.debug) {
                this.outputExecutionLogs();
            }
        }
        catch (error) {
            this.log('teardown', 'error', 'Failed to clean up test environment', { error });
            throw error;
        }
    }
    setupMockResponses() {
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
        this.mockedAxios.get.mockImplementation(async (url) => {
            await this.simulateNetworkDelay();
            return responses['tally-api-success'];
        });
        this.mockedAxios.post.mockImplementation(async (url, data) => {
            await this.simulateNetworkDelay();
            if (url.includes('/message')) {
                return responses['mcp-success'];
            }
            return responses['tally-api-success'];
        });
        this.log('setup', 'mocks', 'Mock responses configured', { responses: Object.keys(responses) });
    }
    clearAllMocks() {
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
    async executeWorkflow(workflowName, mcpRequest, expectedTransformations = []) {
        const workflowStart = Date.now();
        this.log(workflowName, 'start', 'Starting workflow execution', { request: mcpRequest });
        try {
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
            return this.validateDataTransformation(workflowName, mcpRequest, response.body, expectedTransformations);
        }
        catch (error) {
            const duration = Date.now() - workflowStart;
            this.log(workflowName, 'error', 'Workflow execution failed', { error, duration });
            throw error;
        }
    }
    validateDataTransformation(workflowName, input, output, expectedStages) {
        const validation = {
            input,
            expectedOutput: this.getExpectedOutput(workflowName, input),
            actualOutput: output,
            transformationStages: expectedStages,
            isValid: true,
            errors: []
        };
        if (!output.jsonrpc || output.jsonrpc !== '2.0') {
            validation.errors.push('Invalid JSON-RPC response format');
            validation.isValid = false;
        }
        if (input.id && output.id !== input.id) {
            validation.errors.push(`Request/response ID mismatch: ${input.id} !== ${output.id}`);
            validation.isValid = false;
        }
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
    getExpectedOutput(workflowName, input) {
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
    async simulateFailureScenario(scenarioName, errorType, workflowName, mcpRequest) {
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
                break;
        }
        try {
            return await this.executeWorkflow(workflowName, mcpRequest);
        }
        catch (error) {
            this.log(scenarioName, 'error-captured', `${errorType} scenario executed`, { error });
            return { error };
        }
    }
    async testConcurrentExecution(workflows, maxConcurrency = 5) {
        this.log('concurrency', 'start', `Testing concurrent execution of ${workflows.length} workflows`);
        const batches = [];
        for (let i = 0; i < workflows.length; i += maxConcurrency) {
            batches.push(workflows.slice(i, i + maxConcurrency));
        }
        const results = [];
        for (const batch of batches) {
            const batchPromises = batch.map(workflow => this.executeWorkflow(workflow.name, workflow.request).catch(error => ({ error })));
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
    createTestData() {
        return {
            formCreationRequest: (title = 'Test Form') => ({
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
            formModificationRequest: (formId = 'form-123') => ({
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
            submissionRequest: (formId = 'form-123') => ({
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
            teamManagementRequest: (teamId = 'team-456') => ({
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
    async simulateNetworkDelay(minMs = 10, maxMs = 100) {
        const delay = Math.random() * (maxMs - minMs) + minMs;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    log(workflow, stage, action, data) {
        const logEntry = {
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
    outputExecutionLogs() {
        console.log('\n=== Workflow Execution Logs ===');
        this.executionLogs.forEach(log => {
            console.log(`[${log.timestamp}] ${log.workflow}:${log.stage} - ${log.action}`);
            if (log.data) {
                console.log('  Data:', JSON.stringify(log.data, null, 2));
            }
        });
        console.log('=== End Execution Logs ===\n');
    }
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
//# sourceMappingURL=WorkflowIntegrationTestSuite.js.map