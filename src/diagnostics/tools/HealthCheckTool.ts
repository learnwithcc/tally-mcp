import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult } from '../types';
import axios from 'axios';

export class HealthCheckTool extends BaseDiagnosticTool {
  name = 'Health Check';

  async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];

    results.push(await this.checkTallyConnectivity());
    results.push(await this.checkServerHealth());

    return this.createReport(results);
  }

  private async checkTallyConnectivity(): Promise<DiagnosticResult> {
    try {
      const tallyApiUrl = 'https://api.tally.so/v1'; // Using v1 endpoint
      const response = await axios.get(`${tallyApiUrl}/me`, {
        // A real request would need an Authorization header.
        // We expect a 401 Unauthorized, which still proves connectivity.
        validateStatus: (status) => status < 500,
      });

      if (response.status === 401) {
        return {
          check: 'Tally API Connectivity',
          status: 'passing',
          message: 'Successfully connected to Tally API (received expected 401 Unauthorized)',
        };
      }
      
      return {
          check: 'Tally API Connectivity',
          status: 'passing',
          message: `Successfully connected to Tally API with status: ${response.status}`,
        };

    } catch (error: any) {
      return {
        check: 'Tally API Connectivity',
        status: 'failing',
        message: 'Failed to connect to the Tally API.',
        details: error.message,
      };
    }
  }

  private async checkServerHealth(): Promise<DiagnosticResult> {
    // This assumes the diagnostic tool is run from a context that has the server's URL.
    // For now, let's assume it's running on the default port.
    const serverUrl = 'http://localhost:3001';
    try {
      const response = await axios.get(`${serverUrl}/health`);
      if (response.status === 200 && response.data.status === 'ok') {
        return {
          check: 'MCP Server Health',
          status: 'passing',
          message: 'MCP server is running and healthy.',
        };
      }
      return {
        check: 'MCP Server Health',
        status: 'failing',
        message: `MCP server health check failed with status ${response.status}.`,
        details: response.data,
      };
    } catch (error: any) {
      return {
        check: 'MCP Server Health',
        status: 'failing',
        message: 'Failed to connect to the MCP server health endpoint.',
        details: error.message,
      };
    }
  }
} 