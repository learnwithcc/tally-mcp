import { Tool } from './tool';
import { DiagnosticToolSuite } from '../diagnostics/DiagnosticToolSuite';
import { DiagnosticReport } from '../diagnostics/types';

export interface DiagnosticToolArgs {
    toolName?: string;
}

export type DiagnosticToolResult = DiagnosticReport[] | DiagnosticReport | undefined;

export class DiagnosticTool implements Tool<DiagnosticToolArgs, DiagnosticToolResult> {
  public readonly name = 'diagnostic_tool';
  public readonly description = 'Runs diagnostic checks on the application.';
  
  private diagnosticSuite: DiagnosticToolSuite;

  constructor() {
    this.diagnosticSuite = new DiagnosticToolSuite();
  }

  public async execute(args: DiagnosticToolArgs): Promise<DiagnosticToolResult> {
    if (args.toolName) {
      return this.runSingleDiagnostic(args.toolName);
    } else {
      return this.runAllDiagnostics();
    }
  }

  public async runAllDiagnostics(): Promise<DiagnosticReport[]> {
    return this.diagnosticSuite.runAll();
  }

  public async runSingleDiagnostic(toolName: string): Promise<DiagnosticReport | undefined> {
    return this.diagnosticSuite.runTool(toolName);
  }
} 