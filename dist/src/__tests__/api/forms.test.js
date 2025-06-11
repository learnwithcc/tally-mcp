import { TallyApiClient } from '../../services/TallyApiClient';
import { env } from '../../config/env';
import { TallyFormsResponseSchema, TallyFormSchema, TallySubmissionsResponseSchema } from '../../models';
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios;
describe('Tally API Client - Forms', () => {
    let client;
    beforeEach(() => {
        const mock = {
            request: jest.fn(),
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() },
            },
            defaults: { headers: { common: {} } },
        };
        mockedAxios.create.mockReturnValue(mock);
        client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
    });
    it('should fetch forms and validate the response', async () => {
        const mockFormsResponse = {
            forms: [
                { id: 'form1', name: 'Test Form 1', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z', title: 'Test Form 1' },
                { id: 'form2', name: 'Test Form 2', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z', title: 'Test Form 2' },
            ],
        };
        jest.spyOn(client, 'getForms').mockResolvedValue(mockFormsResponse);
        const forms = await client.getForms();
        expect(TallyFormsResponseSchema.safeParse(forms).success).toBe(true);
        expect(forms.forms).toEqual(mockFormsResponse.forms);
    });
    it('should fetch a single form and validate the response', async () => {
        const formId = 'form123';
        const mockFormResponse = {
            id: formId,
            title: 'Test Form',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
        };
        jest.spyOn(client, 'getForm').mockResolvedValue(mockFormResponse);
        const form = await client.getForm(formId);
        expect(TallyFormSchema.safeParse(form).success).toBe(true);
        expect(form).toEqual(mockFormResponse);
    });
    it('should fetch form submissions and validate the response', async () => {
        const formId = 'form123';
        const mockSubmissionsResponse = {
            submissions: [
                {
                    id: 'sub1',
                    formId: formId,
                    respondentId: 'resp1',
                    submittedAt: '2025-01-01T00:00:00.000Z',
                    isCompleted: true,
                    responses: [],
                },
            ],
            questions: [],
            page: 1,
            limit: 50,
            hasMore: false,
            totalNumberOfSubmissionsPerFilter: { all: 1, completed: 1, partial: 0 },
        };
        jest.spyOn(client, 'getSubmissions').mockResolvedValue(mockSubmissionsResponse);
        const submissions = await client.getSubmissions(formId);
        expect(TallySubmissionsResponseSchema.safeParse(submissions).success).toBe(true);
        expect(submissions).toEqual(mockSubmissionsResponse);
    });
});
//# sourceMappingURL=forms.test.js.map