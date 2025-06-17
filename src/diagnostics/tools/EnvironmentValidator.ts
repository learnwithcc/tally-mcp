import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport, DiagnosticResult, DiagnosticStatus } from '../types';
import { env } from '../../config/env';
import fs from 'fs';
import path from 'path';

export class EnvironmentValidator extends BaseDiagnosticTool {
  public readonly name = 'EnvironmentValidator';
  public readonly description = 'Validates the runtime environment, dependencies, and system resources.';

  public async run(): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    let overallStatus: DiagnosticStatus = 'passing';

    // 1. Check for TALLY_API_KEY
    const apiKeyResult = this.checkApiKey();
    results.push(apiKeyResult);
    if (apiKeyResult.status === 'failing') {
      overallStatus = 'failing';
    }

    // 2. Check dependency versions from package.json
    const dependencyResult = this.checkDependencies();
    results.push(dependencyResult);
    if (dependencyResult.status === 'failing') {
        overallStatus = 'failing';
    }
    
    // TODO: Add system resource monitoring (CPU, Memory)

    return {
      tool: this.name,
      timestamp: new Date(),
      overallStatus,
      results,
    };
  }

  private checkApiKey(): DiagnosticResult {
    if (env.TALLY_API_KEY && env.TALLY_API_KEY.length > 0) {
      return {
        check: 'Environment: TALLY_API_KEY',
        status: 'passing',
        message: 'TALLY_API_KEY is set.',
      };
    } else {
      return {
        check: 'Environment: TALLY_API_KEY',
        status: 'failing',
        message: 'TALLY_API_KEY is not set or is empty.',
        details: 'The TALLY_API_KEY environment variable is required for the application to function.'
      };
    }
  }

  private checkDependencies(): DiagnosticResult {
    try {
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = packageJson.dependencies;
        const devDependencies = packageJson.devDependencies;

        // Simple check if dependencies are there
        if (dependencies && Object.keys(dependencies).length > 0) {
            return {
                check: 'Dependencies',
                status: 'passing',
                message: 'Dependencies are listed in package.json',
                details: {
                    dependencies: Object.keys(dependencies),
                    devDependencies: Object.keys(devDependencies)
                }
            };
        } else {
            return {
                check: 'Dependencies',
                status: 'warning',
                message: 'No dependencies found in package.json',
            };
        }
    } catch (error) {
        return {
            check: 'Dependencies',
            status: 'failing',
            message: 'Could not read or parse package.json',
            details: error instanceof Error ? error.message : String(error),
        };
    }
  }
} 