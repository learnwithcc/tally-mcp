/**
 * Tally API Mock Service
 * 
 * Provides comprehensive mock responses for all Tally API endpoints
 * to enable testing without making actual API calls.
 */

import { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  TallyForm,
  TallyFormsResponse,
  TallySubmission,
  TallySubmissionsResponse,
  TallyWorkspace,
  TallyWorkspacesResponse,
  TallyFieldType
} from '../../models';

/**
 * Mock configuration options
 */
export interface MockConfig {
  /** Enable/disable mock responses */
  enabled: boolean;
  /** Simulate network delays (ms) */
  delay: number;
  /** Simulate error responses */
  simulateErrors: boolean;
  /** Error rate (0-1) */
  errorRate: number;
  /** Enable rate limiting simulation */
  simulateRateLimit: boolean;
  /** Rate limit threshold */
  rateLimitThreshold: number;
}

/**
 * Default mock configuration
 */
export const DEFAULT_MOCK_CONFIG: MockConfig = {
  enabled: false,
  delay: 100,
  simulateErrors: false,
  errorRate: 0.1,
  simulateRateLimit: false,
  rateLimitThreshold: 100,
};

/**
 * Mock data fixtures
 */
export class MockDataFixtures {
  /**
   * Generate mock form data
   */
  static createMockForm(overrides: Partial<TallyForm> = {}): TallyForm {
    return {
      id: 'form_123456789',
      title: 'Contact Us',
      description: 'Get in touch with our team',
      url: 'https://tally.so/r/form_123456789',
      embedUrl: 'https://tally.so/embed/form_123456789',
      status: 'published',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isPublished: true,
      submissionsCount: 42,
      ...overrides,
    };
  }

  /**
   * Generate mock forms response
   */
  static createMockFormsResponse(count: number = 3): TallyFormsResponse {
    const forms: TallyForm[] = [];
    for (let i = 1; i <= count; i++) {
      forms.push(this.createMockForm({
        id: `form_${i.toString().padStart(9, '0')}`,
        title: `Test Form ${i}`,
        url: `https://tally.so/r/form_${i.toString().padStart(9, '0')}`,
        embedUrl: `https://tally.so/embed/form_${i.toString().padStart(9, '0')}`,
      }));
    }

    return {
      forms: forms,
      page: 1,
      limit: 10,
      hasMore: false,
    };
  }

  /**
   * Generate mock submission data
   */
  static createMockSubmission(overrides: Partial<TallySubmission> = {}): TallySubmission {
    return {
      id: 'sub_123456789',
      formId: 'form_123456789',
      respondentId: 'resp_123456789',
      isCompleted: true,
      submittedAt: '2024-01-01T12:00:00Z',
      responses: [
        {
          questionId: 'q1',
          value: 'John Doe',
        },
        {
          questionId: 'q2',
          value: 'john.doe@example.com',
        },
        {
          questionId: 'q3',
          value: 'I would like to learn more about your services.',
        },
      ],
      ...overrides,
    };
  }

  /**
   * Generate mock submissions response
   */
  static createMockSubmissionsResponse(count: number = 5): TallySubmissionsResponse {
    const submissions: TallySubmission[] = [];
    for (let i = 1; i <= count; i++) {
      submissions.push(this.createMockSubmission({
        id: `sub_${i.toString().padStart(9, '0')}`,
        submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        responses: [
          { questionId: 'q1', value: `User ${i}` },
          { questionId: 'q2', value: `user${i}@example.com` },
          { questionId: 'q3', value: `This is message ${i} from a test user.` },
        ],
      }));
    }
    return {
      page: 1,
      limit: 10,
      hasMore: false,
      totalNumberOfSubmissionsPerFilter: { all: count, completed: count, partial: 0 },
      questions: [],
      submissions,
    };
  }

