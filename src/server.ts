/**
 * Tally MCP Server
 * 
 * Main server class that extends the MCP SDK Server with SSE transport support
 * for managing Tally.so forms through natural language commands.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, ServerCapabilities as MCPServerCapabilities } from '@modelcontextprotocol/sdk/types.js';
import express, { Express, Request, Response } from 'express';
import * as os from 'os';
import { 
  TemplateTool, 
  WorkspaceManagementTool,
  FormCreationTool,
  FormModificationTool,
  FormPermissionManager,
  FormRetrievalTool,
  FormSharingTool,
  SubmissionAnalysisTool,
  DiagnosticTool,
} from './tools';
import { TallyApiClientConfig } from './services/TallyApiClient';
import { EventEmitter } from 'events';
import { env } from './config/env';
import { ServerCapabilities, ClientCapabilities, NegotiatedCapabilities } from './types/capabilities';
import { Registry, Gauge, /* Counter, */ collectDefaultMetrics } from 'prom-client';
import { MonitoringService } from './types/monitoring';
import { MonitoringServiceImpl } from './services/MonitoringService';
import { Logger } from './utils/logger';
import { SentryService } from './services/SentryService';
import { TallyApiClient } from './services/TallyApiClient';

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

/**
 * Error category enumeration for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  CONFIGURATION = 'configuration',
  RESOURCE = 'resource',
}

/**
 * Structured error interface for consistent error handling
 */
export interface StructuredError extends Error {
  category: ErrorCategory;
  code: string;
  statusCode: number;
  isOperational: boolean;
  context?: Record<string, any>;
  requestId?: string;
  correlationId?: string;
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
  sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie'],
};

/**
 * Configuration options for the MCP server
 */
export interface MCPServerConfig {
  /** Port number for the HTTP server */
  port: number;
  /** Host address to bind to */
  host: string;
  /** Enable/disable CORS */
  cors: boolean;
  /** Request timeout in milliseconds */
  requestTimeout: number;
  /** Maximum number of concurrent SSE connections */
  maxConnections: number;
  /** Enable debug logging */
  debug: boolean;
  /** Logger configuration */
  logger?: Partial<LoggerConfig>;
  /** Server capabilities */
  capabilities?: MCPServerCapabilities;
  /** Tools available on the server */
  tools?: any;
  /** Tally API Key */
  tallyApiKey?: string;
  /** Enable Real Tally API */
  enableRealTallyAPI?: boolean;
}

/**
 * Default server configuration
 */
export const DEFAULT_CONFIG: MCPServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  cors: true,
  requestTimeout: 30000, // 30 seconds
  maxConnections: 100,
  debug: false,
  logger: DEFAULT_LOGGER_CONFIG,
};

/**
 * Server state enumeration
 */
export enum ServerState {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
}

/**
 * Health metrics interface for comprehensive monitoring
 */
export interface HealthMetrics {
  /** Server uptime in milliseconds */
  uptime: number;
  /** Current server state */
  status: ServerState;
  /** Number of active connections */
  connections: number;
  /** Memory usage statistics */
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  /** CPU usage information */
  cpu: {
    loadAverage: number[];
    usage: number;
  };
  /** System information */
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    freeMemory: number;
    totalMemory: number;
  };
  /** Request statistics */
  requests: {
    total: number;
    rate: number; // requests per minute
    errors: number;
    errorRate: number; // errors per minute
  };
  /** Health status assessment */
  healthy: boolean;
  /** Timestamp of the health check */
  timestamp: string;
}

/**
 * Health threshold configuration
 */
export interface HealthThresholds {
  /** Maximum memory usage percentage before unhealthy */
  maxMemoryPercent: number;
  /** Maximum CPU load average before unhealthy */
  maxLoadAverage: number;
  /** Maximum error rate before unhealthy */
  maxErrorRate: number;
  /** Maximum number of connections before unhealthy */
  maxConnections: number;
}

/**
 * Default health thresholds
 */
export const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds = {
  maxMemoryPercent: 95, // More lenient for development environments
  maxLoadAverage: 20,   // More lenient for development environments
  maxErrorRate: 50,     // 50 errors per minute
  maxConnections: 90,   // 90% of max connections
};

/**
 * Server capabilities configuration
 */
export const SERVER_CAPABILITIES: MCPServerCapabilities = {
  tools: {},
  resources: {
    subscribe: false,
    listChanged: false
  },
  prompts: {
    listChanged: false,
  },
  logging: {}
};

/**
 * Validate and merge client capabilities with server capabilities
 */
function negotiateCapabilities(clientCapabilities: unknown): NegotiatedCapabilities {
  const clientCaps = (clientCapabilities || {}) as ClientCapabilities;

  const negotiated: NegotiatedCapabilities = {
    protocolVersion: '1.0',
    tools: {
      listChanged: !!(SERVER_CAPABILITIES.tools?.listChanged && clientCaps.tools?.listChanged),
    },
    resources: {
      subscribe: !!(SERVER_CAPABILITIES.resources?.subscribe && clientCaps.resources?.subscribe),
      listChanged: !!(SERVER_CAPABILITIES.resources?.listChanged && clientCaps.resources?.listChanged),
    },
    prompts: {
      listChanged: !!(SERVER_CAPABILITIES.prompts?.listChanged && clientCaps.prompts?.listChanged),
    },
    logging: {
      // No logging capabilities to negotiate yet
    }
  };

  return negotiated;
}

/**
 * Main MCP Server class that extends the MCP SDK Server
 * Provides SSE transport support and Express.js integration
 */
