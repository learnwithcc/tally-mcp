import { IDiagnosticTool, DiagnosticReport } from './types';
import { HealthCheckTool } from './tools/HealthCheckTool';
import { APIConnectivityTester } from './tools/APIConnectivityTester';
import { SchemaValidator } from './tools/SchemaValidator';
import { EnvironmentValidator } from './tools/EnvironmentValidator';
import { PerformanceProfiler } from './tools/PerformanceProfiler';
import { LogAnalyzer } from './tools/LogAnalyzer';
import { DependencyChecker } from './tools/DependencyChecker';
// ... import other tools

export class DiagnosticToolSuite {
  private tools: IDiagnosticTool[];

  constructor() {
    this.tools = [
      new HealthCheckTool(),
      new APIConnectivityTester(),
      new SchemaValidator(),
      new EnvironmentValidator(),
      new PerformanceProfiler(),
      new LogAnalyzer(),
      new DependencyChecker(),
      // ... instantiate other tools
    ];
  }

  async runAll(): Promise<DiagnosticReport[]> {
    const reports: DiagnosticReport[] = [];
    for (const tool of this.tools) {
      reports.push(await tool.run());
    }
    return reports;
  }

  async runTool(toolName: string): Promise<DiagnosticReport | undefined> {
    const tool = this.tools.find(t => t.name === toolName);
    if (tool) {
      return await tool.run();
    }
    return undefined;
  }
} 