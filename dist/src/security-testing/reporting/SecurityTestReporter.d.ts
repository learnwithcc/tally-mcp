import { SecurityTestResult, SecurityTestSummary, ReportingConfig, SecurityTestConfig } from '../types';
export declare class SecurityTestReporter {
    private logger;
    private config;
    private outputDir;
    private lastRunTime?;
    constructor(config: ReportingConfig);
    initialize(): Promise<void>;
    generateReport(results: SecurityTestResult[], summary: SecurityTestSummary, testConfig?: Partial<SecurityTestConfig>): Promise<void>;
    cleanup(): Promise<void>;
    getLastRunTime(): Date | undefined;
    private buildReport;
    private calculateMetrics;
    private calculateCoverage;
    private generateReportFormat;
    private generateJSONReport;
    private generateHTMLReport;
    private generateCSVReport;
    private generateXMLReport;
    private generateJUnitReport;
    private buildHTMLReport;
    private buildCSVReport;
    private buildXMLReport;
    private buildJUnitReport;
    private sendNotifications;
    private sendWebhooks;
}
//# sourceMappingURL=SecurityTestReporter.d.ts.map