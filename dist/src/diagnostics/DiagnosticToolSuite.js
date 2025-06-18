import { HealthCheckTool } from './tools/HealthCheckTool';
import { APIConnectivityTester } from './tools/APIConnectivityTester';
import { SchemaValidator } from './tools/SchemaValidator';
import { EnvironmentValidator } from './tools/EnvironmentValidator';
import { PerformanceProfiler } from './tools/PerformanceProfiler';
import { LogAnalyzer } from './tools/LogAnalyzer';
import { DependencyChecker } from './tools/DependencyChecker';
export class DiagnosticToolSuite {
    constructor() {
        this.tools = [
            new HealthCheckTool(),
            new APIConnectivityTester(),
            new SchemaValidator(),
            new EnvironmentValidator(),
            new PerformanceProfiler(),
            new LogAnalyzer(),
            new DependencyChecker(),
        ];
    }
    async runAll() {
        const reports = [];
        for (const tool of this.tools) {
            reports.push(await tool.run());
        }
        return reports;
    }
    async runTool(toolName) {
        const tool = this.tools.find(t => t.name === toolName);
        if (tool) {
            return await tool.run();
        }
        return undefined;
    }
}
//# sourceMappingURL=DiagnosticToolSuite.js.map