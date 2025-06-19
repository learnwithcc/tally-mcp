import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import * as os from 'os';
import { TemplateTool, WorkspaceManagementTool, FormCreationTool, FormModificationTool, FormPermissionManager, FormRetrievalTool, FormSharingTool, SubmissionAnalysisTool, DiagnosticTool, } from './tools';
import { EventEmitter } from 'events';
import { env } from './config/env';
import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';
import { MonitoringServiceImpl } from './services/MonitoringService';
import { Logger } from './utils/logger';
import { SentryService } from './services/SentryService';
import { TallyApiClient } from './services/TallyApiClient';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FATAL"] = 0] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 5] = "TRACE";
})(LogLevel || (LogLevel = {}));
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["AUTHORIZATION"] = "authorization";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["TIMEOUT"] = "timeout";
    ErrorCategory["RATE_LIMIT"] = "rate_limit";
    ErrorCategory["INTERNAL"] = "internal";
    ErrorCategory["EXTERNAL"] = "external";
    ErrorCategory["CONFIGURATION"] = "configuration";
    ErrorCategory["RESOURCE"] = "resource";
})(ErrorCategory || (ErrorCategory = {}));
export const DEFAULT_LOGGER_CONFIG = {
    level: LogLevel.INFO,
    component: 'MCPServer',
    enableConsole: true,
    enableStructured: true,
    redactSensitive: true,
    sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie'],
};
export const DEFAULT_CONFIG = {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    requestTimeout: 30000,
    maxConnections: 100,
    debug: false,
    logger: DEFAULT_LOGGER_CONFIG,
};
export var ServerState;
(function (ServerState) {
    ServerState["STOPPED"] = "stopped";
    ServerState["STARTING"] = "starting";
    ServerState["RUNNING"] = "running";
    ServerState["STOPPING"] = "stopping";
    ServerState["ERROR"] = "error";
})(ServerState || (ServerState = {}));
export const DEFAULT_HEALTH_THRESHOLDS = {
    maxMemoryPercent: 95,
    maxLoadAverage: 20,
    maxErrorRate: 50,
    maxConnections: 90,
};
export const SERVER_CAPABILITIES = {
    protocolVersion: '1.0',
    tools: {
        listChanged: true
    },
    resources: {
        subscribe: false,
        listChanged: false
    },
    prompts: {
        listChanged: false,
    },
    logging: {}
};
function negotiateCapabilities(clientCapabilities) {
    const clientCaps = (clientCapabilities || {});
    const negotiated = {
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
        logging: {}
    };
    return negotiated;
}
export class MCPServer extends Server {
    constructor(config = {}) {
        const fullConfig = {
            ...DEFAULT_CONFIG,
            ...config,
            logger: { ...DEFAULT_LOGGER_CONFIG, ...config.logger },
        };
        super({
            name: 'tally-mcp-server-test',
            version: '1.0.0',
            capabilities: fullConfig.capabilities,
            debug: fullConfig.debug,
        });
        this.signalHandlers = {};
        this.correlationIds = new Map();
        this.config = fullConfig;
        this.loggerConfig = fullConfig.logger;
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
        this.monitoringService = new MonitoringServiceImpl({ writeDataPoint: () => { } }, logger);
        SentryService.initialize();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupMCPHandlers();
        this.setupSignalHandlers();
    }
    getState() {
        return this.state;
    }
    getConnectionCount() {
        return this.connectionCount;
    }
    getConfig() {
        return {
            ...this.config,
            logger: { ...this.loggerConfig }
        };
    }
    getHealthMetrics() {
        const uptime = this.getUptime();
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryPercentage = (usedMemory / totalMemory) * 100;
        const loadAverage = os.loadavg();
        this.updateRequestStats();
        const metrics = {
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
                usage: loadAverage?.[0] ?? 0,
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
    isHealthy() {
        if (this.state !== ServerState.RUNNING) {
            return false;
        }
        const totalMemory = os.totalmem();
        const memoryPercentage = ((totalMemory - os.freemem()) / totalMemory) * 100;
        if (memoryPercentage > this.healthThresholds.maxMemoryPercent) {
            return false;
        }
        const loadAverage = os.loadavg();
        if (loadAverage?.[0] && loadAverage[0] > this.healthThresholds.maxLoadAverage) {
            return false;
        }
        if (this.getErrorRate() > this.healthThresholds.maxErrorRate) {
            return false;
        }
        const maxConnections = (this.config.maxConnections * this.healthThresholds.maxConnections) / 100;
        if (this.connectionCount > maxConnections) {
            return false;
        }
        return true;
    }
    getUptime() {
        const diff = process.hrtime(this.startTime);
        return Math.round((diff[0] * 1000) + (diff[1] / 1e6));
    }
    getRequestRate() {
        const sum = this.requestStats.recentRequests.reduce((a, b) => a + b, 0);
        return sum;
    }
    getErrorRate() {
        const sum = this.requestStats.recentErrors.reduce((a, b) => a + b, 0);
        return sum;
    }
    updateRequestStats() {
        const currentMinute = Math.floor(Date.now() / 60000);
        const arrayIndex = currentMinute % 60;
        if (arrayIndex !== this.requestStats.lastMinuteIndex) {
            this.requestStats.recentRequests[arrayIndex] = 0;
            this.requestStats.recentErrors[arrayIndex] = 0;
            this.requestStats.lastMinuteIndex = arrayIndex;
        }
    }
    incrementRequestCount() {
        this.requestStats.total++;
        this.updateRequestStats();
        const currentMinute = Math.floor(Date.now() / 60000);
        const arrayIndex = currentMinute % 60;
        if (this.requestStats.recentRequests[arrayIndex] !== undefined) {
            this.requestStats.recentRequests[arrayIndex]++;
        }
    }
    incrementErrorCount() {
        this.requestStats.errors++;
        this.updateRequestStats();
        const currentMinute = Math.floor(Date.now() / 60000);
        const arrayIndex = currentMinute % 60;
        if (this.requestStats.recentErrors[arrayIndex] !== undefined) {
            this.requestStats.recentErrors[arrayIndex]++;
        }
    }
    async initialize() {
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
        }
        catch (error) {
            this.log('fatal', 'Server failed to start', undefined, error);
            this.state = ServerState.ERROR;
            throw error;
        }
    }
    async shutdown() {
        if (this.state === ServerState.STOPPED || this.state === ServerState.STOPPING) {
            this.log('warn', 'Server is already stopped or stopping');
            return;
        }
        try {
            this.state = ServerState.STOPPING;
            this.log('info', 'Starting graceful server shutdown...');
            this.removeSignalHandlers();
            this.closeAllConnections();
            await this.stopHttpServer();
            this.state = ServerState.STOPPED;
            this.log('info', 'Server shutdown completed successfully');
        }
        catch (error) {
            this.state = ServerState.ERROR;
            this.log('error', 'Error during server shutdown:', undefined, error);
            throw error;
        }
    }
    async handleSSEConnection(req, res) {
        const requestId = req.requestId || 'unknown';
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
    removeConnection(res) {
        if (this.activeConnections.has(res)) {
            this.activeConnections.delete(res);
            this.connectionCount--;
            this.log('debug', `Connection removed. Active connections: ${this.connectionCount}`);
            if (!res.destroyed) {
                res.end();
            }
        }
    }
    sendSSEMessage(res, event, data) {
        if (res.destroyed || !this.activeConnections.has(res)) {
            return;
        }
        try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            res.write(message);
        }
        catch (error) {
            this.log('error', 'Error sending SSE message:', undefined, error);
            this.removeConnection(res);
        }
    }
    broadcastToConnections(event, data) {
        this.log('debug', `Broadcasting to ${this.activeConnections.size} connections`);
        for (const connection of this.activeConnections) {
            this.sendSSEMessage(connection, event, data);
        }
    }
    log(level, message, context, error, requestId) {
        let logLevel;
        if (typeof level === 'string') {
            logLevel = {
                'fatal': LogLevel.FATAL,
                'error': LogLevel.ERROR,
                'warn': LogLevel.WARN,
                'info': LogLevel.INFO,
                'debug': LogLevel.DEBUG,
                'trace': LogLevel.TRACE,
            }[level] ?? LogLevel.INFO;
        }
        else {
            logLevel = level;
        }
        if (logLevel > this.loggerConfig.level)
            return;
        if (logLevel === LogLevel.DEBUG && !this.config.debug)
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level: logLevel,
            levelName: LogLevel[logLevel],
            component: this.loggerConfig.component,
            message,
        };
        if (requestId) {
            entry.requestId = requestId;
        }
        if (requestId && this.correlationIds.has(requestId)) {
            const correlationId = this.correlationIds.get(requestId);
            if (correlationId) {
                entry.correlationId = correlationId;
            }
        }
        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
            };
            if (error.stack) {
                entry.error.stack = error.stack;
            }
            if (error.code) {
                entry.error.code = error.code;
            }
        }
        if (context) {
            entry.context = this.loggerConfig.redactSensitive
                ? this.redactSensitiveData(context)
                : context;
        }
        if (this.loggerConfig.enableStructured) {
            this.outputStructuredLog(entry);
        }
        if (this.loggerConfig.enableConsole) {
            this.outputConsoleLog(entry);
        }
    }
    outputStructuredLog(entry) {
        console.log(JSON.stringify(entry));
    }
    outputConsoleLog(entry) {
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
    redactSensitiveData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const redacted = Array.isArray(data) ? [...data] : { ...data };
        for (const key in redacted) {
            if (this.loggerConfig.sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                redacted[key] = '[REDACTED]';
            }
            else if (typeof redacted[key] === 'object') {
                redacted[key] = this.redactSensitiveData(redacted[key]);
            }
        }
        return redacted;
    }
    getErrorMetrics() {
        return {
            total: this.errorMetrics.total,
            byCategory: Object.fromEntries(this.errorMetrics.byCategory),
            byCode: Object.fromEntries(this.errorMetrics.byCode),
        };
    }
    requestIdMiddleware(req, _res, next) {
        req.requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        next();
    }
    requestLoggingMiddleware(req, res, next) {
        const requestId = req.requestId || 'unknown';
        this.log('debug', `Incoming request: ${req.method} ${req.url} [${requestId}]`);
        this.incrementRequestCount();
        res.on('finish', () => {
            if (res.statusCode >= 400) {
                this.incrementErrorCount();
            }
        });
        next();
    }
    corsMiddleware(_req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Connection');
        res.header('Access-Control-Expose-Headers', 'Content-Type, Cache-Control, Connection');
        next();
    }
    connectionLimitMiddleware(_req, res, next) {
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
    requestTimeoutMiddleware(req, res, next) {
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
    setupMiddleware() {
        this.log('debug', 'Setting up Express middleware stack...');
        this.app.use(this.requestIdMiddleware.bind(this));
        this.app.use(this.requestLoggingMiddleware.bind(this));
        if (this.config.cors) {
            this.app.use(this.corsMiddleware.bind(this));
        }
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(this.connectionLimitMiddleware.bind(this));
        this.app.use(this.requestTimeoutMiddleware.bind(this));
        this.log('debug', 'Express middleware setup completed');
    }
    setupRoutes() {
        this.log('debug', 'Setting up server routes...');
        this.app.get('/', (_req, res) => {
            res.json({
                name: 'Tally MCP Server',
                version: '1.0.0',
                status: this.state,
                connections: this.connectionCount,
            });
        });
        this.app.get('/health', (req, res) => {
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
        this.app.get('/sse', (req, res) => {
            this.handleSSEConnection(req, res);
        });
        this.app.post('/message', async (req, res) => {
            await this.handleMCPMessage(req.body, res);
        });
        this.app.get('/metrics', async (req, res) => {
            const start = process.hrtime();
            try {
                this.updateMetricsFromHealth();
                res.set('Content-Type', this.metricsRegistry.contentType);
                res.end(await this.metricsRegistry.metrics());
                const duration = process.hrtime(start);
                const durationMs = duration[0] * 1000 + duration[1] / 1e6;
                this.monitoringService.trackRequest(req.method, req.path, 200, durationMs);
            }
            catch (error) {
                this.log('error', 'Failed to generate metrics', { error }, error instanceof Error ? error : new Error(String(error)));
                res.status(500).send('Failed to generate metrics');
                const duration = process.hrtime(start);
                const durationMs = duration[0] * 1000 + duration[1] / 1e6;
                this.monitoringService.trackRequest(req.method, req.path, 500, durationMs, undefined, 'Failed to generate metrics');
            }
        });
        this.app.use((_req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });
        this.log('debug', 'Server routes setup completed');
    }
    async startHttpServer() {
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
                const handleReject = (error) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(startupTimeout);
                        this.state = ServerState.ERROR;
                        reject(error);
                    }
                };
                this.server = this.app.listen(this.config.port, this.config.host);
                this.server.on('error', (error) => {
                    this.log('error', 'HTTP server error:', undefined, error);
                    if (error.code === 'EADDRINUSE') {
                        const portError = new Error(`Port ${this.config.port} is already in use`);
                        handleReject(portError);
                    }
                    else if (error.code === 'EACCES') {
                        const permError = new Error(`Permission denied to bind to port ${this.config.port}`);
                        handleReject(permError);
                    }
                    else {
                        handleReject(error);
                    }
                });
                this.server.on('listening', () => {
                    this.log('info', `HTTP server listening on ${this.config.host}:${this.config.port}`);
                    handleResolve();
                });
                this.server.timeout = this.config.requestTimeout;
                const startupTimeout = setTimeout(() => {
                    if (!resolved) {
                        handleReject(new Error(`Server failed to start within timeout`));
                    }
                }, 5000);
            }
            catch (error) {
                this.state = ServerState.ERROR;
                reject(error);
            }
        });
    }
    async stopHttpServer() {
        if (!this.server) {
            this.log('debug', 'No HTTP server to stop');
            return;
        }
        return new Promise((resolve) => {
            let resolved = false;
            const doResolve = () => {
                if (!resolved) {
                    resolved = true;
                    this.server = null;
                    resolve();
                }
            };
            this.server.close((error) => {
                if (error) {
                    this.log('error', 'Error stopping HTTP server:', undefined, error);
                }
                else {
                    this.log('info', 'HTTP server stopped successfully');
                }
                doResolve();
            });
            if (this.server.listening) {
                this.server.getConnections((err, count) => {
                    if (!err && count > 0) {
                        this.log('debug', `Forcibly closing ${count} remaining connections`);
                        this.server.closeAllConnections?.();
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
            setTimeout(() => {
                if (!resolved) {
                    this.log('warn', 'Forcing server close due to timeout');
                    doResolve();
                }
            }, 100);
        });
    }
    setupSignalHandlers() {
        this.log('debug', 'Setting up signal handlers...');
        const handleShutdown = (signal) => {
            this.log('info', `Received ${signal}, initiating graceful shutdown...`);
            this.shutdown().catch((error) => {
                this.log('error', 'Error during graceful shutdown:', undefined, error);
                process.exit(1);
            });
        };
        this.signalHandlers['SIGTERM'] = () => handleShutdown('SIGTERM');
        this.signalHandlers['SIGINT'] = () => handleShutdown('SIGINT');
        process.on('SIGTERM', this.signalHandlers['SIGTERM']);
        process.on('SIGINT', this.signalHandlers['SIGINT']);
        this.log('debug', 'Signal handlers setup completed');
    }
    removeSignalHandlers() {
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
    closeAllConnections() {
        this.log('info', 'Closing all active connections...');
        for (const connection of this.activeConnections) {
            this.removeConnection(connection);
        }
    }
    initializeTools() {
        this.log('info', 'Initializing tools...');
        const apiClientConfig = { accessToken: env.TALLY_API_KEY };
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
    async _handleToolsList() {
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
                    outputSchema: {}
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
                    outputSchema: {}
                }
            ]
        };
    }
    async _handleToolsCall(message) {
        const { name, arguments: args } = message.params;
        try {
            if (!this.tools) {
                throw new Error('Tools not initialized');
            }
            switch (name) {
                case 'list_forms':
                    const forms = await this.tools.workspaceManagement.listWorkspaces();
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(forms, null, 2)
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
        }
        catch (error) {
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
    setupMCPHandlers() {
        this.setRequestHandler(ListToolsRequestSchema, async () => {
            return this._handleToolsList();
        });
        this.setRequestHandler(CallToolRequestSchema, async (request) => {
            return this._handleToolsCall(request);
        });
    }
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    emit(event, ...args) {
        return this.emitter.emit(event, ...args);
    }
    broadcast(event, data) {
        this.broadcastToConnections(event, data);
    }
    updateMetricsFromHealth() {
        const metrics = this.getHealthMetrics();
        let uptimeGauge = this.metricsRegistry.getSingleMetric('process_uptime_seconds');
        if (!uptimeGauge) {
            uptimeGauge = new Gauge({ name: 'process_uptime_seconds', help: 'Server uptime in seconds', registers: [this.metricsRegistry] });
        }
        uptimeGauge.set(metrics.uptime);
        let connectionsGauge = this.metricsRegistry.getSingleMetric('active_connections');
        if (!connectionsGauge) {
            connectionsGauge = new Gauge({ name: 'active_connections', help: 'Number of active connections', registers: [this.metricsRegistry] });
        }
        connectionsGauge.set(metrics.connections);
        let memoryUsedGauge = this.metricsRegistry.getSingleMetric('memory_used_bytes');
        if (!memoryUsedGauge) {
            memoryUsedGauge = new Gauge({ name: 'memory_used_bytes', help: 'Memory usage in bytes', registers: [this.metricsRegistry] });
        }
        memoryUsedGauge.set(metrics.memory.used);
        let requestsTotalGauge = this.metricsRegistry.getSingleMetric('http_requests_total');
        if (!requestsTotalGauge) {
            requestsTotalGauge = new Gauge({ name: 'http_requests_total', help: 'Total number of HTTP requests', registers: [this.metricsRegistry] });
        }
        requestsTotalGauge.set(metrics.requests.total);
        let errorsTotalGauge = this.metricsRegistry.getSingleMetric('http_requests_errors_total');
        if (!errorsTotalGauge) {
            errorsTotalGauge = new Gauge({ name: 'http_requests_errors_total', help: 'Total number of HTTP request errors', registers: [this.metricsRegistry] });
        }
        errorsTotalGauge.set(metrics.requests.errors);
    }
    async handleMCPMessage(message, res) {
        this.log('debug', 'Received MCP message:', { message, messageType: typeof message });
        try {
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
                        }
                        catch (error) {
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
                        const toolsResult = await this._handleToolsList();
                        mcpResponse = {
                            jsonrpc: '2.0',
                            id: message.id,
                            result: toolsResult
                        };
                        break;
                    case 'tools/call':
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
            }
            catch (error) {
                this.log('error', 'Error processing MCP request:', undefined, error);
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
        }
        catch (error) {
            this.log('error', 'Error processing MCP message:', undefined, error);
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
//# sourceMappingURL=server.js.map