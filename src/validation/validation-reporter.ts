/**
 * Validation Reporter
 * 
 * Generates formatted reports from validation results
 */

import {
  ValidationReport,
  ValidationResult,
  ValidationError
} from './types';
import { ValidationUtils } from './validation-utils';

/**
 * Report formatting options
 */
export interface ReportFormatOptions {
  /** Include detailed error information */
  detailed?: boolean;
  /** Include performance metrics */
  includeMetrics?: boolean;
  /** Include summary statistics */
  includeSummary?: boolean;
  /** Include individual tool results */
  includeToolResults?: boolean;
  /** Maximum number of errors to display per tool */
  maxErrorsPerTool?: number;
  /** Whether to colorize output (for console) */
  colorize?: boolean;
}

/**
 * Default report format options
 */
const DEFAULT_FORMAT_OPTIONS: ReportFormatOptions = {
  detailed: true,
  includeMetrics: true,
  includeSummary: true,
  includeToolResults: true,
  maxErrorsPerTool: 10,
  colorize: false
};

/**
 * Validation report generator
 */
export class ValidationReporter {
  private options: ReportFormatOptions;

  constructor(options: ReportFormatOptions = {}) {
    this.options = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  }

  /**
   * Generate a formatted text report
   */
  public generateTextReport(report: ValidationReport): string {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader(report));

    // Summary
    if (this.options.includeSummary) {
      sections.push(this.generateSummary(report));
    }

    // Overall validation result
    sections.push(this.generateOverallResult(report.overall));

    // Individual tool results
    if (this.options.includeToolResults && report.toolResults.length > 0) {
      sections.push(this.generateToolResults(report.toolResults));
    }

    // Metrics
    if (this.options.includeMetrics) {
      sections.push(this.generateMetrics(report));
    }

    // Configuration
    sections.push(this.generateConfiguration(report));

    return sections.join('\n\n');
  }

  /**
   * Generate a JSON report
   */
  public generateJsonReport(report: ValidationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate a CSV report of errors
   */
  public generateCsvReport(report: ValidationReport): string {
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

    const rows: string[] = [headers.join(',')];

    // Add overall errors
    report.overall.errors.forEach(error => {
      rows.push(this.formatErrorAsCsv('Overall', -1, error));
    });

    report.overall.warnings.forEach(error => {
      rows.push(this.formatErrorAsCsv('Overall', -1, error));
    });

    // Add tool-specific errors
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

  /**
   * Generate report header
   */
  private generateHeader(report: ValidationReport): string {
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

  /**
   * Generate summary section
   */
  private generateSummary(report: ValidationReport): string {
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

  /**
   * Generate overall validation result
   */
  private generateOverallResult(result: ValidationResult): string {
    const sections: string[] = [
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

  /**
   * Generate tool-specific results
   */
  private generateToolResults(toolResults: ValidationReport['toolResults']): string {
    const sections: string[] = [
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

  /**
   * Generate metrics section
   */
  private generateMetrics(report: ValidationReport): string {
    const { metrics } = report;
    
    return [
      'PERFORMANCE METRICS',
      '-'.repeat(20),
      `Validation Duration: ${metrics.validationDurationMs}ms`,
      `Rules Executed: ${metrics.rulesExecuted}`,
      `Average Time per Tool: ${metrics.averageTimePerTool.toFixed(2)}ms`
    ].join('\n');
  }

  /**
   * Generate configuration section
   */
  private generateConfiguration(report: ValidationReport): string {
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

  /**
   * Format error for display
   */
  private formatErrorForDisplay(error: ValidationError): string {
    if (this.options.detailed) {
      return ValidationUtils.formatError(error);
    } else {
      return `${error.severity.toUpperCase()}: ${error.code} - ${error.message}`;
    }
  }

  /**
   * Format error as CSV row
   */
  private formatErrorAsCsv(toolName: string, toolIndex: number, error: ValidationError): string {
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

  /**
   * Escape CSV field
   */
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Update reporter options
   */
  public updateOptions(newOptions: Partial<ReportFormatOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get current options
   */
  public getOptions(): ReportFormatOptions {
    return { ...this.options };
  }
} 