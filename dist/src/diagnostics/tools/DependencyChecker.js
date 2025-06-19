import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import fs from 'fs';
import path from 'path';
export class DependencyChecker extends BaseDiagnosticTool {
    constructor() {
        super(...arguments);
        this.name = 'DependencyChecker';
        this.description = 'Checks for dependency-related issues.';
    }
    async run() {
        const results = [];
        let overallStatus = 'passing';
        const nodeModulesResult = this.checkNodeModules();
        results.push(nodeModulesResult);
        if (nodeModulesResult.status !== 'passing') {
            overallStatus = nodeModulesResult.status;
        }
        return {
            tool: this.name,
            timestamp: new Date(),
            overallStatus,
            results,
        };
    }
    checkNodeModules() {
        const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
        try {
            if (fs.existsSync(nodeModulesPath)) {
                return {
                    check: 'Dependencies: node_modules',
                    status: 'passing',
                    message: 'node_modules directory exists.',
                };
            }
            else {
                return {
                    check: 'Dependencies: node_modules',
                    status: 'failing',
                    message: 'node_modules directory does not exist.',
                    details: 'Dependencies are not installed. Run `npm install` or `yarn install`.'
                };
            }
        }
        catch (error) {
            return {
                check: 'Dependencies: node_modules',
                status: 'failing',
                message: 'Error checking for node_modules directory.',
                details: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
//# sourceMappingURL=DependencyChecker.js.map