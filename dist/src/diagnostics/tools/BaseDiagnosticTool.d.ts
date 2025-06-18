import { DiagnosticResult, DiagnosticReport, IDiagnosticTool } from '../types';
export declare abstract class BaseDiagnosticTool implements IDiagnosticTool {
    abstract name: string;
    abstract run(): Promise<DiagnosticReport>;
    protected createReport(results: DiagnosticResult[]): DiagnosticReport;
    private getOverallStatus;
}
//# sourceMappingURL=BaseDiagnosticTool.d.ts.map