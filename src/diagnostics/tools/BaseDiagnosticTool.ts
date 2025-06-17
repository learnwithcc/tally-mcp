import { DiagnosticResult, DiagnosticReport, IDiagnosticTool, DiagnosticStatus } from '../types';

export abstract class BaseDiagnosticTool implements IDiagnosticTool {
  abstract name: string;
  abstract run(): Promise<DiagnosticReport>;

  protected createReport(results: DiagnosticResult[]): DiagnosticReport {
    const overallStatus = this.getOverallStatus(results);
    return {
      tool: this.name,
      timestamp: new Date(),
      overallStatus,
      results,
    };
  }

  private getOverallStatus(results: DiagnosticResult[]): DiagnosticStatus {
    if (results.some(r => r.status === 'failing')) {
      return 'failing';
    }
    if (results.some(r => r.status === 'warning')) {
      return 'warning';
    }
    return 'passing';
  }
} 