import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string;
    };
    context?: Record<string, any>;
    duration?: number;
    metadata?: Record<string, any>;
}
export declare enum ErrorCategory {
    VALIDATION = "validation",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    NETWORK = "network",
    TIMEOUT = "timeout",
    RATE_LIMIT = "rate_limit",
    INTERNAL = "internal",
    EXTERNAL = "external",
    CONFIGURATION = "configuration",
    RESOURCE = "resource"
}
export interface StructuredError extends Error {
    category: ErrorCategory;
    code: string;
    statusCode: number;
    isOperational: boolean;
    context?: Record<string, any>;
    requestId?: string;
    correlationId?: string;
}
export interface LoggerConfig {
    level: LogLevel;
    component: string;
    enableConsole: boolean;
    enableStructured: boolean;
    redactSensitive: boolean;
    sensitiveFields: string[];
}
export declare const DEFAULT_LOGGER_CONFIG: LoggerConfig;
export interface MCPServerConfig {
    port: number;
    host: string;
    cors: boolean;
    requestTimeout: number;
    maxConnections: number;
    debug: boolean;
    logger?: Partial<LoggerConfig>;
}
export declare const DEFAULT_CONFIG: MCPServerConfig;
export declare enum ServerState {
    STOPPED = "stopped",
    STARTING = "starting",
    RUNNING = "running",
    STOPPING = "stopping",
    ERROR = "error"
}
export interface HealthMetrics {
    uptime: number;
    status: ServerState;
    connections: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    cpu: {
        loadAverage: number[];
        usage: number;
    };
    system: {
        platform: string;
        arch: string;
        nodeVersion: string;
        freeMemory: number;
        totalMemory: number;
    };
    requests: {
        total: number;
        rate: number;
        errors: number;
        errorRate: number;
    };
    healthy: boolean;
    timestamp: string;
}
export interface HealthThresholds {
    maxMemoryPercent: number;
    maxLoadAverage: number;
    maxErrorRate: number;
    maxConnections: number;
}
export declare const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds;
export declare class MCPServer extends Server {
    private config;
    private app;
    private server;
    private state;
    private activeConnections;
    private connectionCount;
    private emitter;
    private signalHandlers;
    private startTime;
    private healthThresholds;
    private requestStats;
    private loggerConfig;
    private correlationIds;
    private errorMetrics;
    private tools?;
    constructor(config?: Partial<MCPServerConfig>);
    getState(): ServerState;
    getConnectionCount(): number;
    getConfig(): MCPServerConfig;
    getHealthMetrics(): HealthMetrics;
    isHealthy(): boolean;
    private getUptime;
    private getRequestRate;
    private getErrorRate;
    private updateRequestStats;
    private incrementRequestCount;
    private incrementErrorCount;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private handleSSEConnection;
    private handleMCPMessage;
    private removeConnection;
    private sendSSEMessage;
    private broadcastToConnections;
    private log;
    private outputStructuredLog;
    private outputConsoleLog;
    private redactSensitiveData;
    getErrorMetrics(): {
        total: number;
        byCategory: {
            [k: string]: number;
        };
        byCode: {
            [k: string]: number;
        };
    };
    private requestIdMiddleware;
    private requestLoggingMiddleware;
    private corsMiddleware;
    private connectionLimitMiddleware;
    private requestTimeoutMiddleware;
    private setupMiddleware;
    private setupRoutes;
    private startHttpServer;
    private stopHttpServer;
    private setupSignalHandlers;
    private removeSignalHandlers;
    private closeAllConnections;
    private initializeTools;
    private _handleToolsList;
    private _handleToolsCall;
    private setupMCPHandlers;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    broadcast(event: string, data: any): void;
}
//# sourceMappingURL=server.d.ts.map