import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
export declare class EnvironmentValidator extends BaseDiagnosticTool {
    readonly name = "EnvironmentValidator";
    readonly description = "Validates the runtime environment, dependencies, and system resources.";
    run(): Promise<DiagnosticReport>;
    private checkApiKey;
    private checkDependencies;
}
//# sourceMappingURL=EnvironmentValidator.d.ts.map