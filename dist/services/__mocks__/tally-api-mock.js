"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tallyApiMock = exports.TallyApiMock = exports.MockDataFixtures = exports.DEFAULT_MOCK_CONFIG = void 0;
exports.enableMocking = enableMocking;
exports.configureMock = configureMock;
exports.resetMock = resetMock;
exports.DEFAULT_MOCK_CONFIG = {
    enabled: false,
    delay: 100,
    simulateErrors: false,
    errorRate: 0.1,
    simulateRateLimit: false,
    rateLimitThreshold: 100,
};
class MockDataFixtures {
    static createMockForm(overrides = {}) {
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
    static createMockFormsResponse(count = 3) {
        const forms = [];
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
    static createMockSubmission(overrides = {}) {
        const base = {
            id: 'sub_123456789',
            formId: 'form_123456789',
            isCompleted: true,
            submittedAt: '2024-01-01T12:00:00Z',
            responses: [
                { questionId: 'q1', value: 'John Doe' },
                { questionId: 'q2', value: 'john.doe@example.com' },
                { questionId: 'q3', value: 'I would like to learn more about your services.' },
            ],
            ...overrides,
        };
        return {
            ...base,
            respondentId: overrides.respondentId ?? 'resp_123456789',
        };
    }
    static createMockSubmissionsResponse(count = 5) {
        const submissions = [];
        for (let i = 1; i <= count; i++) {
            submissions.push(this.createMockSubmission({
                id: `sub_${i.toString().padStart(9, '0')}`,
                respondentId: `resp_${i.toString().padStart(9, '0')}`,
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
    static createMockWorkspace(overrides = {}) {
        return {
            id: 'workspace_123',
            name: 'My Workspace',
            description: 'Default workspace for testing',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            ...overrides,
        };
    }
    static createMockWorkspacesResponse(count = 2) {
        const workspaces = [];
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
exports.MockDataFixtures = MockDataFixtures;
class TallyApiMock {
    constructor(config = {}) {
        this.requestCount = 0;
        this.rateLimitResetTime = Date.now() + 60000;
        this.config = { ...exports.DEFAULT_MOCK_CONFIG, ...config };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    async simulateDelay() {
        if (this.config.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.config.delay));
        }
    }
    shouldSimulateError() {
        return this.config.simulateErrors && Math.random() < this.config.errorRate;
    }
    checkRateLimit() {
        if (!this.config.simulateRateLimit)
            return;
        this.requestCount++;
        if (Date.now() > this.rateLimitResetTime) {
            this.requestCount = 1;
            this.rateLimitResetTime = Date.now() + 60000;
        }
        if (this.requestCount > this.config.rateLimitThreshold) {
            const error = new Error('Rate limit exceeded');
            error.response = {
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
    simulateRandomError() {
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
        const randomError = errors[idx] || errors[0];
        const error = new Error(randomError.message);
        error.response = {
            status: randomError.status,
            statusText: randomError.message,
            data: {
                error: randomError.message,
                message: `Simulated ${randomError.message} error`,
            },
        };
        throw error;
    }
    createMockResponse(data, status = 200) {
        return {
            data,
            status,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json',
                'x-request-id': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
            config: {},
        };
    }
    async getForms(options = {}) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const count = options.limit || 10;
        const response = MockDataFixtures.createMockFormsResponse(count);
        if (options.workspaceId) {
            response.forms = response.forms.filter((form) => form.workspaceId === options.workspaceId);
        }
        return this.createMockResponse(response);
    }
    async getForm(formId) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const form = MockDataFixtures.createMockForm({ id: formId });
        return this.createMockResponse(form);
    }
    async getSubmissions(_formId, options = {}) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const count = options.limit || 10;
        const response = MockDataFixtures.createMockSubmissionsResponse(count);
        if (options.status && options.status !== 'all') {
            if (options.status === 'completed') {
                response.submissions = response.submissions.filter((sub) => sub.isCompleted === true);
            }
            else if (options.status === 'partial') {
                response.submissions = response.submissions.filter((sub) => sub.isCompleted === false);
            }
        }
        return this.createMockResponse(response);
    }
    async getSubmission(formId, submissionId) {
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
    async getWorkspaces(options = {}) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const count = options.limit || 10;
        const response = MockDataFixtures.createMockWorkspacesResponse(Math.min(count, 5));
        return this.createMockResponse(response);
    }
    async getWorkspace(workspaceId) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const workspace = MockDataFixtures.createMockWorkspace({ id: workspaceId });
        return this.createMockResponse(workspace);
    }
    async createForm(formData) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        const newForm = MockDataFixtures.createMockForm({
            id: `form_${Date.now()}`,
            title: formData.title || formData.name || 'New Form',
            description: formData.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return this.createMockResponse(newForm, 201);
    }
    async updateForm(formId, formData) {
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
    async deleteForm(_formId) {
        await this.simulateDelay();
        this.checkRateLimit();
        if (this.shouldSimulateError()) {
            this.simulateRandomError();
        }
        return this.createMockResponse({ success: true }, 204);
    }
    reset() {
        this.requestCount = 0;
        this.rateLimitResetTime = Date.now() + 60000;
    }
    getStats() {
        return {
            requestCount: this.requestCount,
            rateLimitResetTime: this.rateLimitResetTime,
            config: this.getConfig(),
        };
    }
}
exports.TallyApiMock = TallyApiMock;
exports.tallyApiMock = new TallyApiMock();
function enableMocking(enabled = true) {
    exports.tallyApiMock.updateConfig({ enabled });
}
function configureMock(config) {
    exports.tallyApiMock.updateConfig(config);
}
function resetMock() {
    exports.tallyApiMock.reset();
}
//# sourceMappingURL=tally-api-mock.js.map