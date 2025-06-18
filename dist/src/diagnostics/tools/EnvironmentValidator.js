import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { env } from '../../config/env';
import fs from 'fs';
import path from 'path';
export class EnvironmentValidator extends BaseDiagnosticTool {
    constructor() {
        super(...arguments);
        this.name = 'EnvironmentValidator';
        this.description = 'Validates the runtime environment, dependencies, and system resources.';
    }
    async run() {
        const results = [];
        let overallStatus = 'passing';
        const apiKeyResult = this.checkApiKey();
        results.push(apiKeyResult);
        if (apiKeyResult.status === 'failing') {
            overallStatus = 'failing';
        }
        const dependencyResult = this.checkDependencies();
        results.push(dependencyResult);
        if (dependencyResult.status === 'failing') {
            overallStatus = 'failing';
        }
        return {
            tool: this.name,
            timestamp: new Date(),
            overallStatus,
            results,
        };
    }
    checkApiKey() {
        if (env.TALLY_API_KEY && env.TALLY_API_KEY.length > 0) {
            return {
                check: 'Environment: TALLY_API_KEY',
                status: 'passing',
                message: 'TALLY_API_KEY is set.',
            };
        }
        else {
            return {
                check: 'Environment: TALLY_API_KEY',
                status: 'failing',
                message: 'TALLY_API_KEY is not set or is empty.',
                details: 'The TALLY_API_KEY environment variable is required for the application to function.'
            };
        }
    }
    checkDependencies() {
        try {
            const packageJsonPath = path.resolve(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const dependencies = packageJson.dependencies;
            const devDependencies = packageJson.devDependencies;
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
            }
            else {
                return {
                    check: 'Dependencies',
                    status: 'warning',
                    message: 'No dependencies found in package.json',
                };
            }
        }
        catch (error) {
            return {
                check: 'Dependencies',
                status: 'failing',
                message: 'Could not read or parse package.json',
                details: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
//# sourceMappingURL=EnvironmentValidator.js.map