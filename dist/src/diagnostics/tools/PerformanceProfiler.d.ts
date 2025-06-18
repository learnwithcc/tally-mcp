import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
import { TallyApiClientConfig } from '../../services/TallyApiClient';
export declare class PerformanceProfiler extends BaseDiagnosticTool {
    readonly name = "PerformanceProfiler";
    readonly description = "Profiles API response times.";
    private apiClient;
    constructor(apiClientConfig?: TallyApiClientConfig);
    run(): Promise<DiagnosticReport>;
    private profileGetWorkspaces;
}
//# sourceMappingURL=PerformanceProfiler.d.ts.map