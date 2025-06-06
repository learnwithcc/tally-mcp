import { SubmissionFilters, TallySubmission, SubmissionStatusFilter } from '../models';
import { TallyApiClientConfig } from '../services/TallyApiClient';
interface SubmissionAnalysis {
    totalSubmissions: number;
    completionRate: number;
    averageResponseTime?: number;
}
export interface FormattedSubmission {
    submissionId: string;
    submittedAt: string;
    isCompleted: boolean;
    responses: {
        questionTitle: string;
        answer: any;
    }[];
}
export declare class SubmissionAnalysisTool {
    private submissionService;
    constructor(apiClientConfig?: TallyApiClientConfig);
    analyze(formId: string, filters?: SubmissionFilters): Promise<SubmissionAnalysis>;
    list(formId: string, filters?: SubmissionFilters): Promise<TallySubmission[]>;
    filterByDateRange(formId: string, startDate: string, endDate: string): Promise<TallySubmission[]>;
    filterByStatus(formId: string, status: SubmissionStatusFilter): Promise<TallySubmission[]>;
    formatForAnalysis(formId: string, filters?: SubmissionFilters): Promise<FormattedSubmission[]>;
    getAverageRating(formId: string, questionTitle: string, filters?: SubmissionFilters): Promise<number | null>;
    getResponseDistribution(formId: string, questionTitle: string, filters?: SubmissionFilters): Promise<Record<string, number>>;
    exportToCSV(formId: string, filePath: string, filters?: SubmissionFilters): Promise<void>;
    exportToJSON(formId: string, filePath: string, filters?: SubmissionFilters): Promise<void>;
    search(formId: string, query: string, filters?: SubmissionFilters): Promise<FormattedSubmission[]>;
}
export {};
//# sourceMappingURL=submission-tool.d.ts.map