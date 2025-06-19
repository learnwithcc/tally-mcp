import { DiagnosticReport } from './types';
export declare class DiagnosticToolSuite {
    private tools;
    constructor();
    runAll(): Promise<DiagnosticReport[]>;
    runTool(toolName: string): Promise<DiagnosticReport | undefined>;
}
//# sourceMappingURL=DiagnosticToolSuite.d.ts.map