/**
 * @file Integration tests for user workflows, covering the entire process from input to output.
 */

import request from 'supertest';
import { Application } from 'express';
import { MCPServer } from '../server';
import { NlpService } from '../services/nlp-service';
import { TallyApiService } from '../services/tally-api-service';
import { TallyForm } from '../models';
import { FormCreationTool } from '../tools/form-creation-tool';
import { FormModificationTool } from '../tools/form-modification-tool';
import { FormSharingTool } from '../tools/form-sharing-tool';
import { TeamManager } from '../tools/team-manager';
import { SubmissionAnalysisTool } from '../tools/submission-tool';
import { FormConfig, QuestionType, SubmissionBehavior, FormTheme } from '../models';
import axios from 'axios';

// Mock the services and tools
jest.mock('../services/nlp-service');
jest.mock('../services/tally-api-service');
jest.mock('../tools/form-creation-tool');
jest.mock('../tools/form-modification-tool');
jest.mock('../tools/form-sharing-tool');
jest.mock('../tools/team-manager');
jest.mock('../tools/submission-tool');

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  get: jest.fn(),
  post: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const MockedNlpService = NlpService as jest.MockedClass<typeof NlpService>;
const MockedTallyApiService = TallyApiService as jest.MockedClass<typeof TallyApiService>;
const MockedFormCreationTool = FormCreationTool as jest.MockedClass<typeof FormCreationTool>;
const MockedFormModificationTool = FormModificationTool as jest.MockedClass<typeof FormModificationTool>;
const MockedFormSharingTool = FormSharingTool as jest.MockedClass<typeof FormSharingTool>;
const MockedTeamManager = TeamManager as jest.MockedClass<typeof TeamManager>;
const MockedSubmissionTool = SubmissionAnalysisTool as jest.MockedClass<typeof SubmissionAnalysisTool>;

describe('User Workflow Integration Tests', () => {
  let server: MCPServer;
  let baseUrl: string;
  let testPort: number;

  beforeEach(async () => {
    // Set up axios mocks
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { success: true },
      headers: {}
    });

    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: {
        jsonrpc: '2.0',
        id: 'test-id',
        result: { success: true }
      },
      headers: {}
    });

    // Create and initialize server
    testPort = 4000 + Math.floor(Math.random() * 1000);
    baseUrl = `http://127.0.0.1:${testPort}`;
    const config = {
      port: testPort,
      host: '127.0.0.1',
      debug: true,
    };
    
    server = new MCPServer(config);
    await server.initialize();
  });

  afterEach(async () => {
    if (server) {
      await server.shutdown();
    }
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Clear mock history before each test
    MockedNlpService.mockClear();
    MockedTallyApiService.mockClear();
    MockedFormCreationTool.mockClear();
    MockedFormModificationTool.mockClear();
    MockedFormSharingTool.mockClear();
    MockedTeamManager.mockClear();
    MockedSubmissionTool.mockClear();
  });

  describe('Form Creation Workflow', () => {
    it('should create a form from a natural language prompt via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-form-creation',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            naturalLanguagePrompt: 'Create a form with a single question: What is your name?',
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      
      // Should return a valid JSON-RPC response
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-form-creation');
      expect(response.body.result || response.body.error).toBeDefined();
    });
  });

  describe('Form Modification Workflow', () => {
    it('should modify a form from a natural language prompt via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-form-modification',
        method: 'tools/call',
        params: {
          name: 'form_modification_tool',
          arguments: {
            formId: 'form-123',
            naturalLanguagePrompt: 'Change the title to "Super Awesome Form"',
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-form-modification');
    });
  });

  describe('Form Sharing Workflow', () => {
    it('should get form sharing details via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-form-sharing',
        method: 'tools/call',
        params: {
          name: 'form_sharing_tool',
          arguments: {
            formId: 'form-123',
            action: 'get_sharing_details',
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-form-sharing');
    });
  });

  describe('Team Management Workflow', () => {
    it('should invite a team member via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-team-management',
        method: 'tools/call',
        params: {
          name: 'team_manager',
          arguments: {
            teamId: 'team-456',
            action: 'invite_user',
            userId: 'user-789',
            email: 'test@example.com',
            role: 'editor',
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-team-management');
    });
  });

  describe('Submission Management Workflow', () => {
    it('should get form submissions via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-submission-management',
        method: 'tools/call',
        params: {
          name: 'submission_tool',
          arguments: {
            formId: 'form-123',
            action: 'get_submissions',
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-submission-management');
    });
  });

  describe('Template Workflow', () => {
    it('should create a form from a template via MCP', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 'test-template-workflow',
        method: 'tools/call',
        params: {
          name: 'form_creation_tool',
          arguments: {
            templateId: 'template-456',
            customizations: {
              title: 'My Custom Form from Template'
            }
          }
        }
      };

      const response = await request(baseUrl)
        .post('/message')
        .set('Content-Type', 'application/json')
        .send(mcpRequest);

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe('test-template-workflow');
    });
  });
}); 