  /**
   * Generate mock workspace data
   */
  static createMockWorkspace(overrides: Partial<TallyWorkspace> = {}): TallyWorkspace {
    return {
      id: 'workspace_123',
      name: 'My Workspace',
      description: 'Default workspace for testing',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  /**
   * Generate mock workspaces response
   */
  static createMockWorkspacesResponse(count: number = 2): TallyWorkspacesResponse {
    const workspaces: TallyWorkspace[] = [];
    for (let i = 1; i <= count; i++) {
      workspaces.push(this.createMockWorkspace({
        id: `workspace_${i}`,
        description: `Test workspace ${i}`,
      }));
    }
    return {
      workspaces,
      page: 1,
      limit: 10,
      hasMore: false,
    };
  }
}

/**
 * Mock API response generator
 */
export class TallyApiMock {
  private config: MockConfig;
  private requestCount: number = 0;
  private rateLimitResetTime: number = Date.now() + 60000; // 1 minute from now

  constructor(config: Partial<MockConfig> = {}) {
    this.config = { ...DEFAULT_MOCK_CONFIG, ...config };
  }

  /**
   * Update mock configuration
   */
  public updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): MockConfig {
    return { ...this.config };
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    if (this.config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay));
    }
  }

  /**
   * Check if should simulate error
   */
  private shouldSimulateError(): boolean {
    return this.config.simulateErrors && Math.random() < this.config.errorRate;
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    if (!this.config.simulateRateLimit) return;

    this.requestCount++;
    
    if (Date.now() > this.rateLimitResetTime) {
      this.requestCount = 1;
      this.rateLimitResetTime = Date.now() + 60000;
    }

    if (this.requestCount > this.config.rateLimitThreshold) {
      const error = new Error('Rate limit exceeded');
      (error as any).response = {
        status: 429,
        statusText: 'Too Many Requests',
        data: {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((this.rateLimitResetTime - Date.now()) / 1000),
        },
        headers: {
          'X-RateLimit-Limit': this.config.rateLimitThreshold.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': this.rateLimitResetTime.toString(),
        },
      };
      throw error;
    }
  }

  /**
   * Simulate random error
   */
  private simulateRandomError(): void {
    const errors = [
      { status: 400, message: 'Bad Request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 404, message: 'Not Found' },
      { status: 500, message: 'Internal Server Error' },
      { status: 502, message: 'Bad Gateway' },
      { status: 503, message: 'Service Unavailable' },
    ];
    const idx = Math.floor(Math.random() * errors.length);
    const randomError = errors[idx] ?? errors[0];
    const error = new Error(randomError.message);
    (error as any).response = {
      status: randomError.status,
      statusText: randomError.message,
      data: {
        error: randomError.message,
        message: `Simulated ${randomError.message} error`,
      },
    };
    throw error;
  }

  /**
   * Create mock response
   */
  private createMockResponse<T>(data: T, status: number = 200): AxiosResponse<T> {
    return {
      data,
      status,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      config: {} as any,
    };
  }

  /**
   * Mock GET /forms endpoint
   */
  public async getForms(options: {
    page?: number;
    limit?: number;
    workspaceId?: string;
  } = {}): Promise<AxiosResponse<TallyFormsResponse>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const count = options.limit || 10;
    const response = MockDataFixtures.createMockFormsResponse(count);
    
    // Apply workspace filter if provided
    if (options.workspaceId) {
      response.forms = response.forms.filter((form: any) => form.workspaceId === options.workspaceId);
    }

    return this.createMockResponse(response);
  }

  /**
   * Mock GET /forms/:id endpoint
   */
  public async getForm(formId: string): Promise<AxiosResponse<TallyForm>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const form = MockDataFixtures.createMockForm({ id: formId });
    return this.createMockResponse(form);
  }

  /**
   * Mock GET /forms/:id/submissions endpoint
   */
  public async getSubmissions(
    formId: string,
    options: {
      page?: number;
      limit?: number;
      status?: 'all' | 'completed' | 'partial';
    } = {}
  ): Promise<AxiosResponse<TallySubmissionsResponse>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const count = options.limit || 10;
    const response = MockDataFixtures.createMockSubmissionsResponse(count);
    
    // Apply status filter if provided
    if (options.status && options.status !== 'all') {
      // Only filter by isCompleted for 'completed' or 'partial'
      if (options.status === 'completed') {
        response.submissions = response.submissions.filter((sub: any) => sub.isCompleted === true);
      } else if (options.status === 'partial') {
        response.submissions = response.submissions.filter((sub: any) => sub.isCompleted === false);
      }
    }

    return this.createMockResponse(response);
  }

  /**
   * Mock GET /forms/:id/submissions/:submissionId endpoint
   */
  public async getSubmission(formId: string, submissionId: string): Promise<AxiosResponse<TallySubmission>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const submission = MockDataFixtures.createMockSubmission({
      id: submissionId,
      formId: formId,
    });
    return this.createMockResponse(submission);
  }

  /**
   * Mock GET /workspaces endpoint
   */
  public async getWorkspaces(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<AxiosResponse<TallyWorkspacesResponse>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const count = options.limit || 10;
    const response = MockDataFixtures.createMockWorkspacesResponse(Math.min(count, 5));
    return this.createMockResponse(response);
  }

  /**
   * Mock GET /workspaces/:id endpoint
   */
  public async getWorkspace(workspaceId: string): Promise<AxiosResponse<TallyWorkspace>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const workspace = MockDataFixtures.createMockWorkspace({ id: workspaceId });
    return this.createMockResponse(workspace);
  }

  /**
   * Mock POST /forms endpoint (create form)
   */
  public async createForm(formData: any): Promise<AxiosResponse<TallyForm>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const newForm = MockDataFixtures.createMockForm({
      id: `form_${Date.now()}`,
      name: formData.name || 'New Form',
      title: formData.title || 'New Form',
      description: formData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return this.createMockResponse(newForm, 201);
  }

  /**
   * Mock PUT /forms/:id endpoint (update form)
   */
  public async updateForm(formId: string, formData: any): Promise<AxiosResponse<TallyForm>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    const updatedForm = MockDataFixtures.createMockForm({
      id: formId,
      ...formData,
      updatedAt: new Date().toISOString(),
    });

    return this.createMockResponse(updatedForm);
  }

  /**
   * Mock DELETE /forms/:id endpoint
   */
  public async deleteForm(formId: string): Promise<AxiosResponse<{ success: boolean }>> {
    await this.simulateDelay();
    this.checkRateLimit();
    
    if (this.shouldSimulateError()) {
      this.simulateRandomError();
    }

    return this.createMockResponse({ success: true }, 204);
  }

  /**
   * Reset mock state
   */
  public reset(): void {
    this.requestCount = 0;
    this.rateLimitResetTime = Date.now() + 60000;
  }

  /**
   * Get mock statistics
   */
  public getStats(): {
    requestCount: number;
    rateLimitResetTime: number;
    config: MockConfig;
  } {
    return {
      requestCount: this.requestCount,
      rateLimitResetTime: this.rateLimitResetTime,
      config: this.getConfig(),
    };
  }
}

/**
 * Global mock instance
 */
export const tallyApiMock = new TallyApiMock();

/**
 * Helper function to enable/disable mocking
 */
export function enableMocking(enabled: boolean = true): void {
  tallyApiMock.updateConfig({ enabled });
}

/**
 * Helper function to configure mock behavior
 */
export function configureMock(config: Partial<MockConfig>): void {
  tallyApiMock.updateConfig(config);
}

/**
 * Helper function to reset mock state
 */
export function resetMock(): void {
  tallyApiMock.reset();
} 