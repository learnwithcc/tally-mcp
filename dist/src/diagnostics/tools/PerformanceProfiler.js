import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { TallyApiClient } from '../../services/TallyApiClient';
export class PerformanceProfiler extends BaseDiagnosticTool {
    constructor(apiClientConfig = {}) {
        super();
        this.name = 'PerformanceProfiler';
        this.description = 'Profiles API response times.';
        this.apiClient = new TallyApiClient(apiClientConfig);
    }
    async run() {
        const results = [];
        let overallStatus = 'passing';
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
    async profileGetWorkspaces() {
        const startTime = Date.now();
        try {
            await this.apiClient.getWorkspaces({ limit: 1 });
            const duration = Date.now() - startTime;
            let status = 'passing';
            if (duration > 1000) {
                status = 'warning';
            }
            return {
                check: 'API: getWorkspaces latency',
                status,
                message: `getWorkspaces responded in ${duration}ms.`,
                details: { duration, threshold: 1000 }
            };
        }
        catch (error) {
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
//# sourceMappingURL=PerformanceProfiler.js.map