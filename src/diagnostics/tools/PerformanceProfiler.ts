import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult, DiagnosticStatus } from '../types';
import { TallyApiClient, TallyApiClientConfig } from '../../services/TallyApiClient';

export class PerformanceProfiler extends BaseDiagnosticTool {
  public readonly name = 'PerformanceProfiler';
  public readonly description = 'Profiles API response times.';
  
  private apiClient: TallyApiClient;

  constructor(apiClientConfig: TallyApiClientConfig = {}) {
    super();
    this.apiClient = new TallyApiClient(apiClientConfig);
  }

  public async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    let overallStatus: DiagnosticStatus = 'passing';

    // Profile the getWorkspaces endpoint
    const profileResult = await this.profileGetWorkspaces();
    results.push(profileResult);

    if (profileResult.status !== 'passing') {
        overallStatus = profileResult.status;
    }

    return {
      tool: this.name,
      timestamp: new Date(),
      overallStatus,
      results,
    };
  }

  private async profileGetWorkspaces(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    try {
      await this.apiClient.getWorkspaces({ limit: 1 });
      const duration = Date.now() - startTime;

      let status: DiagnosticStatus = 'passing';
      if (duration > 1000) { // More than 1 second is a warning
          status = 'warning';
      }

      return {
        check: 'API: getWorkspaces latency',
        status,
        message: `getWorkspaces responded in ${duration}ms.`,
        details: { duration, threshold: 1000 }
      };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            check: 'API: getWorkspaces latency',
            status: 'failing',
            message: 'Failed to call getWorkspaces.',
            details: { 
                duration,
                error: error instanceof Error ? error.message : String(error)
            },
        };
    }
  }
} 