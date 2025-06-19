import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult, DiagnosticStatus } from '../types';
import fs from 'fs';
import path from 'path';

export class DependencyChecker extends BaseDiagnosticTool {
  public readonly name = 'DependencyChecker';
  public readonly description = 'Checks for dependency-related issues.';

  public async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    let overallStatus: DiagnosticStatus = 'passing';

    const nodeModulesResult = this.checkNodeModules();
    results.push(nodeModulesResult);

    if (nodeModulesResult.status !== 'passing') {
        overallStatus = nodeModulesResult.status;
    }

    // A real implementation would also check for vulnerabilities (e.g., via `npm audit`)
    // and version compatibility issues.

    return {
      tool: this.name,
      timestamp: new Date(),
      overallStatus,
      results,
    };
  }

  private checkNodeModules(): DiagnosticResult {
    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    try {
      if (fs.existsSync(nodeModulesPath)) {
        return {
          check: 'Dependencies: node_modules',
          status: 'passing',
          message: 'node_modules directory exists.',
        };
      } else {
        return {
          check: 'Dependencies: node_modules',
          status: 'failing',
          message: 'node_modules directory does not exist.',
          details: 'Dependencies are not installed. Run `npm install` or `yarn install`.'
        };
      }
    } catch (error) {
      return {
        check: 'Dependencies: node_modules',
        status: 'failing',
        message: 'Error checking for node_modules directory.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
} 