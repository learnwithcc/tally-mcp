export declare enum LogLevel {
    FATAL = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}
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
export interface LoggerConfig {
    level: LogLevel;
    component: string;
    enableConsole: boolean;
    enableStructured: boolean;
    redactSensitive: boolean;
    sensitiveFields: string[];
    enableTracing?: boolean;
}
export declare const DEFAULT_LOGGER_CONFIG: LoggerConfig;
export declare class Logger {
    private config;
    private traceId;
    constructor(config?: Partial<LoggerConfig>);
    setTraceId(traceId: string): void;
    getTraceId(): string;
    child(component: string, additionalConfig?: Partial<LoggerConfig>): Logger;
    fatal(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    error(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    warn(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    info(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    debug(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    trace(message: string, context?: Record<string, any>, error?: Error, requestId?: string, operation?: string): void;
    startOperation(operation: string, context?: Record<string, any>, requestId?: string): () => void;
    private log;
    private outputStructuredLog;
    private outputConsoleLog;
    private redactSensitiveData;
    updateConfig(config: Partial<LoggerConfig>): void;
    getConfig(): LoggerConfig;
}
export declare const createLogger: (component: string, config?: Partial<LoggerConfig>) => Logger;
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map