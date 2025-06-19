import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { TallyApiClient } from '../../services/TallyApiClient';
export class APIConnectivityTester extends BaseDiagnosticTool {
    constructor() {
        super();
        this.name = 'API Connectivity Tester';
        const apiKey = process.env.DIAGNOSTIC_TALLY_API_KEY || '';
        this.client = new TallyApiClient({
            accessToken: apiKey,
        });
    }
    async run() {
        const results = [];
        results.push(await this.testGetWorkspaces());
        return this.createReport(results);
    }
    async testGetWorkspaces() {
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
        }
        catch (error) {
            return {
                check: 'Get Workspaces',
                status: 'failing',
                message: 'Failed to retrieve workspaces from Tally API.',
                details: error.message,
            };
        }
    }
}
//# sourceMappingURL=APIConnectivityTester.js.map