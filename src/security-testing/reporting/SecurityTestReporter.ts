/**
 * Security Test Reporter
 * 
 * Handles report generation and notifications for security test results
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../utils/logger';
import { 
  SecurityTestResult,
  SecurityTestReport,
  SecurityTestSummary,
  SecurityTestMetrics,
  ReportingConfig,
  SecurityTestConfig
} from '../types';

export class SecurityTestReporter {
  private logger: Logger;
  private config: ReportingConfig;
  private outputDir: string;
  private lastRunTime?: Date;

  constructor(config: ReportingConfig) {
    this.config = config;
    this.logger = new Logger({ component: 'SecurityTestReporter' });
    this.outputDir = config.outputDir || 'reports/security';
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Security Test Reporter');

    if (!this.config.enabled) {
      this.logger.info('Security Test Reporter disabled');
      return;
    }

    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });
      this.logger.info(`Reports will be saved to: ${this.outputDir}`);
    } catch (error) {
      this.logger.error('Failed to initialize Security Test Reporter', error);
      throw error;
    }
  }

  async generateReport(
    results: SecurityTestResult[], 
    summary: SecurityTestSummary,
    testConfig?: Partial<SecurityTestConfig>
  ): Promise<void> {
    this.logger.info('Generating security test report');

    if (!this.config.enabled) {
      return;
    }

    try {
      const report = await this.buildReport(results, summary, testConfig);
      const formats = this.config.formats || ['json', 'html'];

      // Generate reports in requested formats
      for (const format of formats) {
        await this.generateReportFormat(report, format);
      }

      // Send notifications if configured
      if (this.config.notifications) {
        await this.sendNotifications(report);
      }

      // Send webhooks if configured
      if (this.config.webhooks) {
        await this.sendWebhooks(report);
      }

      this.lastRunTime = new Date();
      this.logger.info('Security test report generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate security test report', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up Security Test Reporter');
    // No cleanup required
  }

  getLastRunTime(): Date | undefined {
    return this.lastRunTime;
  }

  private async buildReport(
    results: SecurityTestResult[], 
    summary: SecurityTestSummary,
    testConfig?: Partial<SecurityTestConfig>
  ): Promise<SecurityTestReport> {
    const metrics = this.calculateMetrics(results, summary);
    
    return {
      id: `security-report-${Date.now()}`,
      timestamp: new Date(),
      summary,
      results,
      metrics,
      config: testConfig || {},
      environment: {
        platform: process.platform,
        version: process.version,
        hostname: require('os').hostname(),
        user: process.env.USER || process.env.USERNAME || 'unknown'
      }
    };
  }

  private calculateMetrics(results: SecurityTestResult[], summary: SecurityTestSummary): SecurityTestMetrics {
    const vulnerabilities = results.filter(r => r.status === 'failed');
    
    return {
      testExecutionTime: summary.duration,
      vulnerabilitiesFound: vulnerabilities.length,
      criticalIssues: vulnerabilities.filter(v => v.severity === 'critical').length,
      highSeverityIssues: vulnerabilities.filter(v => v.severity === 'high').length,
      mediumSeverityIssues: vulnerabilities.filter(v => v.severity === 'medium').length,
      lowSeverityIssues: vulnerabilities.filter(v => v.severity === 'low').length,
      falsePositives: 0, // Would need manual classification
      coverage: this.calculateCoverage(results)
    };
  }

  private calculateCoverage(results: SecurityTestResult[]): number {
    // Simple coverage calculation based on test suites
    const suites = new Set(results.map(r => r.suite));
    const expectedSuites = ['custom', 'owasp-zap', 'snyk'];
    return (suites.size / expectedSuites.length) * 100;
  }

  private async generateReportFormat(report: SecurityTestReport, format: string): Promise<void> {
    const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-');
    const filename = `security-report-${timestamp}`;

    switch (format) {
      case 'json':
        await this.generateJSONReport(report, filename);
        break;
      case 'html':
        await this.generateHTMLReport(report, filename);
        break;
      case 'csv':
        await this.generateCSVReport(report, filename);
        break;
      case 'xml':
        await this.generateXMLReport(report, filename);
        break;
      case 'junit':
        await this.generateJUnitReport(report, filename);
        break;
      default:
        this.logger.warn(`Unsupported report format: ${format}`);
    }
  }

  private async generateJSONReport(report: SecurityTestReport, filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, `${filename}.json`);
    const content = JSON.stringify(report, null, 2);
    await fs.writeFile(filepath, content, 'utf8');
    this.logger.info(`JSON report saved: ${filepath}`);
  }

  private async generateHTMLReport(report: SecurityTestReport, filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, `${filename}.html`);
    const content = this.buildHTMLReport(report);
    await fs.writeFile(filepath, content, 'utf8');
    this.logger.info(`HTML report saved: ${filepath}`);
  }

  private async generateCSVReport(report: SecurityTestReport, filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, `${filename}.csv`);
    const content = this.buildCSVReport(report);
    await fs.writeFile(filepath, content, 'utf8');
    this.logger.info(`CSV report saved: ${filepath}`);
  }

  private async generateXMLReport(report: SecurityTestReport, filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, `${filename}.xml`);
    const content = this.buildXMLReport(report);
    await fs.writeFile(filepath, content, 'utf8');
    this.logger.info(`XML report saved: ${filepath}`);
  }

  private async generateJUnitReport(report: SecurityTestReport, filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, `${filename}.junit.xml`);
    const content = this.buildJUnitReport(report);
    await fs.writeFile(filepath, content, 'utf8');
    this.logger.info(`JUnit report saved: ${filepath}`);
  }

  private buildHTMLReport(report: SecurityTestReport): string {
    const { summary, results, metrics } = report;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4f8; padding: 15px; border-radius: 5px; text-align: center; }
        .results { margin: 20px 0; }
        .result { margin: 10px 0; padding: 15px; border-radius: 5px; }
        .failed { background: #ffe6e6; border-left: 4px solid #ff4444; }
        .passed { background: #e6ffe6; border-left: 4px solid #44ff44; }
        .warning { background: #fff5e6; border-left: 4px solid #ffaa44; }
        .severity { font-weight: bold; padding: 2px 8px; border-radius: 3px; color: white; }
        .critical { background: #cc0000; }
        .high { background: #ff4444; }
        .medium { background: #ffaa44; }
        .low { background: #4488ff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Test Report</h1>
        <p>Generated: ${report.timestamp.toISOString()}</p>
        <p>Duration: ${summary.duration}ms</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>${summary.totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric">
            <h3>${summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="metric">
            <h3>${summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h3>${metrics.vulnerabilitiesFound}</h3>
            <p>Vulnerabilities</p>
        </div>
    </div>
    
    <div class="results">
        <h2>Test Results</h2>
        ${results.map(result => `
            <div class="result ${result.status}">
                <h3>${result.name} <span class="severity ${result.severity}">${result.severity.toUpperCase()}</span></h3>
                <p><strong>Suite:</strong> ${result.suite}</p>
                <p><strong>Description:</strong> ${result.description}</p>
                ${result.details ? `<p><strong>Details:</strong> ${result.details}</p>` : ''}
                ${result.remediation ? `<p><strong>Remediation:</strong> ${result.remediation}</p>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  private buildCSVReport(report: SecurityTestReport): string {
    const headers = ['ID', 'Name', 'Suite', 'Status', 'Severity', 'Description', 'Duration'];
    const rows = report.results.map(result => [
      result.id,
      result.name,
      result.suite,
      result.status,
      result.severity,
      result.description.replace(/,/g, ';'),
      result.duration.toString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private buildXMLReport(report: SecurityTestReport): string {
    const results = report.results.map(result => `
    <test id="${result.id}" name="${result.name}" suite="${result.suite}" status="${result.status}" severity="${result.severity}" duration="${result.duration}">
      <description><![CDATA[${result.description}]]></description>
      ${result.details ? `<details><![CDATA[${result.details}]]></details>` : ''}
      ${result.remediation ? `<remediation><![CDATA[${result.remediation}]]></remediation>` : ''}
    </test>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<security-report timestamp="${report.timestamp.toISOString()}" id="${report.id}">
  <summary total="${report.summary.totalTests}" passed="${report.summary.passed}" failed="${report.summary.failed}" duration="${report.summary.duration}" />
  <tests>${results}
  </tests>
</security-report>`;
  }

  private buildJUnitReport(report: SecurityTestReport): string {
    const testCases = report.results.map(result => {
      const failure = result.status === 'failed' ? 
        `<failure message="${result.description}" type="${result.severity}">${result.details || ''}</failure>` : '';
      
      return `<testcase classname="${result.suite}" name="${result.name}" time="${result.duration / 1000}">${failure}</testcase>`;
    }).join('\n    ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Security Tests" tests="${report.summary.totalTests}" failures="${report.summary.failed}" time="${report.summary.duration / 1000}" timestamp="${report.timestamp.toISOString()}">
    ${testCases}
</testsuite>`;
  }

  private async sendNotifications(report: SecurityTestReport): Promise<void> {
    // Implementation would depend on notification providers
    this.logger.info('Sending notifications (not implemented)');
  }

  private async sendWebhooks(report: SecurityTestReport): Promise<void> {
    // Implementation would depend on webhook configuration
    this.logger.info('Sending webhooks (not implemented)');
  }
} 