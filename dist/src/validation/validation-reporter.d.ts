import { ValidationReport } from './types';
export interface ReportFormatOptions {
    detailed?: boolean;
    includeMetrics?: boolean;
    includeSummary?: boolean;
    includeToolResults?: boolean;
    maxErrorsPerTool?: number;
    colorize?: boolean;
}
export declare class ValidationReporter {
    private options;
    constructor(options?: ReportFormatOptions);
    generateTextReport(report: ValidationReport): string;
    generateJsonReport(report: ValidationReport): string;
    generateCsvReport(report: ValidationReport): string;
    private generateHeader;
    private generateSummary;
    private generateOverallResult;
    private generateToolResults;
    private generateMetrics;
    private generateConfiguration;
    private formatErrorForDisplay;
    private formatErrorAsCsv;
    private escapeCsvField;
    updateOptions(newOptions: Partial<ReportFormatOptions>): void;
    getOptions(): ReportFormatOptions;
}
//# sourceMappingURL=validation-reporter.d.ts.map