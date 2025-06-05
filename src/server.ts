/**
 * Tally MCP Server
 * 
 * Main server class that extends the MCP SDK Server with SSE transport support
 * for managing Tally.so forms through natural language commands.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import express, { Express, Request, Response } from 'express';
import * as os from 'os';

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
 * Main MCP Server class that extends the MCP SDK Server
 * Provides SSE transport support and Express.js integration
 */
export class MCPServer extends Server {
  private config: MCPServerConfig;
  // @ts-ignore - Will be used in subtask 2.2
  private app: Express;
  // @ts-ignore - Will be used in subtask 2.2
  private server: any;
  private state: ServerState;
  private activeConnections: Set<Response>;
  private connectionCount: number;
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

  /**
   * Create a new MCP Server instance
   * @param config Server configuration options
   */
  constructor(config: Partial<MCPServerConfig> = {}) {
    // Initialize the base MCP Server
    super(
      {
        name: 'tally-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Merge configuration with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize Express app
    this.app = express();
    
    // Initialize server state
    this.state = ServerState.STOPPED;
    this.activeConnections = new Set();
    this.connectionCount = 0;
    
    // Initialize health monitoring
    this.startTime = process.hrtime();
    this.healthThresholds = { ...DEFAULT_HEALTH_THRESHOLDS };
    this.requestStats = {
      total: 0,
      errors: 0,
      recentRequests: new Array(60).fill(0), // Track last 60 minutes
      recentErrors: new Array(60).fill(0),   // Track last 60 minutes
      lastMinuteIndex: 0,
    };
    
    // Initialize logging infrastructure
    this.loggerConfig = { 
      ...DEFAULT_LOGGER_CONFIG, 
      ...(this.config.logger || {})
    };
    this.errorMetrics = {
      byCategory: new Map(),
      byCode: new Map(),
      total: 0,
    };
    
    // Bind methods to preserve context
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.getState = this.getState.bind(this);
    this.getConnectionCount = this.getConnectionCount.bind(this);
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
      throw new Error(`Cannot initialize server in state: ${this.state}`);
    }

    try {
      this.state = ServerState.STARTING;
      this.log('info', 'Starting server initialization...');

      // Set up basic Express middleware
      this.setupMiddleware();

      // Set up routes
      this.setupRoutes();

      // Start the HTTP server
      await this.startHttpServer();

      // Set up signal handlers for graceful shutdown
      this.setupSignalHandlers();

      this.state = ServerState.RUNNING;
      this.log('info', `Server successfully initialized and running on ${this.config.host}:${this.config.port}`);
    } catch (error) {
      this.state = ServerState.ERROR;
      this.log('error', 'Failed to initialize server:', error);
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
      this.log('error', 'Error during server shutdown:', error);
      throw error;
    }
  }

  /**
   * Handle new SSE connection
   * Establishes Server-Sent Events connection for MCP protocol communication
   */
  private handleSSEConnection(req: Request, res: Response): void {
    const requestId = (req as any).requestId || 'unknown';
    this.log('info', `New SSE connection established [${requestId}]`);

    // Check if response is already closed
    if (res.destroyed || res.headersSent) {
      this.log('warn', `Attempted to setup SSE on closed connection [${requestId}]`);
      return;
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Connection',
    });

    // Add connection to active connections
    this.activeConnections.add(res);
    this.connectionCount++;

    // Send initial connection confirmation
    this.sendSSEMessage(res, 'connection', {
      status: 'connected',
      serverId: requestId,
      serverInfo: {
        name: 'Tally MCP Server',
        version: '1.0.0',
        capabilities: ['tools', 'resources', 'prompts'],
      },
    });

    // Set up connection timeout
    const timeout = setTimeout(() => {
      this.log('debug', `SSE connection timeout [${requestId}]`);
      this.removeConnection(res);
    }, this.config.requestTimeout * 2); // Extended timeout for SSE

    // Handle connection close
    req.on('close', () => {
      clearTimeout(timeout);
      this.log('info', `SSE connection closed [${requestId}]`);
      this.removeConnection(res);
    });

    // Handle connection abort
    req.on('aborted', () => {
      clearTimeout(timeout);
      this.log('info', `SSE connection aborted [${requestId}]`);
      this.removeConnection(res);
    });

    // Handle connection errors
    res.on('error', (error) => {
      clearTimeout(timeout);
      this.log('error', `SSE connection error [${requestId}]:`, error);
      this.removeConnection(res);
    });

    // Handle response finish
    res.on('finish', () => {
      clearTimeout(timeout);
      this.log('debug', `SSE response finished [${requestId}]`);
      this.removeConnection(res);
    });

    // Send periodic heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      if (this.activeConnections.has(res) && !res.destroyed) {
        this.sendSSEMessage(res, 'heartbeat', { timestamp: Date.now() });
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // 30 second heartbeat

    // Clean up heartbeat on connection removal
    res.on('close', () => clearInterval(heartbeat));
  }

