import { ValidationUtils } from './validation-utils';
const DEFAULT_FORMAT_OPTIONS = {
    detailed: true,
    includeMetrics: true,
    includeSummary: true,
    includeToolResults: true,
    maxErrorsPerTool: 10,
    colorize: false
};
export class ValidationReporter {
    constructor(options = {}) {
        this.options = { ...DEFAULT_FORMAT_OPTIONS, ...options };
    }
    generateTextReport(report) {
        const sections = [];
        sections.push(this.generateHeader(report));
        if (this.options.includeSummary) {
            sections.push(this.generateSummary(report));
        }
        sections.push(this.generateOverallResult(report.overall));
        if (this.options.includeToolResults && report.toolResults.length > 0) {
            sections.push(this.generateToolResults(report.toolResults));
        }
        if (this.options.includeMetrics) {
            sections.push(this.generateMetrics(report));
        }
        sections.push(this.generateConfiguration(report));
        return sections.join('\n\n');
    }
    generateJsonReport(report) {
        return JSON.stringify(report, null, 2);
    }
    generateCsvReport(report) {
        const headers = [
            'Tool Name',
            'Tool Index',
            'Severity',
            'Error Code',
            'Message',
            'Path',
            'Expected',
            'Actual',
            'Spec Reference'
        ];
        const rows = [headers.join(',')];
        report.overall.errors.forEach(error => {
            rows.push(this.formatErrorAsCsv('Overall', -1, error));
        });
        report.overall.warnings.forEach(error => {
            rows.push(this.formatErrorAsCsv('Overall', -1, error));
        });
        report.toolResults.forEach(toolResult => {
            const allErrors = [
                ...toolResult.result.errors,
                ...toolResult.result.warnings,
                ...toolResult.result.info
            ];
            allErrors.forEach(error => {
                rows.push(this.formatErrorAsCsv(toolResult.toolName, toolResult.toolIndex, error));
            });
        });
        return rows.join('\n');
    }
    generateHeader(report) {
        return [
            '='.repeat(60),
            'MCP Tool Schema Validation Report',
            '='.repeat(60),
            `Generated: ${report.timestamp}`,
            `Validator Version: ${report.validatorVersion}`,
            `MCP Version: ${report.mcpVersion}`,
            `Tools Validated: ${report.toolCount}`
        ].join('\n');
    }
    generateSummary(report) {
        const { overall } = report;
        const status = overall.valid ? '✅ VALID' : '❌ INVALID';
        return [
            'SUMMARY',
            '-'.repeat(20),
            `Status: ${status}`,
            `Total Errors: ${overall.summary.errorCount}`,
            `Total Warnings: ${overall.summary.warningCount}`,
            `Total Info: ${overall.summary.infoCount}`
        ].join('\n');
    }
    generateOverallResult(result) {
        const sections = [
            'OVERALL VALIDATION RESULT',
            '-'.repeat(30)
        ];
        if (result.errors.length > 0) {
            sections.push('\nERRORS:');
            result.errors.forEach((error, index) => {
                if (!this.options.maxErrorsPerTool || index < this.options.maxErrorsPerTool) {
                    sections.push(this.formatErrorForDisplay(error));
                }
            });
            if (this.options.maxErrorsPerTool && result.errors.length > this.options.maxErrorsPerTool) {
                sections.push(`... and ${result.errors.length - this.options.maxErrorsPerTool} more errors`);
            }
        }
        if (result.warnings.length > 0) {
            sections.push('\nWARNINGS:');
            result.warnings.forEach((error, index) => {
                if (!this.options.maxErrorsPerTool || index < this.options.maxErrorsPerTool) {
                    sections.push(this.formatErrorForDisplay(error));
                }
            });
        }
        return sections.join('\n');
    }
    generateToolResults(toolResults) {
        const sections = [
            'TOOL-SPECIFIC RESULTS',
            '-'.repeat(25)
        ];
        toolResults.forEach(toolResult => {
            const { toolName, toolIndex, result } = toolResult;
            const status = result.valid ? '✅' : '❌';
            sections.push(`\n${status} Tool: ${toolName} (Index: ${toolIndex})`);
            if (result.errors.length > 0) {
                sections.push('  Errors:');
                result.errors.forEach((error, index) => {
                    if (!this.options.maxErrorsPerTool || index < this.options.maxErrorsPerTool) {
                        sections.push('    ' + ValidationUtils.formatError(error).replace(/\n/g, '\n    '));
                    }
                });
            }
            if (result.warnings.length > 0) {
                sections.push('  Warnings:');
                result.warnings.forEach((error, index) => {
                    if (!this.options.maxErrorsPerTool || index < this.options.maxErrorsPerTool) {
                        sections.push('    ' + ValidationUtils.formatError(error).replace(/\n/g, '\n    '));
                    }
                });
            }
            if (result.valid) {
                sections.push('  No issues found.');
            }
        });
        return sections.join('\n');
    }
    generateMetrics(report) {
        const { metrics } = report;
        return [
            'PERFORMANCE METRICS',
            '-'.repeat(20),
            `Validation Duration: ${metrics.validationDurationMs}ms`,
            `Rules Executed: ${metrics.rulesExecuted}`,
            `Average Time per Tool: ${metrics.averageTimePerTool.toFixed(2)}ms`
        ].join('\n');
    }
    generateConfiguration(report) {
        const { config } = report;
        return [
            'VALIDATION CONFIGURATION',
            '-'.repeat(25),
            `Strict Mode: ${config.strict || false}`,
            `Check Deprecated: ${config.checkDeprecated || false}`,
            `Validate JSON Schema Draft: ${config.validateJsonSchemaDraft || false}`,
            `Max Schema Depth: ${config.maxSchemaDepth || 'unlimited'}`,
            `Custom Rules: ${config.customRules?.length || 0}`
        ].join('\n');
    }
    formatErrorForDisplay(error) {
        if (this.options.detailed) {
            return ValidationUtils.formatError(error);
        }
        else {
            return `${error.severity.toUpperCase()}: ${error.code} - ${error.message}`;
        }
    }
    formatErrorAsCsv(toolName, toolIndex, error) {
        const fields = [
            this.escapeCsvField(toolName),
            toolIndex.toString(),
            error.severity,
            this.escapeCsvField(error.code),
            this.escapeCsvField(error.message),
            this.escapeCsvField(error.path || ''),
            this.escapeCsvField(error.expected?.toString() || ''),
            this.escapeCsvField(error.actual?.toString() || ''),
            this.escapeCsvField(error.specReference || '')
        ];
        return fields.join(',');
    }
    escapeCsvField(field) {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
    getOptions() {
        return { ...this.options };
    }
}
//# sourceMappingURL=validation-reporter.js.map