import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import axios from 'axios';
export class HealthCheckTool extends BaseDiagnosticTool {
    constructor() {
        super(...arguments);
        this.name = 'Health Check';
    }
    async run() {
        const results = [];
        results.push(await this.checkTallyConnectivity());
        results.push(await this.checkServerHealth());
        return this.createReport(results);
    }
    async checkTallyConnectivity() {
        try {
            const tallyApiUrl = 'https://api.tally.so/v1';
            const response = await axios.get(`${tallyApiUrl}/me`, {
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
        }
        catch (error) {
            return {
                check: 'Tally API Connectivity',
                status: 'failing',
                message: 'Failed to connect to the Tally API.',
                details: error.message,
            };
        }
    }
    async checkServerHealth() {
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
        }
        catch (error) {
            return {
                check: 'MCP Server Health',
                status: 'failing',
                message: 'Failed to connect to the MCP server health endpoint.',
                details: error.message,
            };
        }
    }
}
//# sourceMappingURL=HealthCheckTool.js.map