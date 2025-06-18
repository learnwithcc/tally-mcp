export type DiagnosticStatus = 'passing' | 'failing' | 'warning';
export interface DiagnosticResult {
    check: string;
    status: DiagnosticStatus;
    message: string;
    details?: any;
}
export interface DiagnosticReport {
    tool: string;
    timestamp: Date;
    overallStatus: DiagnosticStatus;
    results: DiagnosticResult[];
}
export interface IDiagnosticTool {
    name: string;
    run(): Promise<DiagnosticReport>;
}
//# sourceMappingURL=types.d.ts.map