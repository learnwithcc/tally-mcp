import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult } from '../types';
import { TallyApiClient } from '../../services/TallyApiClient';

export class APIConnectivityTester extends BaseDiagnosticTool {
  name = 'API Connectivity Tester';
  private client: TallyApiClient;

  constructor() {
    super();
    // The API key should be securely provided, e.g., from env vars.
    // This is a placeholder for where the key would be configured.
    const apiKey = process.env.DIAGNOSTIC_TALLY_API_KEY || '';
    
    this.client = new TallyApiClient({
      accessToken: apiKey,
    });
  }

  async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    results.push(await this.testGetWorkspaces());
    return this.createReport(results);
  }

  private async testGetWorkspaces(): Promise<DiagnosticResult> {
    try {
      const workspaces = await this.client.getWorkspaces();
      if (workspaces.workspaces) {
        return {
          check: 'Get Workspaces',
          status: 'passing',
          message: `Successfully retrieved ${workspaces.workspaces.length} workspaces.`,
        };
      }
      return {
        check: 'Get Workspaces',
        status: 'warning',
        message: 'Get workspaces call succeeded but returned no data.',
      };
    } catch (error: any) {
      return {
        check: 'Get Workspaces',
        status: 'failing',
        message: 'Failed to retrieve workspaces from Tally API.',
        details: error.message,
      };
    }
  }
} 