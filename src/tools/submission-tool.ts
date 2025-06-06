import { SubmissionService } from '../services';
import { SubmissionFilters, TallySubmission, SubmissionStatusFilter, TallyQuestion } from '../models';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface SubmissionAnalysis {
  totalSubmissions: number;
  completionRate: number;
  averageResponseTime?: number; // Optional: to be implemented later
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

export class SubmissionAnalysisTool {
  private submissionService: SubmissionService;

  constructor(apiClientConfig: TallyApiClientConfig = {}) {
    this.submissionService = new SubmissionService(apiClientConfig);
  }

  public async analyze(formId: string, filters: SubmissionFilters = {}): Promise<SubmissionAnalysis> {
    const response = await this.submissionService.getFormSubmissions(formId, filters);
    
    const totalSubmissions = response.totalNumberOfSubmissionsPerFilter.all;
    const completedSubmissions = response.totalNumberOfSubmissionsPerFilter.completed;

    const completionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0;

    return {
      totalSubmissions,
      completionRate,
    };
  }

  public async list(formId: string, filters: SubmissionFilters = {}): Promise<TallySubmission[]> {
    const response = await this.submissionService.getFormSubmissions(formId, filters);
    return response.submissions;
  }

  public async filterByDateRange(formId: string, startDate: string, endDate: string): Promise<TallySubmission[]> {
    return this.list(formId, { startDate, endDate });
  }

  public async filterByStatus(formId: string, status: SubmissionStatusFilter): Promise<TallySubmission[]> {
    return this.list(formId, { status });
  }

  public async formatForAnalysis(formId: string, filters: SubmissionFilters = {}): Promise<FormattedSubmission[]> {
    const response = await this.submissionService.getFormSubmissions(formId, filters);
    const questions = response.questions;
    const submissions = response.submissions;

    const questionMap = new Map<string, string>(questions.map(q => [q.id, q.title]));

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

  public async getAverageRating(formId: string, questionTitle: string, filters: SubmissionFilters = {}): Promise<number | null> {
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

  public async getResponseDistribution(formId: string, questionTitle: string, filters: SubmissionFilters = {}): Promise<Record<string, number>> {
    const formattedSubmissions = await this.formatForAnalysis(formId, filters);
    const distribution: Record<string, number> = {};

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

  public async exportToCSV(formId: string, filePath: string, filters: SubmissionFilters = {}): Promise<void> {
    const formattedSubmissions = await this.formatForAnalysis(formId, filters);
    if (formattedSubmissions.length === 0) {
      return;
    }

    // Flatten the data for CSV
    const flattenedData = formattedSubmissions.flatMap(sub => 
      sub.responses.map(res => ({
        submissionId: sub.submissionId,
        submittedAt: sub.submittedAt,
        isCompleted: sub.isCompleted,
        questionTitle: res.questionTitle,
        answer: res.answer
      }))
    );

    const csv = Papa.unparse(flattenedData);
    
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, csv);
  }

  public async exportToJSON(formId: string, filePath: string, filters: SubmissionFilters = {}): Promise<void> {
    const formattedSubmissions = await this.formatForAnalysis(formId, filters);
    
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(formattedSubmissions, null, 2));
  }

  public async search(formId: string, query: string, filters: SubmissionFilters = {}): Promise<FormattedSubmission[]> {
    const formattedSubmissions = await this.formatForAnalysis(formId, filters);
    const lowerCaseQuery = query.toLowerCase();

    return formattedSubmissions.filter(sub => 
      sub.responses.some(res => 
        String(res.answer).toLowerCase().includes(lowerCaseQuery)
      )
    );
  }
} 