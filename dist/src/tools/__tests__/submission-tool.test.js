import { SubmissionAnalysisTool } from '../submission-tool';
import { SubmissionService } from '../../services';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
jest.mock('../../services');
const MockedSubmissionService = SubmissionService;
const mockSubmissionsResponse = {
    page: 1,
    limit: 50,
    hasMore: false,
    totalNumberOfSubmissionsPerFilter: {
        all: 2,
        completed: 1,
        partial: 1,
    },
    questions: [],
    submissions: [
        { id: 'sub1', formId: 'form1', respondentId: 'resp1', isCompleted: true, submittedAt: '2024-01-01T12:00:00Z', responses: [] },
        { id: 'sub2', formId: 'form1', respondentId: 'resp2', isCompleted: false, submittedAt: '2024-01-02T12:00:00Z', responses: [] },
    ],
};
describe('SubmissionAnalysisTool', () => {
    let tool;
    let submissionService;
    beforeEach(() => {
        MockedSubmissionService.mockClear();
        MockedSubmissionService.prototype.getFormSubmissions = jest.fn().mockResolvedValue(mockSubmissionsResponse);
        tool = new SubmissionAnalysisTool();
        submissionService = MockedSubmissionService.mock.instances[0];
    });
    describe('filterByDateRange', () => {
        it('should call SubmissionService.getFormSubmissions with the correct date range', async () => {
            const formId = 'form1';
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            await tool.filterByDateRange(formId, startDate, endDate);
            expect(submissionService.getFormSubmissions).toHaveBeenCalledWith(formId, { startDate, endDate });
        });
        it('should return the submissions from the service', async () => {
            const formId = 'form1';
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            const result = await tool.filterByDateRange(formId, startDate, endDate);
            expect(result).toEqual(mockSubmissionsResponse.submissions);
        });
    });
    describe('filterByStatus', () => {
        it('should call SubmissionService.getFormSubmissions with the correct status', async () => {
            const formId = 'form1';
            const status = 'completed';
            await tool.filterByStatus(formId, status);
            expect(submissionService.getFormSubmissions).toHaveBeenCalledWith(formId, { status });
        });
        it('should return the submissions from the service', async () => {
            const formId = 'form1';
            const status = 'completed';
            const result = await tool.filterByStatus(formId, status);
            expect(result).toEqual(mockSubmissionsResponse.submissions);
        });
    });
    describe('analyze', () => {
        it('should correctly analyze the submissions response', async () => {
            const formId = 'form1';
            const analysis = await tool.analyze(formId);
            expect(submissionService.getFormSubmissions).toHaveBeenCalledWith(formId, {});
            expect(analysis).toEqual({
                totalSubmissions: 2,
                completionRate: 50,
            });
        });
    });
    describe('formatForAnalysis', () => {
        it('should correctly format submissions for analysis', async () => {
            const formId = 'form1';
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q1', type: 'INPUT_TEXT', title: 'Your Name', fields: [] }],
                submissions: [
                    {
                        id: 'sub1',
                        formId: 'form1',
                        respondentId: 'resp1',
                        isCompleted: true,
                        submittedAt: '2024-01-01T12:00:00Z',
                        responses: [{ questionId: 'q1', value: 'John Doe' }]
                    },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            const formatted = await tool.formatForAnalysis(formId);
            expect(submissionService.getFormSubmissions).toHaveBeenCalledWith(formId, {});
            expect(formatted).toEqual([
                {
                    submissionId: 'sub1',
                    submittedAt: '2024-01-01T12:00:00Z',
                    isCompleted: true,
                    responses: [
                        { questionTitle: 'Your Name', answer: 'John Doe' }
                    ]
                }
            ]);
        });
    });
    describe('getAverageRating', () => {
        it('should calculate the average rating for a numeric question', async () => {
            const formId = 'form1';
            const questionTitle = 'Satisfaction Score';
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q_rating', type: 'RATING', title: questionTitle, fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_rating', value: 5 }] },
                    { id: 'sub2', formId, respondentId: 'r2', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_rating', value: 3 }] },
                    { id: 'sub3', formId, respondentId: 'r3', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_rating', value: 4 }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            const average = await tool.getAverageRating(formId, questionTitle);
            expect(average).toBe(4);
        });
        it('should return null if no numeric ratings are found', async () => {
            const formId = 'form1';
            const questionTitle = 'Satisfaction Score';
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q_rating', type: 'RATING', title: questionTitle, fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_rating', value: 'Good' }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            const average = await tool.getAverageRating(formId, questionTitle);
            expect(average).toBeNull();
        });
    });
    describe('getResponseDistribution', () => {
        it('should calculate the response distribution for a question', async () => {
            const formId = 'form1';
            const questionTitle = 'Favorite Color';
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q_color', type: 'MULTIPLE_CHOICE', title: questionTitle, fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_color', value: 'Blue' }] },
                    { id: 'sub2', formId, respondentId: 'r2', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_color', value: 'Red' }] },
                    { id: 'sub3', formId, respondentId: 'r3', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q_color', value: 'Blue' }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            const distribution = await tool.getResponseDistribution(formId, questionTitle);
            expect(distribution).toEqual({ Blue: 2, Red: 1 });
        });
    });
    describe('exportToCSV', () => {
        it('should export formatted submissions to a CSV file', async () => {
            const formId = 'form1';
            const filePath = path.join(__dirname, 'test_export.csv');
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q1', type: 'INPUT_TEXT', title: 'Name', fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '2024-01-01T00:00:00Z', responses: [{ questionId: 'q1', value: 'Alice' }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            await tool.exportToCSV(formId, filePath);
            expect(fs.existsSync(filePath)).toBe(true);
            const csvContent = fs.readFileSync(filePath, 'utf-8');
            const parsed = Papa.parse(csvContent, { header: true });
            expect(parsed.data).toEqual([
                {
                    submissionId: 'sub1',
                    submittedAt: '2024-01-01T00:00:00Z',
                    isCompleted: 'true',
                    questionTitle: 'Name',
                    answer: 'Alice'
                }
            ]);
            fs.unlinkSync(filePath);
        });
    });
    describe('exportToJSON', () => {
        it('should export formatted submissions to a JSON file', async () => {
            const formId = 'form1';
            const filePath = path.join(__dirname, 'test_export.json');
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q1', type: 'INPUT_TEXT', title: 'Name', fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '2024-01-01T00:00:00Z', responses: [{ questionId: 'q1', value: 'Alice' }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            await tool.exportToJSON(formId, filePath);
            expect(fs.existsSync(filePath)).toBe(true);
            const jsonContent = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(jsonContent);
            expect(parsed).toEqual([
                {
                    submissionId: 'sub1',
                    submittedAt: '2024-01-01T00:00:00Z',
                    isCompleted: true,
                    responses: [
                        { questionTitle: 'Name', answer: 'Alice' }
                    ]
                }
            ]);
            fs.unlinkSync(filePath);
        });
    });
    describe('search', () => {
        it('should return submissions matching the search query', async () => {
            const formId = 'form1';
            const query = 'bob';
            const localMockResponse = {
                ...mockSubmissionsResponse,
                questions: [{ id: 'q1', type: 'INPUT_TEXT', title: 'Name', fields: [] }],
                submissions: [
                    { id: 'sub1', formId, respondentId: 'r1', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q1', value: 'Alice' }] },
                    { id: 'sub2', formId, respondentId: 'r2', isCompleted: true, submittedAt: '', responses: [{ questionId: 'q1', value: 'Bob' }] },
                ]
            };
            submissionService.getFormSubmissions.mockResolvedValue(localMockResponse);
            const results = await tool.search(formId, query);
            expect(results.length).toBe(1);
            expect(results[0].submissionId).toBe('sub2');
        });
    });
});
//# sourceMappingURL=submission-tool.test.js.map