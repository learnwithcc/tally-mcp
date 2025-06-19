import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult, DiagnosticStatus } from '../types';
import fs from 'fs';
import path from 'path';

export class LogAnalyzer extends BaseDiagnosticTool {
  public readonly name = 'LogAnalyzer';
  public readonly description = 'Analyzes application logs for errors and patterns.';

  // In a real implementation, this would be configurable
  private logFilePath = path.resolve(process.cwd(), 'logs/app.log');

  public async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    let overallStatus: DiagnosticStatus = 'passing';

    const logFileResult = this.checkLogFile();
    results.push(logFileResult);

    if (logFileResult.status !== 'passing') {
        overallStatus = logFileResult.status;
    } else {
        // If the log file exists, we could analyze it.
        // For now, we'll just report that it's present.
    }

    return {
      tool: this.name,
      timestamp: new Date(),
      overallStatus,
      results,
    };
  }

  private checkLogFile(): DiagnosticResult {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        return {
          check: 'Log File Existence',
          status: 'passing',
          message: `Log file found at ${this.logFilePath}.`,
          details: { 
              size: stats.size,
              lastModified: stats.mtime
          }
        };
      } else {
        return {
          check: 'Log File Existence',
          status: 'warning',
          message: `Log file not found at ${this.logFilePath}.`,
          details: 'Logging may not be configured or no logs have been generated yet.'
        };
      }
    } catch (error) {
      return {
        check: 'Log File Existence',
        status: 'failing',
        message: 'Error checking for log file.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
} 