export class MCPServer extends Server {
  private config: MCPServerConfig;
  private app: Express;
  private server: any;
  private state: ServerState;
  private activeConnections: Set<Response>;
  private connectionCount: number;
  private emitter: EventEmitter;
  private signalHandlers: { [key: string]: (...args: any[]) => void } = {};
  
  // Health monitoring properties
  private startTime: [number, number]; // process.hrtime() format
  private healthThresholds: HealthThresholds;
  private requestStats: {
    total: number;
    errors: number;
    recentRequests: number[];
    recentErrors: number[];
    lastMinuteIndex: number;
  };
  
  // Logging infrastructure
  private loggerConfig: LoggerConfig;
  private correlationIds: Map<string, string> = new Map();
  private errorMetrics: {
    byCategory: Map<ErrorCategory, number>;
    byCode: Map<string, number>;
    total: number;
  };

  // Tool instances
  private tools?: {
    workspaceManagement: WorkspaceManagementTool;
    template: TemplateTool;
    form_creation: FormCreationTool;
    form_modification: FormModificationTool;
    form_retrieval: FormRetrievalTool;
    form_sharing: FormSharingTool;
    form_permissions: FormPermissionManager;
    submission_analysis: SubmissionAnalysisTool;
    diagnostic: DiagnosticTool;
  };

  private metricsRegistry: Registry;
  private monitoringService: MonitoringService;

  /**
   * Create a new MCP Server instance
   * @param config Server configuration options
   */
  constructor(config: Partial<MCPServerConfig> = {}) {
    // Merge default and provided configurations
    const fullConfig: MCPServerConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      logger: { ...DEFAULT_LOGGER_CONFIG, ...config.logger },
      capabilities: config.capabilities || SERVER_CAPABILITIES,
    };

    // Initialize the underlying MCP SDK Server with capabilities
    super({
      name: 'tally-mcp-server-test',
      version: '1.0.0',
      capabilities: fullConfig.capabilities,
      debug: fullConfig.debug,
    });

    this.config = fullConfig;
    this.loggerConfig = fullConfig.logger as LoggerConfig;
    this.app = express();
    this.state = ServerState.STOPPED;
    this.activeConnections = new Set();
    this.connectionCount = 0;
    this.emitter = new EventEmitter();
    this.startTime = process.hrtime();
    this.healthThresholds = DEFAULT_HEALTH_THRESHOLDS;
    this.metricsRegistry = new Registry();
    collectDefaultMetrics({ register: this.metricsRegistry });

    this.requestStats = {
      total: 0,
      errors: 0,
      recentRequests: [],
      recentErrors: [],
      lastMinuteIndex: 0,
    };
    
    this.errorMetrics = {
      byCategory: new Map(),
      byCode: new Map(),
      total: 0,
    };

    const logger = new Logger(this.loggerConfig);
    this.monitoringService = new MonitoringServiceImpl(
      // This is a placeholder. In a real implementation, you would
      // pass a real Cloudflare Analytics Engine binding.
      { writeDataPoint: () => {} },
      logger
    );

