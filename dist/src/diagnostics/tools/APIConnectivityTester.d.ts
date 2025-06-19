import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
export declare class APIConnectivityTester extends BaseDiagnosticTool {
    name: string;
    private client;
    constructor();
    run(): Promise<DiagnosticReport>;
    private testGetWorkspaces;
}
//# sourceMappingURL=APIConnectivityTester.d.ts.map