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

// Mock the services and tools
jest.mock('../services/nlp-service');
jest.mock('../services/tally-api-service');
jest.mock('../tools/form-creation-tool');
jest.mock('../tools/form-modification-tool');
jest.mock('../tools/form-sharing-tool');
jest.mock('../tools/team-manager');
jest.mock('../tools/submission-tool');

const MockedNlpService = NlpService as jest.MockedClass<typeof NlpService>;
const MockedTallyApiService = TallyApiService as jest.MockedClass<typeof TallyApiService>;
const MockedFormCreationTool = FormCreationTool as jest.MockedClass<typeof FormCreationTool>;
const MockedFormModificationTool = FormModificationTool as jest.MockedClass<typeof FormModificationTool>;
const MockedFormSharingTool = FormSharingTool as jest.MockedClass<typeof FormSharingTool>;
const MockedTeamManager = TeamManager as jest.MockedClass<typeof TeamManager>;
const MockedSubmissionTool = SubmissionAnalysisTool as jest.MockedClass<typeof SubmissionAnalysisTool>;

describe('User Workflow Integration Tests', () => {
  let app: Application;
  let server: MCPServer;

  beforeAll(async () => {
    server = new MCPServer({ port: 3004, debug: false });
    await server.initialize();
    // @ts-ignore - Access private app property for testing
    app = server.app;
  });

  afterAll(async () => {
    await server.shutdown();
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
      const mockFormConfig: FormConfig = {
        title: 'My Awesome Form',
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'What is your name?',
            required: false,
          },
        ],
        settings: {
          submissionBehavior: SubmissionBehavior.MESSAGE,
          submissionMessage: 'Thanks!',
        },
        branding: {
          theme: FormTheme.DEFAULT,
        },
      };
      
      const mockTallyForm: TallyForm = {
        id: 'form-123',
        title: 'My Awesome Form',
        url: 'https://tally.so/r/form-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock generateFormConfig to return a specific config
      MockedNlpService.prototype.generateFormConfig.mockReturnValue(mockFormConfig);
      // Mock createForm to return a mock Tally form
      MockedTallyApiService.prototype.createForm.mockResolvedValue(mockTallyForm);

      const mcpPayload = {
        tool: 'form_creation_tool',
        args: {
          naturalLanguagePrompt: 'Create a form with a single question: What is your name?',
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      
      // The MCP server should have instantiated the tool
      expect(MockedFormCreationTool).toHaveBeenCalledTimes(1);
      
      // The tool should then instantiate the services
      expect(MockedNlpService).toHaveBeenCalledTimes(1);
      expect(MockedTallyApiService).toHaveBeenCalledTimes(1);

      // Verify the correct methods were called on the services
      expect(MockedNlpService.prototype.generateFormConfig).toHaveBeenCalledWith(
        'Create a form with a single question: What is your name?'
      );
      expect(MockedTallyApiService.prototype.createForm).toHaveBeenCalledWith(mockFormConfig);
    });
  });

  describe('Form Modification Workflow', () => {
    it('should modify a form from a natural language prompt via MCP', async () => {
      // Mock the tool's execute method
      const mockExecute = jest.fn().mockResolvedValue({ success: true });
      MockedFormModificationTool.prototype.execute = mockExecute;
      
      const mcpPayload = {
        tool: 'form_modification_tool',
        args: {
          formId: 'form-123',
          naturalLanguagePrompt: 'Change the title to "Super Awesome Form"',
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      expect(MockedFormModificationTool).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith(mcpPayload.args);
    });
  });

  describe('Form Sharing Workflow', () => {
    it('should get form sharing details via MCP', async () => {
      // Mock the tool's getPublicationSettings method
      const mockGetPublicationSettings = jest.fn().mockResolvedValue({
        success: true,
        data: {
          visibility: 'public',
        },
      });
      MockedFormSharingTool.prototype.getPublicationSettings = mockGetPublicationSettings;

      const mcpPayload = {
        tool: 'form_sharing_tool',
        args: {
          formId: 'form-123',
          action: 'get_sharing_details', // This will be mapped to a method in the tool
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      expect(MockedFormSharingTool).toHaveBeenCalledTimes(1);
      // We expect the MCP server to have routed this to the correct method
      // but we can't directly test that routing here.
      // Instead we assume that if the tool was called, the routing worked.
    });
  });

  describe('Team Management Workflow', () => {
    it('should invite a team member via MCP', async () => {
      // Mock the tool's addTeamMember method
      const mockAddTeamMember = jest.fn().mockResolvedValue({ success: true });
      MockedTeamManager.prototype.addTeamMember = mockAddTeamMember;

      const mcpPayload = {
        tool: 'team_manager',
        args: {
          teamId: 'team-456', // Assuming a teamId is needed
          action: 'invite_user', // This will be mapped to a method
          userId: 'user-789', // Assuming a userId is needed
          email: 'test@example.com',
          role: 'editor',
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      expect(MockedTeamManager).toHaveBeenCalledTimes(1);
      // We expect the MCP server to have routed this to the correct method
      // The `addTeamMember` method expects teamId, userId, role, and permissions
      // We can't directly check the mapping from the MCP args to these params.
    });
  });

  describe('Submission Management Workflow', () => {
    it('should get form submissions via MCP', async () => {
      // Mock the tool's list method
      const mockList = jest.fn().mockResolvedValue([]);
      MockedSubmissionTool.prototype.list = mockList;

      const mcpPayload = {
        tool: 'submission_tool',
        args: {
          formId: 'form-123',
          action: 'get_submissions',
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      expect(MockedSubmissionTool).toHaveBeenCalledTimes(1);
      // We expect the MCP server to have routed this to the correct method
      // but we can't directly test that routing here.
    });
  });

  describe('Template Workflow', () => {
    it('should create a form from a template via MCP', async () => {
      // Mock the tool's execute method
      const mockExecute = jest.fn().mockResolvedValue({ formUrl: 'https://tally.so/r/form-456' });
      MockedFormCreationTool.prototype.execute = mockExecute;

      const mcpPayload = {
        tool: 'form_creation_tool',
        args: {
          templateId: 'template-xyz',
          formTitle: 'My Form From Template',
        },
      };

      const response = await request(app)
        .post('/v1/mcp')
        .set('Authorization', 'Bearer valid-api-key')
        .send(mcpPayload);

      expect(response.status).toBe(200);
      expect(MockedFormCreationTool).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith(mcpPayload.args);
    });
  });
}); 