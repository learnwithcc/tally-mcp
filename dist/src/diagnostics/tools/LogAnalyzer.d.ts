import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
export declare class LogAnalyzer extends BaseDiagnosticTool {
    readonly name = "LogAnalyzer";
    readonly description = "Analyzes application logs for errors and patterns.";
    private logFilePath;
    run(): Promise<DiagnosticReport>;
    private checkLogFile;
}
//# sourceMappingURL=LogAnalyzer.d.ts.map