    SentryService.initialize();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSignalHandlers();
  }

  /**
   * Get current server state
   */
  public getState(): ServerState {
    return this.state;
  }

  /**
   * Get current number of active connections
   */
  public getConnectionCount(): number {
    return this.connectionCount;
  }

  /**
   * Get server configuration
   */
  public getConfig(): MCPServerConfig {
    return { 
      ...this.config,
      logger: { ...this.loggerConfig }
    };
  }

  /**
   * Get comprehensive health metrics
   */
  public getHealthMetrics(): HealthMetrics {
    const uptime = this.getUptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;
    const loadAverage = os.loadavg();
    
    // Update request statistics for current minute
    this.updateRequestStats();
    
    const metrics: HealthMetrics = {
      uptime,
      status: this.state,
      connections: this.connectionCount,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: memoryPercentage,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: {
        loadAverage,
        usage: loadAverage?.[0] ?? 0, // 1-minute load average
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        freeMemory,
        totalMemory,
      },
      requests: {
        total: this.requestStats.total,
        rate: this.getRequestRate(),
        errors: this.requestStats.errors,
        errorRate: this.getErrorRate(),
      },
      healthy: this.isHealthy(),
      timestamp: new Date().toISOString(),
    };

    return metrics;
  }

  /**
   * Check if server is healthy based on thresholds
   */
  public isHealthy(): boolean {
    if (this.state !== ServerState.RUNNING) {
      return false;
    }

    const totalMemory = os.totalmem();
    const memoryPercentage = ((totalMemory - os.freemem()) / totalMemory) * 100;
    
    // Check memory threshold
    if (memoryPercentage > this.healthThresholds.maxMemoryPercent) {
      return false;
    }

    // Check CPU load average
    const loadAverage = os.loadavg();
    if (loadAverage?.[0] && loadAverage[0] > this.healthThresholds.maxLoadAverage) {
      return false;
    }

    // Check error rate
    if (this.getErrorRate() > this.healthThresholds.maxErrorRate) {
      return false;
    }

    // Check connection count
    const maxConnections = (this.config.maxConnections * this.healthThresholds.maxConnections) / 100;
    if (this.connectionCount > maxConnections) {
      return false;
    }

    return true;
  }

  /**
   * Get server uptime in milliseconds
   */
  private getUptime(): number {
    const diff = process.hrtime(this.startTime);
    return Math.round((diff[0] * 1000) + (diff[1] / 1e6));
  }

  /**
   * Get current request rate (requests per minute)
   */
  private getRequestRate(): number {
    const sum = this.requestStats.recentRequests.reduce((a, b) => a + b, 0);
    return sum;
  }

  /**
   * Get current error rate (errors per minute)
   */
  private getErrorRate(): number {
    const sum = this.requestStats.recentErrors.reduce((a, b) => a + b, 0);
    return sum;
  }

  /**
   * Update request statistics for the current minute
   */
  private updateRequestStats(): void {
    const currentMinute = Math.floor(Date.now() / 60000);
    const arrayIndex = currentMinute % 60;
    
    if (arrayIndex !== this.requestStats.lastMinuteIndex) {
      // Reset counters for new minute
      this.requestStats.recentRequests[arrayIndex] = 0;
      this.requestStats.recentErrors[arrayIndex] = 0;
      this.requestStats.lastMinuteIndex = arrayIndex;
    }
  }

  /**
   * Increment request counter
   */
  private incrementRequestCount(): void {
    this.requestStats.total++;
    this.updateRequestStats();
    const currentMinute = Math.floor(Date.now() / 60000);
    const arrayIndex = currentMinute % 60;
    if (this.requestStats.recentRequests[arrayIndex] !== undefined) {
      this.requestStats.recentRequests[arrayIndex]++;
    }
  }

  /**
   * Increment error counter
   */
  private incrementErrorCount(): void {
    this.requestStats.errors++;
    this.updateRequestStats();
    const currentMinute = Math.floor(Date.now() / 60000);
    const arrayIndex = currentMinute % 60;
    if (this.requestStats.recentErrors[arrayIndex] !== undefined) {
      this.requestStats.recentErrors[arrayIndex]++;
    }
  }

  /**
   * Initialize the server
   * Sets up Express middleware, routes, and starts listening
   */
  public async initialize(): Promise<void> {
    if (this.state !== ServerState.STOPPED) {
      this.log('warn', 'Server is not stopped, cannot initialize.');
      return;
    }

    this.log('info', 'Initializing server...');
    this.state = ServerState.STARTING;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupMCPHandlers();
    this.initializeTools();

    try {
      await this.startHttpServer();
      this.state = ServerState.RUNNING;
      this.log('info', `Server running at http://${this.config.host}:${this.config.port}`);
      this.emit('ready');
    } catch (error) {
      this.log('fatal', 'Server failed to start', undefined, error as Error);
      this.state = ServerState.ERROR;
      throw error;
    }
  }

  /**
   * Shutdown the server gracefully
   * Closes all connections and releases resources
   */
  public async shutdown(): Promise<void> {
    if (this.state === ServerState.STOPPED || this.state === ServerState.STOPPING) {
      this.log('warn', 'Server is already stopped or stopping');
      return;
    }

    try {
      this.state = ServerState.STOPPING;
      this.log('info', 'Starting graceful server shutdown...');

      // Remove signal handlers to prevent memory leaks
      this.removeSignalHandlers();

      // Close all active SSE connections
      this.closeAllConnections();

      // Stop the HTTP server
      await this.stopHttpServer();

      this.state = ServerState.STOPPED;
      this.log('info', 'Server shutdown completed successfully');
    } catch (error) {
      this.state = ServerState.ERROR;
      this.log('error', 'Error during server shutdown:', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Handle new SSE connection
   * Establishes Server-Sent Events connection for MCP protocol communication
   */
  private async handleSSEConnection(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).requestId || 'unknown';
    this.log('info', `New SSE connection established [${requestId}]`);

    if (res.destroyed || res.headersSent) {
      this.log('warn', `Attempted to setup SSE on closed connection [${requestId}]`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Connection',
    });

    this.activeConnections.add(res);
    this.connectionCount++;

    this.sendSSEMessage(res, 'connection', {
      status: 'connected',
      serverId: requestId,
      serverInfo: {
        name: 'Tally MCP Server',
        version: '1.0.0',
        capabilities: Object.keys(SERVER_CAPABILITIES),
      },
    });

    // Send initial tools list notification
    this.sendSSEMessage(res, 'mcp-response', {
      jsonrpc: '2.0',
      method: 'notifications/tools/list_changed',
      params: {
        tools: await this._handleToolsList()
      }
    });

    const timeout = setTimeout(() => {
      this.log('debug', `SSE connection timeout [${requestId}]`);
      this.removeConnection(res);
    }, this.config.requestTimeout * 2);

    req.on('close', () => {
      clearTimeout(timeout);
      this.log('info', `SSE connection closed [${requestId}]`);
      this.removeConnection(res);
    });

    req.on('aborted', () => {
      clearTimeout(timeout);
      this.log('info', `SSE connection aborted [${requestId}]`);
      this.removeConnection(res);
    });

    res.on('error', (error) => {
      clearTimeout(timeout);
      this.log('error', `SSE connection error [${requestId}]:`, undefined, error);
      this.removeConnection(res);
    });

    res.on('finish', () => {
      clearTimeout(timeout);
      this.log('debug', `SSE response finished [${requestId}]`);
      this.removeConnection(res);
    });
  }

  /**
   * Remove connection from active connections set
   * Cleans up SSE connection and updates connection count
   */
  private removeConnection(res: Response): void {
    if (this.activeConnections.has(res)) {
      this.activeConnections.delete(res);
      this.connectionCount--;
      this.log('debug', `Connection removed. Active connections: ${this.connectionCount}`);
      
      // Close the response if it's still open
      if (!res.destroyed) {
        res.end();
      }
    }
  }

  /**
   * Send SSE message to a specific connection
   * Formats and sends Server-Sent Events message
   */
  private sendSSEMessage(res: Response, event: string, data: any): void {
    if (res.destroyed || !this.activeConnections.has(res)) {
      return;
    }

    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(message);
    } catch (error) {
      this.log('error', 'Error sending SSE message:', undefined, error as Error);
      this.removeConnection(res);
    }
  }

  /**
   * Broadcast message to all active SSE connections
   * Sends the same message to all connected clients
   */
  private broadcastToConnections(event: string, data: any): void {
    this.log('debug', `Broadcasting to ${this.activeConnections.size} connections`);
    
    for (const connection of this.activeConnections) {
      this.sendSSEMessage(connection, event, data);
    }
  }

  /**
   * Enhanced structured logging method
   */
  private log(
    level: LogLevel | 'info' | 'warn' | 'error' | 'debug' | 'trace' | 'fatal',
    message: string,
    context?: Record<string, any>,
    error?: Error | StructuredError,
    requestId?: string
  ): void {
    // Convert string level to enum
    let logLevel: LogLevel;
    if (typeof level === 'string') {
      logLevel = {
        'fatal': LogLevel.FATAL,
        'error': LogLevel.ERROR,
        'warn': LogLevel.WARN,
        'info': LogLevel.INFO,
        'debug': LogLevel.DEBUG,
        'trace': LogLevel.TRACE,
      }[level] ?? LogLevel.INFO;
    } else {
      logLevel = level;
    }
    
    // Skip if log level is below configured threshold
    if (logLevel > this.loggerConfig.level) return;
    
    // Skip debug logs unless debug mode is enabled (backward compatibility)
    if (logLevel === LogLevel.DEBUG && !this.config.debug) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      levelName: LogLevel[logLevel],
      component: this.loggerConfig.component,
      message,
    };
    
    if (requestId) {
      entry.requestId = requestId;
    }
    
    // Add correlation ID if available
    if (requestId && this.correlationIds.has(requestId)) {
      const correlationId = this.correlationIds.get(requestId);
      if (correlationId) {
        entry.correlationId = correlationId;
      }
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
      entry.context = this.loggerConfig.redactSensitive 
        ? this.redactSensitiveData(context) 
        : context;
    }
    
    // Output structured log entry
    if (this.loggerConfig.enableStructured) {
      this.outputStructuredLog(entry);
    }
    
    // Output console log for backward compatibility
    if (this.loggerConfig.enableConsole) {
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
    const correlationInfo = entry.correlationId ? ` [corr:${entry.correlationId}]` : '';
    
    let logMessage = `${prefix}${requestInfo}${correlationInfo} ${entry.message}`;
    
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
    
    console.log(logMessage);
  }

  /**
   * Redact sensitive data from log context
   */
  private redactSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const redacted = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in redacted) {
      if (this.loggerConfig.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }
    
    return redacted;
  }

  /**
   * Get error metrics for health monitoring integration
   */
  public getErrorMetrics() {
    return {
      total: this.errorMetrics.total,
      byCategory: Object.fromEntries(this.errorMetrics.byCategory),
      byCode: Object.fromEntries(this.errorMetrics.byCode),
    };
  }

  /**
   * Request ID generation middleware
   * Adds unique request ID for tracing
   */
  private requestIdMiddleware(req: Request, _res: Response, next: Function): void {
    // Generate unique request ID
    (req as any).requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
  }

  /**
   * Request logging middleware
   * Logs incoming requests with method, URL, and request ID
   */
  private requestLoggingMiddleware(req: Request, res: Response, next: Function): void {
    const requestId = (req as any).requestId || 'unknown';
    this.log('debug', `Incoming request: ${req.method} ${req.url} [${requestId}]`);
    
    // Track request statistics
    this.incrementRequestCount();
    
    // Track errors using res.on('finish')
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        this.incrementErrorCount();
      }
    });
    
    next();
  }

  /**
   * CORS middleware
   * Enhanced CORS configuration for SSE and MCP protocol support
   */
  private corsMiddleware(_req: Request, res: Response, next: Function): void {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Connection');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Cache-Control, Connection');
    next();
  }

  /**
   * Connection limit middleware
   * Prevents server overload by limiting concurrent connections
   */
  private connectionLimitMiddleware(_req: Request, res: Response, next: Function): void {
    if (this.connectionCount >= this.config.maxConnections) {
      this.log('warn', `Connection limit reached (${this.config.maxConnections}). Rejecting new connection.`);
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Maximum connection limit reached. Please try again later.',
      });
      return;
    }
    next();
  }

  /**
   * Request timeout middleware
   * Sets timeout for individual requests
   */
  private requestTimeoutMiddleware(req: Request, res: Response, next: Function): void {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        this.log('warn', `Request timeout: ${req.method} ${req.url}`);
        res.status(408).json({
          error: 'Request timeout',
          message: 'Request took too long to process',
        });
      }
    }, this.config.requestTimeout);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  }

  /**
   * Set up Express middleware
   * Enhanced middleware stack with proper ordering and SSE support
   */
  private setupMiddleware(): void {
    this.log('debug', 'Setting up Express middleware stack...');
    
    // 1. Request ID generation middleware (for tracing)
    this.app.use(this.requestIdMiddleware.bind(this));
    
    // 2. Request logging middleware
    this.app.use(this.requestLoggingMiddleware.bind(this));
    
    // 3. CORS middleware (must be before other middleware)
    if (this.config.cors) {
      this.app.use(this.corsMiddleware.bind(this));
    }
    
    // 4. Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 5. Connection limit middleware
    this.app.use(this.connectionLimitMiddleware.bind(this));
    
    // 6. Request timeout middleware
    this.app.use(this.requestTimeoutMiddleware.bind(this));

    this.log('debug', 'Express middleware setup completed');
  }

  /**
   * Set up server routes
   * Enhanced with SSE endpoint and MCP protocol support
   */
  private setupRoutes(): void {
    this.log('debug', 'Setting up server routes...');
    
    // Basic info endpoint (backward compatibility)
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Tally MCP Server',
        version: '1.0.0',
        status: this.state,
        connections: this.connectionCount,
      });
    });

    // Comprehensive health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const start = process.hrtime();
      const healthy = this.isHealthy();
      const status = healthy ? 200 : 503;
      const responseBody = {
        status: healthy ? 'ok' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: this.getUptime(),
      };
      
      res.status(status).json(responseBody);
      
      const duration = process.hrtime(start);
      const durationMs = duration[0] * 1000 + duration[1] / 1e6;
      this.monitoringService.trackRequest(req.method, req.path, status, durationMs);
    });

    // SSE endpoint for MCP protocol communication
    this.app.get('/sse', (req, res) => {
      this.handleSSEConnection(req, res);
    });

    // MCP protocol message endpoint (POST)
    this.app.post('/message', async (req, res) => {
      await this.handleMCPMessage(req.body, res);
    });

    this.app.get('/metrics', async (req: Request, res: Response) => {
      const start = process.hrtime();
      try {
        this.updateMetricsFromHealth();
        res.set('Content-Type', this.metricsRegistry.contentType);
        res.end(await this.metricsRegistry.metrics());
        
        const duration = process.hrtime(start);
        const durationMs = duration[0] * 1000 + duration[1] / 1e6;
        this.monitoringService.trackRequest(req.method, req.path, 200, durationMs);
      } catch (error) {
        this.log('error', 'Failed to generate metrics', { error }, error instanceof Error ? error : new Error(String(error)));
        res.status(500).send('Failed to generate metrics');
        
        const duration = process.hrtime(start);
        const durationMs = duration[0] * 1000 + duration[1] / 1e6;
        this.monitoringService.trackRequest(req.method, req.path, 500, durationMs, undefined, 'Failed to generate metrics');
      }
    });

    // Default route for 404
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not Found' });
    });

    this.log('debug', 'Server routes setup completed');
  }

  /**
   * Start the HTTP server
   */
  private async startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let resolved = false;
        
        const handleResolve = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(startupTimeout);
            resolve();
          }
        };
        
        const handleReject = (error: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(startupTimeout);
            this.state = ServerState.ERROR;
            reject(error);
          }
        };

        // Set up error handler BEFORE calling listen
        this.server = this.app.listen(this.config.port, this.config.host);
        
        this.server.on('error', (error: any) => {
          this.log('error', 'HTTP server error:', undefined, error as Error);
          
          // Handle specific error types
          if (error.code === 'EADDRINUSE') {
            const portError = new Error(`Port ${this.config.port} is already in use`);
            handleReject(portError);
          } else if (error.code === 'EACCES') {
            const permError = new Error(`Permission denied to bind to port ${this.config.port}`);
            handleReject(permError);
          } else {
            handleReject(error);
          }
        });
        
        this.server.on('listening', () => {
          this.log('info', `HTTP server listening on ${this.config.host}:${this.config.port}`);
          handleResolve();
        });

        // Set server timeout
        this.server.timeout = this.config.requestTimeout;
        
        // Additional timeout to ensure we don't hang indefinitely
        const startupTimeout = setTimeout(() => {
          if (!resolved) {
            handleReject(new Error(`Server failed to start within timeout`));
          }
        }, 5000);
        
      } catch (error) {
        this.state = ServerState.ERROR;
        reject(error);
      }
    });
  }

  /**
   * Stop the HTTP server
   */
  private async stopHttpServer(): Promise<void> {
    if (!this.server) {
      this.log('debug', 'No HTTP server to stop');
      return;
    }

    return new Promise((resolve) => {
      // Track if we've already resolved to prevent double resolution
      let resolved = false;
      
      const doResolve = () => {
        if (!resolved) {
          resolved = true;
          this.server = null;
          resolve();
        }
      };

      // Immediately stop accepting new connections
      this.server.close((error: any) => {
        if (error) {
          this.log('error', 'Error stopping HTTP server:', undefined, error as Error);
        } else {
          this.log('info', 'HTTP server stopped successfully');
        }
        doResolve();
      });

      // Force close existing connections
      if (this.server.listening) {
        this.server.getConnections((err: any, count: number) => {
          if (!err && count > 0) {
            this.log('debug', `Forcibly closing ${count} remaining connections`);
            
            // Destroy all connections immediately
            this.server.closeAllConnections?.();
            
            // Also manually destroy sockets if available
            if (this.server._sockets) {
              for (const socket of this.server._sockets) {
                if (socket && !socket.destroyed) {
                  socket.destroy();
                }
              }
            }
          }
        });
      }

      // Force close after timeout
      setTimeout(() => {
        if (!resolved) {
          this.log('warn', 'Forcing server close due to timeout');
          doResolve();
        }
      }, 100); // Very short timeout for tests
    });
  }

  /**
   * Set up signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    this.log('debug', 'Setting up signal handlers...');

    const handleShutdown = (signal: string) => {
      this.log('info', `Received ${signal}, initiating graceful shutdown...`);
      this.shutdown().catch((error) => {
        this.log('error', 'Error during graceful shutdown:', undefined, error as Error);
        process.exit(1);
      });
    };

    // Store handlers so we can remove them later
    this.signalHandlers['SIGTERM'] = () => handleShutdown('SIGTERM');
    this.signalHandlers['SIGINT'] = () => handleShutdown('SIGINT');

    process.on('SIGTERM', this.signalHandlers['SIGTERM']);
    process.on('SIGINT', this.signalHandlers['SIGINT']);

    this.log('debug', 'Signal handlers setup completed');
  }

  /**
   * Remove signal handlers to prevent memory leaks
   */
  private removeSignalHandlers(): void {
    this.log('debug', 'Removing signal handlers...');
    
    for (const signal in this.signalHandlers) {
      const handler = this.signalHandlers[signal];
      if (handler) {
        process.removeListener(signal, handler);
      }
    }
    
    this.signalHandlers = {};
    this.log('debug', 'Signal handlers removed');
  }

  /**
   * Close all active SSE connections
   */
  private closeAllConnections(): void {
    this.log('info', 'Closing all active connections...');
    for (const connection of this.activeConnections) {
      this.removeConnection(connection);
    }
  }

  /**
   * Initialize all Tally tools
   */
  private initializeTools(): void {
    this.log('info', 'Initializing tools...');
    const apiClientConfig: TallyApiClientConfig = { accessToken: env.TALLY_API_KEY };
    const tallyApiClient = new TallyApiClient(apiClientConfig);
    this.tools = {
      workspaceManagement: new WorkspaceManagementTool(apiClientConfig),
      template: new TemplateTool(),
      form_creation: new FormCreationTool(apiClientConfig),
      form_modification: new FormModificationTool(apiClientConfig),
      form_retrieval: new FormRetrievalTool(apiClientConfig),
      form_sharing: new FormSharingTool(tallyApiClient),
      form_permissions: new FormPermissionManager(apiClientConfig),
      submission_analysis: new SubmissionAnalysisTool(apiClientConfig),
      diagnostic: new DiagnosticTool(),
    };
    this.log('info', 'Tools initialized.');
  }

  /**
   * Extract tools list logic for reuse
   */
  private async _handleToolsList(): Promise<{ tools: any[] }> {
    return {
      tools: [
        {
          name: 'create_form',
          description: 'Create a new Tally form with specified fields and configuration. This tool converts simple field definitions into Tally\'s complex blocks-based structure automatically. The form status defaults to DRAFT if not specified.',
          inputSchema: {
            type: 'object',
            properties: {
              title: { 
                type: 'string', 
                description: 'Form title (required) - will be displayed as the main form heading',
                minLength: 1,
                maxLength: 100
              },
              description: { 
                type: 'string', 
                description: 'Optional form description - displayed below the title to provide context' 
              },
              status: {
                type: 'string',
                enum: ['DRAFT', 'PUBLISHED'],
                description: 'Form publication status. Use DRAFT for unpublished forms that are being worked on, or PUBLISHED for live forms. Defaults to DRAFT if not specified.',
                default: 'DRAFT'
              },
              fields: {
                type: 'array',
                description: 'Array of form fields/questions. Each field will be converted to appropriate Tally blocks automatically.',
                minItems: 1,
                items: {
                  type: 'object',
                  properties: {
                    type: { 
                      type: 'string', 
                      enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'],
                      description: 'Field input type. Maps to Tally blocks: text→INPUT_TEXT, email→INPUT_EMAIL, number→INPUT_NUMBER, textarea→TEXTAREA, select→DROPDOWN, checkbox→CHECKBOXES, radio→MULTIPLE_CHOICE'
                    },
                    label: { 
                      type: 'string',
                      description: 'Field label/question text - what the user will see',
                      minLength: 1
                    },
                    required: { 
                      type: 'boolean',
                      description: 'Whether this field must be filled out before form submission',
                      default: false
                    },
                    options: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Available options for select, checkbox, or radio field types. Required for select/checkbox/radio fields.'
                    }
                  },
                  required: ['type', 'label'],
                  additionalProperties: false
                }
              }
            },
            required: ['title', 'fields'],
            additionalProperties: false,
            examples: [
              {
                title: "Customer Feedback Survey",
                description: "Help us improve our service",
                status: "DRAFT",
                fields: [
                  {
                    type: "text",
                    label: "What is your name?",
                    required: true
                  },
                  {
                    type: "email", 
                    label: "Email address",
                    required: true
                  },
                  {
                    type: "select",
                    label: "How would you rate our service?",
                    required: false,
                    options: ["Excellent", "Good", "Fair", "Poor"]
                  }
                ]
              }
            ]
          }
        },
        {
          name: 'modify_form',
          description: 'Modify an existing Tally form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to modify' },
              title: { type: 'string', description: 'New form title' },
              description: { type: 'string', description: 'New form description' },
              fields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'] },
                    label: { type: 'string' },
                    required: { type: 'boolean' },
                    options: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['type', 'label']
                }
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'get_form',
          description: 'Retrieve information about a specific Tally form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to retrieve' }
            },
            required: ['formId']
          }
        },
        {
          name: 'list_forms',
          description: 'List all forms in the authenticated user\'s Tally account',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Maximum number of forms to return', minimum: 1, maximum: 100 },
              offset: { type: 'number', description: 'Number of forms to skip for pagination', minimum: 0 }
            }
          }
        },
        {
          name: 'delete_form',
          description: 'Delete a Tally form permanently',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to delete' }
            },
            required: ['formId']
          }
        },
        {
          name: 'get_submissions',
          description: 'Retrieve submissions for a specific Tally form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to get submissions for' },
              limit: { type: 'number', description: 'Maximum number of submissions to return', minimum: 1, maximum: 100 },
              offset: { type: 'number', description: 'Number of submissions to skip for pagination', minimum: 0 },
              since: { type: 'string', description: 'Only return submissions created after this ISO 8601 timestamp' }
            },
            required: ['formId']
          }
        },
        {
          name: 'analyze_submissions',
          description: 'Analyze submission data for a Tally form to provide insights and statistics',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to analyze submissions for' },
              analysisType: { 
                type: 'string', 
                enum: ['basic_stats', 'response_patterns', 'completion_rates', 'field_analysis'],
                description: 'Type of analysis to perform'
              },
              dateRange: {
                type: 'object',
                properties: {
                  start: { type: 'string', description: 'Start date for analysis (ISO 8601)' },
                  end: { type: 'string', description: 'End date for analysis (ISO 8601)' }
                }
              }
            },
            required: ['formId', 'analysisType']
          }
        },
        {
          name: 'export_submissions',
          description: 'Export form submissions in various formats',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string', description: 'ID of the form to export submissions for' },
              format: { 
                type: 'string', 
                enum: ['csv', 'json', 'xlsx'],
                description: 'Export format',
                default: 'csv'
              },
              dateRange: {
                type: 'object',
                properties: {
                  start: { type: 'string', description: 'Start date for export (ISO 8601)' },
                  end: { type: 'string', description: 'End date for export (ISO 8601)' }
                }
              },
              includeFields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific field IDs to include in export (all fields if not specified)'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'manage_workspace',
          description: 'Manage workspace settings and information',
          inputSchema: {
            type: 'object',
            properties: {
              action: { 
                type: 'string', 
                enum: ['get_info', 'update_settings', 'list_members'],
                description: 'Action to perform on the workspace'
              },
              settings: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Workspace name' },
                  description: { type: 'string', description: 'Workspace description' }
                }
              }
            },
            required: ['action']
          }
        },
        {
          name: 'generate_template',
          description: 'Generate a form template based on requirements or use case',
          inputSchema: {
            type: 'object',
            properties: {
              templateType: { 
                type: 'string', 
                enum: ['contact', 'survey', 'registration', 'feedback', 'order', 'application', 'custom'],
                description: 'Type of template to generate'
              },
              requirements: { 
                type: 'string', 
                description: 'Specific requirements or use case description for custom templates'
              },
              fields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific fields to include in the template'
              }
            },
            required: ['templateType']
          }
        },
        {
          name: 'submission_analysis',
          description: 'Analyze form submissions, including completion rates and response distributions',
          inputSchema: {
            type: 'object',
            properties: {
              formId: { type: 'string' },
              filters: {
                type: 'object',
                properties: {
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  status: { type: 'string', enum: ['completed', 'incomplete', 'all'] },
                }
              }
            },
            required: ['formId']
          },
          outputSchema: {
            // ...
          }
        },
        {
          name: 'diagnostic_tool',
          description: 'Runs diagnostic checks on the application.',
          inputSchema: {
            type: 'object',
            properties: {
              toolName: { type: 'string', description: 'The name of the specific diagnostic tool to run.' },
            },
          },
          outputSchema: {
            // Can be an array of reports or a single report
          }
        }
      ]
    };
  }

  /**
   * Extract tools call logic for reuse
   */
  private async _handleToolsCall(message: any): Promise<{ content: any[], isError?: boolean }> {
    const { name, arguments: args } = message.params;

    try {
      if (!this.tools) {
        throw new Error('Tools not initialized');
      }

      switch (name) {
        case 'list_forms':
          if (this.tools?.form_retrieval) {
            const forms = await this.tools.form_retrieval.execute(args || {});
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(forms, null, 2)
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: 'Form retrieval functionality is not implemented'
              }
            ]
          };

        case 'manage_workspace':
          if (args && args.action === 'get_info') {
            const workspaceInfo = await this.tools.workspaceManagement.listWorkspaces();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(workspaceInfo, null, 2)
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: 'Workspace management functionality is being implemented'
              }
            ]
          };

        case 'submission_analysis':
          if (this.tools?.submission_analysis) {
            const result = await this.tools.submission_analysis.analyze(args.formId, args.filters);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: 'Submission analysis functionality is not implemented'
              }
            ]
          };

        case 'diagnostic_tool':
          if (this.tools?.diagnostic) {
            const result = await this.tools.diagnostic.execute(args.toolName);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: 'Diagnostic tool functionality is not implemented'
              }
            ]
          };

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Tool ${name} is not yet implemented`
              }
            ]
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Setup MCP tool request handlers
   */
  private setupMCPHandlers(): void {
    // Only set up tool handlers if tools are configured
    if (this.tools || this.config.tools) {
      // Explicitly register capabilities to ensure the SDK knows about tools support
      this.registerCapabilities({
        tools: {},
      });
      
      // Handle list tools requests
      this.setRequestHandler(ListToolsRequestSchema, async () => {
        return this._handleToolsList();
      });

      // Handle call tool requests
      this.setRequestHandler(CallToolRequestSchema, async (request) => {
        return this._handleToolsCall(request);
      });
    }
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  public broadcast(event: string, data: any): void {
    this.broadcastToConnections(event, data);
  }

  private updateMetricsFromHealth(): void {
    const metrics = this.getHealthMetrics();

    let uptimeGauge = this.metricsRegistry.getSingleMetric('process_uptime_seconds') as Gauge;
    if (!uptimeGauge) {
      uptimeGauge = new Gauge({ name: 'process_uptime_seconds', help: 'Server uptime in seconds', registers: [this.metricsRegistry] });
    }
    uptimeGauge.set(metrics.uptime);

    let connectionsGauge = this.metricsRegistry.getSingleMetric('active_connections') as Gauge;
    if (!connectionsGauge) {
      connectionsGauge = new Gauge({ name: 'active_connections', help: 'Number of active connections', registers: [this.metricsRegistry] });
    }
    connectionsGauge.set(metrics.connections);

    let memoryUsedGauge = this.metricsRegistry.getSingleMetric('memory_used_bytes') as Gauge;
    if (!memoryUsedGauge) {
      memoryUsedGauge = new Gauge({ name: 'memory_used_bytes', help: 'Memory usage in bytes', registers: [this.metricsRegistry] });
    }
    memoryUsedGauge.set(metrics.memory.used);

    let requestsTotalGauge = this.metricsRegistry.getSingleMetric('http_requests_total') as Gauge;
    if (!requestsTotalGauge) {
      requestsTotalGauge = new Gauge({ name: 'http_requests_total', help: 'Total number of HTTP requests', registers: [this.metricsRegistry] });
    }
    requestsTotalGauge.set(metrics.requests.total);

    let errorsTotalGauge = this.metricsRegistry.getSingleMetric('http_requests_errors_total') as Gauge;
    if (!errorsTotalGauge) {
      errorsTotalGauge = new Gauge({ name: 'http_requests_errors_total', help: 'Total number of HTTP request errors', registers: [this.metricsRegistry] });
    }
    errorsTotalGauge.set(metrics.requests.errors);
  }

  /**
   * Handle MCP protocol messages
   * Processes incoming MCP protocol messages using proper MCP SDK request handling
   */
  private async handleMCPMessage(message: any, res: Response): Promise<void> {
    this.log('debug', 'Received MCP message:', { message, messageType: typeof message });

    try {
      // Validate message structure
      if (message === null || 
          message === undefined || 
          typeof message !== 'object' || 
          Array.isArray(message) ||
          Object.keys(message).length === 0) {
        res.status(400).json({
          jsonrpc: '2.0',
          id: message?.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: 'Message must be a valid non-empty object'
          }
        });
        return;
      }

      // Validate JSON-RPC structure
      if (message.jsonrpc !== '2.0' || !message.method || typeof message.method !== 'string') {
        res.status(400).json({
          jsonrpc: '2.0',
          id: message?.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: 'Request must be valid JSON-RPC 2.0 with method field'
          }
        });
        return;
      }

      let mcpResponse;
      
      try {
        switch (message.method) {
          case 'initialize':
            // Validate protocol version
            if (!message.params?.protocolVersion) {
              mcpResponse = {
                jsonrpc: '2.0',
                id: message.id,
                error: {
                  code: -32602,
                  message: 'Invalid params',
                  data: 'Protocol version is required'
                }
              };
              break;
            }

            if (message.params.protocolVersion !== '2024-11-05') {
              mcpResponse = {
                jsonrpc: '2.0',
                id: message.id,
                error: {
                  code: -32600,
                  message: 'Invalid Request',
                  data: 'Unsupported protocol version'
                }
              };
              break;
            }

            try {
              const capabilities = negotiateCapabilities(message.params.capabilities);
              mcpResponse = {
                jsonrpc: '2.0',
                id: message.id,
                result: {
                  protocolVersion: '2024-11-05',
                  capabilities,
                  serverInfo: {
                    name: 'tally-mcp-server',
                    version: '1.0.0',
                    description: 'MCP server for Tally.so form management and automation'
                  }
                }
              };
            } catch (error) {
              mcpResponse = {
                jsonrpc: '2.0',
                id: message.id,
                error: {
                  code: -32602,
                  message: 'Invalid params',
                  data: error instanceof Error ? error.message : 'Invalid capabilities'
                }
              };
            }
            break;

          case 'tools/list':
            // Use the registered handler
            const toolsResult = await this._handleToolsList();
            mcpResponse = {
              jsonrpc: '2.0',
              id: message.id,
              result: toolsResult
            };
            break;

          case 'tools/call':
            // Use the registered handler
            const callResult = await this._handleToolsCall(message);
            mcpResponse = {
              jsonrpc: '2.0',
              id: message.id,
              result: callResult
            };
            break;

          case 'resources/list':
            mcpResponse = {
              jsonrpc: '2.0',
              id: message.id,
              result: {
                resources: []
              }
            };
            break;

          case 'prompts/list':
            mcpResponse = {
              jsonrpc: '2.0',
              id: message.id,
              result: {
                prompts: []
              }
            };
            break;

          default:
            mcpResponse = {
              jsonrpc: '2.0',
              id: message.id,
              error: {
                code: -32601,
                message: 'Method not found',
                data: `Unknown method: ${message.method}`
              }
            };
        }
      } catch (error) {
        this.log('error', 'Error processing MCP request:', undefined, error as Error);
        mcpResponse = {
          jsonrpc: '2.0',
          id: message.id,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      this.broadcastToConnections('message', mcpResponse);
      res.json(mcpResponse);
    } catch (error) {
      this.log('error', 'Error processing MCP message:', undefined, error as Error);
      res.status(500).json({
        jsonrpc: '2.0',
        id: message?.id || null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
} 