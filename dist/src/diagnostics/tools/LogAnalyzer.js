import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import fs from 'fs';
import path from 'path';
export class LogAnalyzer extends BaseDiagnosticTool {
    constructor() {
        super(...arguments);
        this.name = 'LogAnalyzer';
        this.description = 'Analyzes application logs for errors and patterns.';
        this.logFilePath = path.resolve(process.cwd(), 'logs/app.log');
    }
    async run() {
        const results = [];
        let overallStatus = 'passing';
        const logFileResult = this.checkLogFile();
        results.push(logFileResult);
        if (logFileResult.status !== 'passing') {
            overallStatus = logFileResult.status;
        }
        else {
        }
        return {
            tool: this.name,
            timestamp: new Date(),
            overallStatus,
            results,
        };
    }
    checkLogFile() {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const stats = fs.statSync(this.logFilePath);
                return {
                    check: 'Log File Existence',
                    status: 'passing',
                    message: `Log file found at ${this.logFilePath}.`,
                    details: {
                        size: stats.size,
                        lastModified: stats.mtime
                    }
                };
            }
            else {
                return {
                    check: 'Log File Existence',
                    status: 'warning',
                    message: `Log file not found at ${this.logFilePath}.`,
                    details: 'Logging may not be configured or no logs have been generated yet.'
                };
            }
        }
        catch (error) {
            return {
                check: 'Log File Existence',
                status: 'failing',
                message: 'Error checking for log file.',
                details: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
//# sourceMappingURL=LogAnalyzer.js.map