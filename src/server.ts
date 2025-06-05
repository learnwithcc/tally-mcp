/**
 * Tally MCP Server
 * 
 * Main server class that extends the MCP SDK Server with SSE transport support
 * for managing Tally.so forms through natural language commands.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import express, { Express, Request, Response } from 'express';

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
    return { ...this.config };
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
   * Log message with timestamp and context
   * Enhanced with request context support
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: any[]): void {
    if (level === 'debug' && !this.config.debug) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [MCPServer]`;
    console.log(`${prefix} ${message}`, ...args);
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
  private requestLoggingMiddleware(req: Request, _res: Response, next: Function): void {
    const requestId = (req as any).requestId || 'unknown';
    this.log('debug', `Incoming request: ${req.method} ${req.url} [${requestId}]`);
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
    
    // Health check endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Tally MCP Server',
        version: '1.0.0',
        status: this.state,
        connections: this.connectionCount,
      });
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