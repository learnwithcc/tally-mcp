import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
export declare class HealthCheckTool extends BaseDiagnosticTool {
    name: string;
    run(): Promise<DiagnosticReport>;
    private checkTallyConnectivity;
    private checkServerHealth;
}
//# sourceMappingURL=HealthCheckTool.d.ts.map