  /**
   * Handle MCP protocol messages
   * Processes incoming MCP protocol messages and sends responses via SSE
   */
  private handleMCPMessage(message: any, res: Response): void {
    this.log('debug', 'Received MCP message:', message, 'Type:', typeof message);

    try {
      // Validate message structure - be strict about null/undefined/empty
      if (message === null || 
          message === undefined || 
          typeof message !== 'object' || 
          Array.isArray(message) ||
          Object.keys(message).length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid MCP message',
          error: 'Message must be a valid non-empty object'
        });
        return;
      }

      // For now, echo back the message with server response
      // This will be enhanced in subsequent subtasks with actual MCP protocol handling
      const response = {
        id: message.id || Date.now(),
        type: 'response',
        response: {
          status: 'received',
          originalMessage: message,
          serverTime: new Date().toISOString(),
        },
      };

      // Send response back to all connected SSE clients
      this.broadcastToConnections('message', response);

      // Send HTTP response
      res.json({
        status: 'success',
        message: 'MCP message processed',
        messageId: response.id,
      });
    } catch (error) {
      this.log('error', 'Error processing MCP message:', error);
      res.status(400).json({
        status: 'error',
        message: 'Invalid MCP message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
      this.log('error', 'Error sending SSE message:', error);
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
   * Create structured error with proper categorization
   */
  private createStructuredError(
    message: string,
    category: ErrorCategory,
    statusCode: number,
    code: string,
    isOperational: boolean = true,
    context?: Record<string, any>
  ): StructuredError {
    const error = new Error(message) as StructuredError;
    error.category = category;
    error.code = code;
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    if (context) {
      error.context = context;
    }
    
    // Track error metrics
    this.trackErrorMetrics(category, code);
    
    return error;
  }

  /**
   * Track error metrics for monitoring
   */
  private trackErrorMetrics(category: ErrorCategory, code: string): void {
    this.errorMetrics.total++;
    
    const categoryCount = this.errorMetrics.byCategory.get(category) || 0;
    this.errorMetrics.byCategory.set(category, categoryCount + 1);
    
    const codeCount = this.errorMetrics.byCode.get(code) || 0;
    this.errorMetrics.byCode.set(code, codeCount + 1);
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
   * Backward compatibility wrapper for old log signature
   */
  private logCompat(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: any[]): void {
    // Handle the old signature where errors might be passed as additional arguments
    let error: Error | undefined;
    let context: Record<string, any> | undefined;
    
    // Extract error from args if present
    for (const arg of args) {
      if (arg instanceof Error) {
        error = arg;
        break;
      }
    }
    
    // For backward compatibility, convert remaining args to context
    if (args.length > 0 && !error) {
      context = { additionalData: args };
    }
    
    this.log(level, message, context, error);
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
      this.log('warn', `Connection limit reached: ${this.connectionCount}/${this.config.maxConnections}`);
      res.status(503).json({
        error: 'Server at capacity',
        message: 'Too many active connections. Please try again later.',
        maxConnections: this.config.maxConnections,
        currentConnections: this.connectionCount,
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
    this.app.get('/health', (_req, res) => {
      try {
        const healthMetrics = this.getHealthMetrics();
        const statusCode = healthMetrics.healthy ? 200 : 503;
        res.status(statusCode).json(healthMetrics);
      } catch (error) {
        this.log('error', 'Error generating health metrics:', error);
        res.status(500).json({
          healthy: false,
          status: 'error',
          error: 'Failed to generate health metrics',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // SSE endpoint for MCP protocol communication
    this.app.get('/sse', (req, res) => {
      this.handleSSEConnection(req, res);
    });

    // MCP protocol message endpoint (POST)
    this.app.post('/message', (req, res) => {
      this.handleMCPMessage(req.body, res);
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
          this.log('error', 'HTTP server error:', error);
          
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
          this.log('error', 'Error stopping HTTP server:', error);
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
        this.log('error', 'Error during graceful shutdown:', error);
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
    
    for (const [signal, handler] of Object.entries(this.signalHandlers)) {
      process.removeListener(signal as NodeJS.Signals, handler);
    }
    
    this.signalHandlers = {};
    this.log('debug', 'Signal handlers removed');
  }

  /**
   * Close all active SSE connections
   */
  private closeAllConnections(): void {
    this.log('info', `Closing ${this.activeConnections.size} active connections...`);
    
    for (const connection of this.activeConnections) {
      try {
        connection.end();
      } catch (error) {
        this.log('warn', 'Error closing connection:', error);
      }
    }
    
    this.activeConnections.clear();
    this.connectionCount = 0;
    this.log('info', 'All connections closed');
  }
} 