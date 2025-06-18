import { DiagnosticToolSuite } from '../diagnostics/DiagnosticToolSuite';
export class DiagnosticTool {
    constructor() {
        this.name = 'diagnostic_tool';
        this.description = 'Runs diagnostic checks on the application.';
        this.diagnosticSuite = new DiagnosticToolSuite();
    }
    async execute(args) {
        if (args.toolName) {
            return this.runSingleDiagnostic(args.toolName);
        }
        else {
            return this.runAllDiagnostics();
        }
    }
    async runAllDiagnostics() {
        return this.diagnosticSuite.runAll();
    }
    async runSingleDiagnostic(toolName) {
        return this.diagnosticSuite.runTool(toolName);
    }
}
//# sourceMappingURL=diagnostic-tool.js.map