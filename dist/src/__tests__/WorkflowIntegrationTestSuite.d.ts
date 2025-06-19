import axios from 'axios';
import { MCPServer } from '../server';
import { TallyApiService } from '../services/tally-api-service';
import { NlpService } from '../services/nlp-service';
import { FormCreationTool } from '../tools/form-creation-tool';
import { FormModificationTool } from '../tools/form-modification-tool';
import { FormSharingTool } from '../tools/form-sharing-tool';
import { TeamManager } from '../tools/team-manager';
import { SubmissionAnalysisTool } from '../tools/submission-tool';
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
export declare class WorkflowIntegrationTestSuite {
    protected server: MCPServer | null;
    protected baseUrl: string;
    protected testPort: number;
    protected config: WorkflowTestConfig;
    protected executionLogs: WorkflowExecutionLog[];
    protected mockedAxios: jest.Mocked<typeof axios>;
    protected startTime: number;
    protected mockTallyApiService: jest.MockedClass<typeof TallyApiService>;
    protected mockNlpService: jest.MockedClass<typeof NlpService>;
    protected mockFormCreationTool: jest.MockedClass<typeof FormCreationTool>;
    protected mockFormModificationTool: jest.MockedClass<typeof FormModificationTool>;
    protected mockFormSharingTool: jest.MockedClass<typeof FormSharingTool>;
    protected mockTeamManager: jest.MockedClass<typeof TeamManager>;
    protected mockSubmissionTool: jest.MockedClass<typeof SubmissionAnalysisTool>;
    constructor(config?: WorkflowTestConfig);
    setUp(): Promise<void>;
    tearDown(): Promise<void>;
    protected setupMockResponses(): void;
    protected clearAllMocks(): void;
    executeWorkflow(workflowName: string, mcpRequest: any, expectedTransformations?: string[]): Promise<DataTransformationValidation>;
    protected validateDataTransformation(workflowName: string, input: any, output: any, expectedStages: string[]): DataTransformationValidation;
    protected getExpectedOutput(workflowName: string, input: any): any;
    simulateFailureScenario(scenarioName: string, errorType: 'timeout' | 'server-error' | 'auth-failure' | 'malformed-request', workflowName: string, mcpRequest: any): Promise<any>;
    testConcurrentExecution(workflows: Array<{
        name: string;
        request: any;
    }>, maxConcurrency?: number): Promise<Array<DataTransformationValidation | {
        error: any;
    }>>;
    createTestData(): {
        formCreationRequest: (title?: string) => {
            jsonrpc: string;
            id: string;
            method: string;
            params: {
                name: string;
                arguments: {
                    naturalLanguagePrompt: string;
                };
            };
        };
        formModificationRequest: (formId?: string) => {
            jsonrpc: string;
            id: string;
            method: string;
            params: {
                name: string;
                arguments: {
                    formId: string;
                    naturalLanguagePrompt: string;
                };
            };
        };
        submissionRequest: (formId?: string) => {
            jsonrpc: string;
            id: string;
            method: string;
            params: {
                name: string;
                arguments: {
                    formId: string;
                    action: string;
                };
            };
        };
        teamManagementRequest: (teamId?: string) => {
            jsonrpc: string;
            id: string;
            method: string;
            params: {
                name: string;
                arguments: {
                    teamId: string;
                    action: string;
                    email: string;
                    role: string;
                };
            };
        };
    };
    protected simulateNetworkDelay(minMs?: number, maxMs?: number): Promise<void>;
    protected log(workflow: string, stage: string, action: string, data?: any): void;
    protected outputExecutionLogs(): void;
    getExecutionStats(): {
        totalLogs: number;
        uniqueWorkflows: number;
        errors: number;
        successful: number;
        totalDuration: number;
    };
}
export {};
//# sourceMappingURL=WorkflowIntegrationTestSuite.d.ts.map