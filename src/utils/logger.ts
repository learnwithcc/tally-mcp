/**
 * Centralized Logger Service
 * 
 * Provides structured logging capabilities with JSON formatting, sensitive data masking,
 * and trace correlation for the Tally MCP Server.
 */

import { randomUUID } from 'crypto';

/**
 * Log levels enumeration
 */
export enum LogLevel {
  FATAL = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  component: string;
  message: string;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  traceId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context?: Record<string, any>;
  duration?: number;
  metadata?: Record<string, any>;
  operation?: string;
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel;
  component: string;
  enableConsole: boolean;
  enableStructured: boolean;
  redactSensitive: boolean;
  sensitiveFields: string[];
  enableTracing?: boolean;
}

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  component: 'MCPServer',
  enableConsole: true,
  enableStructured: true,
  redactSensitive: true,
  sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie', 'api_key', 'apikey'],
  enableTracing: true,
};

/**
 * Centralized Logger Class
 * 
 * Provides consistent structured logging across all system components with
 * automatic sensitive data redaction, trace correlation, and flexible output formats.
 */
export class Logger {
  private config: LoggerConfig;
  private traceId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    this.traceId = randomUUID();
  }

  /**
   * Set a new trace ID for correlation tracking
   */
  public setTraceId(traceId: string): void {
    this.traceId = traceId;
  }

  /**
   * Get the current trace ID
   */
  public getTraceId(): string {
    return this.traceId;
  }

  /**
   * Create a child logger with the same configuration but different component
   */
  public child(component: string, additionalConfig: Partial<LoggerConfig> = {}): Logger {
    return new Logger({
      ...this.config,
      ...additionalConfig,
      component,
    });
  }

  /**
   * Log a fatal error
   */
  public fatal(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.FATAL, message, context, error, requestId, operation);
  }

  /**
   * Log an error
   */
  public error(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.ERROR, message, context, error, requestId, operation);
  }

  /**
   * Log a warning
   */
  public warn(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.WARN, message, context, error, requestId, operation);
  }

  /**
   * Log an info message
   */
  public info(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.INFO, message, context, error, requestId, operation);
  }

  /**
   * Log a debug message
   */
  public debug(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.DEBUG, message, context, error, requestId, operation);
  }

  /**
   * Log a trace message
   */
  public trace(
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    this.log(LogLevel.TRACE, message, context, error, requestId, operation);
  }

  /**
   * Log an operation start with timing
   */
  public startOperation(
    operation: string,
    context?: Record<string, any>,
    requestId?: string
  ): () => void {
    const startTime = Date.now();
    this.debug(`Starting operation: ${operation}`, context, undefined, requestId, operation);

    return () => {
      const duration = Date.now() - startTime;
      this.debug(`Completed operation: ${operation}`, { ...context, duration }, undefined, requestId, operation);
    };
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    operation?: string
  ): void {
    // Skip if log level is below configured threshold
    if (level > this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      component: this.config.component,
      message,
    };

    if (requestId) {
      entry.requestId = requestId;
    }

    if (this.config.enableTracing && this.traceId) {
      entry.traceId = this.traceId;
    }

    if (operation) {
      entry.operation = operation;
    }

    // Add error information if provided
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
      };
      if (error.stack) {
        entry.error.stack = error.stack;
      }
      if ((error as any).code) {
        entry.error.code = (error as any).code;
      }
    }

    // Add context if provided (with sensitive data redaction)
    if (context) {
      entry.context = this.config.redactSensitive
        ? this.redactSensitiveData(context)
        : context;
    }

    // Output structured log entry
    if (this.config.enableStructured) {
      this.outputStructuredLog(entry);
    }

    // Output console log for backward compatibility
    if (this.config.enableConsole) {
      this.outputConsoleLog(entry);
    }
  }

  /**
   * Output structured JSON log entry
   */
  private outputStructuredLog(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  /**
   * Output human-readable console log entry
   */
  private outputConsoleLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.levelName}] [${entry.component}]`;
    const requestInfo = entry.requestId ? ` [${entry.requestId}]` : '';
    const traceInfo = entry.traceId ? ` [trace:${entry.traceId.slice(0, 8)}]` : '';
    const operationInfo = entry.operation ? ` [op:${entry.operation}]` : '';

    let logMessage = `${prefix}${requestInfo}${traceInfo}${operationInfo} ${entry.message}`;

    if (entry.context) {
      logMessage += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      logMessage += ` | Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && entry.level <= LogLevel.ERROR) {
        console.log(logMessage);
        console.log(`Stack trace:\n${entry.error.stack}`);
        return;
      }
    }

    // Use appropriate console method based on log level
    switch (entry.level) {
      case LogLevel.FATAL:
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  /**
   * Redact sensitive data from context objects
   */
  private redactSensitiveData(data: Record<string, any>): Record<string, any> {
    const redacted = { ...data };

    const redactValue = (obj: any, path: string[] = []): any => {
      if (obj === null || obj === undefined) return obj;

      if (Array.isArray(obj)) {
        return obj.map((item, index) => redactValue(item, [...path, index.toString()]));
      }

      if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (this.config.sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = redactValue(value, [...path, key]);
          }
        }
        return result;
      }

      // Handle primitive values that might be sensitive based on their string content
      if (typeof obj === 'string') {
        const lowerStr = obj.toLowerCase();
        if (this.config.sensitiveFields.some(field => lowerStr.includes(field.toLowerCase()))) {
          return '[REDACTED]';
        }
      }

      return obj;
    };

    return redactValue(redacted);
  }

  /**
   * Update logger configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current logger configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * Create a default logger instance
 */
export const createLogger = (component: string, config?: Partial<LoggerConfig>): Logger => {
  return new Logger({ ...config, component });
};

/**
 * Global logger instance for backward compatibility
 */
export const logger = new Logger(); 