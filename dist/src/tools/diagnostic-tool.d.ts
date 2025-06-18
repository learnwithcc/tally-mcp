import { Tool } from './tool';
import { DiagnosticReport } from '../diagnostics/types';
export interface DiagnosticToolArgs {
    toolName?: string;
}
export type DiagnosticToolResult = DiagnosticReport[] | DiagnosticReport | undefined;
export declare class DiagnosticTool implements Tool<DiagnosticToolArgs, DiagnosticToolResult> {
    readonly name = "diagnostic_tool";
    readonly description = "Runs diagnostic checks on the application.";
    private diagnosticSuite;
    constructor();
    execute(args: DiagnosticToolArgs): Promise<DiagnosticToolResult>;
    runAllDiagnostics(): Promise<DiagnosticReport[]>;
    runSingleDiagnostic(toolName: string): Promise<DiagnosticReport | undefined>;
}
//# sourceMappingURL=diagnostic-tool.d.ts.map