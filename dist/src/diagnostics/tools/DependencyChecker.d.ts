import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
export declare class DependencyChecker extends BaseDiagnosticTool {
    readonly name = "DependencyChecker";
    readonly description = "Checks for dependency-related issues.";
    run(): Promise<DiagnosticReport>;
    private checkNodeModules;
}
//# sourceMappingURL=DependencyChecker.d.ts.map