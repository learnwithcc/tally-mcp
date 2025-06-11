import { SubmissionService } from '../services';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
export class SubmissionAnalysisTool {
    constructor(apiClientConfig = {}) {
        this.submissionService = new SubmissionService(apiClientConfig);
    }
    async analyze(formId, filters = {}) {
        const response = await this.submissionService.getFormSubmissions(formId, filters);
        const totalSubmissions = response.totalNumberOfSubmissionsPerFilter.all;
        const completedSubmissions = response.totalNumberOfSubmissionsPerFilter.completed;
        const completionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0;
        return {
            totalSubmissions,
            completionRate,
        };
    }
    async list(formId, filters = {}) {
        const response = await this.submissionService.getFormSubmissions(formId, filters);
        return response.submissions;
    }
    async filterByDateRange(formId, startDate, endDate) {
        return this.list(formId, { startDate, endDate });
    }
    async filterByStatus(formId, status) {
        return this.list(formId, { status });
    }
    async formatForAnalysis(formId, filters = {}) {
        const response = await this.submissionService.getFormSubmissions(formId, filters);
        const questions = response.questions;
        const submissions = response.submissions;
        const questionMap = new Map(questions.map(q => [q.id, q.title]));
        return submissions.map(sub => ({
            submissionId: sub.id,
            submittedAt: sub.submittedAt,
            isCompleted: sub.isCompleted,
            responses: sub.responses.map(res => ({
                questionTitle: questionMap.get(res.questionId) || 'Unknown Question',
                answer: res.value,
            })),
        }));
    }
    async getAverageRating(formId, questionTitle, filters = {}) {
        const formattedSubmissions = await this.formatForAnalysis(formId, filters);
        let totalRating = 0;
        let ratingCount = 0;
        for (const sub of formattedSubmissions) {
            for (const res of sub.responses) {
                if (res.questionTitle === questionTitle && typeof res.answer === 'number') {
                    totalRating += res.answer;
                    ratingCount++;
                }
            }
        }
        return ratingCount > 0 ? totalRating / ratingCount : null;
    }
    async getResponseDistribution(formId, questionTitle, filters = {}) {
        const formattedSubmissions = await this.formatForAnalysis(formId, filters);
        const distribution = {};
        for (const sub of formattedSubmissions) {
            for (const res of sub.responses) {
                if (res.questionTitle === questionTitle) {
                    const answer = String(res.answer);
                    distribution[answer] = (distribution[answer] || 0) + 1;
                }
            }
        }
        return distribution;
    }
    async exportToCSV(formId, filePath, filters = {}) {
        const formattedSubmissions = await this.formatForAnalysis(formId, filters);
        if (formattedSubmissions.length === 0) {
            return;
        }
        const flattenedData = formattedSubmissions.flatMap(sub => sub.responses.map(res => ({
            submissionId: sub.submissionId,
            submittedAt: sub.submittedAt,
            isCompleted: sub.isCompleted,
            questionTitle: res.questionTitle,
            answer: res.answer
        })));
        const csv = Papa.unparse(flattenedData);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, csv);
    }
    async exportToJSON(formId, filePath, filters = {}) {
        const formattedSubmissions = await this.formatForAnalysis(formId, filters);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(formattedSubmissions, null, 2));
    }
    async search(formId, query, filters = {}) {
        const formattedSubmissions = await this.formatForAnalysis(formId, filters);
        const lowerCaseQuery = query.toLowerCase();
        return formattedSubmissions.filter(sub => sub.responses.some(res => String(res.answer).toLowerCase().includes(lowerCaseQuery)));
    }
}
//# sourceMappingURL=submission-tool.js.map