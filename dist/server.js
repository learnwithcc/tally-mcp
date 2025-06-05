"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = exports.DEFAULT_HEALTH_THRESHOLDS = exports.ServerState = exports.DEFAULT_CONFIG = exports.DEFAULT_LOGGER_CONFIG = exports.ErrorCategory = exports.LogLevel = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const express_1 = __importDefault(require("express"));
const os = __importStar(require("os"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FATAL"] = 0] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 5] = "TRACE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var ErrorCategory;
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
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
exports.DEFAULT_LOGGER_CONFIG = {
    level: LogLevel.INFO,
    component: 'MCPServer',
    enableConsole: true,
    enableStructured: true,
    redactSensitive: true,
    sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie'],
};
exports.DEFAULT_CONFIG = {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    requestTimeout: 30000,
    maxConnections: 100,
    debug: false,
    logger: exports.DEFAULT_LOGGER_CONFIG,
};
var ServerState;
(function (ServerState) {
    ServerState["STOPPED"] = "stopped";
    ServerState["STARTING"] = "starting";
    ServerState["RUNNING"] = "running";
    ServerState["STOPPING"] = "stopping";
    ServerState["ERROR"] = "error";
})(ServerState || (exports.ServerState = ServerState = {}));
exports.DEFAULT_HEALTH_THRESHOLDS = {
    maxMemoryPercent: 95,
    maxLoadAverage: 20,
    maxErrorRate: 50,
    maxConnections: 90,
};
class MCPServer extends index_js_1.Server {
    constructor(config = {}) {
        super({
            name: 'tally-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.signalHandlers = {};
        this.correlationIds = new Map();
        this.config = { ...exports.DEFAULT_CONFIG, ...config };
        this.app = (0, express_1.default)();
        this.state = ServerState.STOPPED;
        this.activeConnections = new Set();
        this.connectionCount = 0;
        this.startTime = process.hrtime();
        this.healthThresholds = { ...exports.DEFAULT_HEALTH_THRESHOLDS };
        this.requestStats = {
            total: 0,
            errors: 0,
            recentRequests: new Array(60).fill(0),
            recentErrors: new Array(60).fill(0),
            lastMinuteIndex: 0,
        };
        this.loggerConfig = { ...exports.DEFAULT_LOGGER_CONFIG, ...this.config.logger };
        this.errorMetrics = {
            byCategory: new Map(),
            byCode: new Map(),
            total: 0,
        };
        this.initialize = this.initialize.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.getState = this.getState.bind(this);
        this.getConnectionCount = this.getConnectionCount.bind(this);
    }
    getState() {
        return this.state;
    }
    getConnectionCount() {
        return this.connectionCount;
    }
    getConfig() {
        return { ...this.config };
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
            throw new Error(`Cannot initialize server in state: ${this.state}`);
        }
        try {
            this.state = ServerState.STARTING;
            this.log('info', 'Starting server initialization...');
            this.setupMiddleware();
            this.setupRoutes();
            await this.startHttpServer();
            this.setupSignalHandlers();
            this.state = ServerState.RUNNING;
            this.log('info', `Server successfully initialized and running on ${this.config.host}:${this.config.port}`);
        }
        catch (error) {
            this.state = ServerState.ERROR;
            this.log('error', 'Failed to initialize server:', error);
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
            this.log('error', 'Error during server shutdown:', error);
            throw error;
        }
    }
    handleSSEConnection(req, res) {
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
                capabilities: ['tools', 'resources', 'prompts'],
            },
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
            this.log('error', `SSE connection error [${requestId}]:`, error);
            this.removeConnection(res);
        });
        res.on('finish', () => {
            clearTimeout(timeout);
            this.log('debug', `SSE response finished [${requestId}]`);
            this.removeConnection(res);
        });
        const heartbeat = setInterval(() => {
            if (this.activeConnections.has(res) && !res.destroyed) {
                this.sendSSEMessage(res, 'heartbeat', { timestamp: Date.now() });
            }
            else {
                clearInterval(heartbeat);
            }
        }, 30000);
        res.on('close', () => clearInterval(heartbeat));
    }
    handleMCPMessage(message, res) {
        this.log('debug', 'Received MCP message:', message, 'Type:', typeof message);
        try {
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
            const response = {
                id: message.id || Date.now(),
                type: 'response',
                response: {
                    status: 'received',
                    originalMessage: message,
                    serverTime: new Date().toISOString(),
                },
            };
            this.broadcastToConnections('message', response);
            res.json({
                status: 'success',
                message: 'MCP message processed',
                messageId: response.id,
            });
        }
        catch (error) {
            this.log('error', 'Error processing MCP message:', error);
            res.status(400).json({
                status: 'error',
                message: 'Invalid MCP message',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
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
            this.log('error', 'Error sending SSE message:', error);
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
    createStructuredError(message, category, statusCode, code, isOperational = true, context) {
        const error = new Error(message);
        error.category = category;
        error.code = code;
        error.statusCode = statusCode;
        error.isOperational = isOperational;
        error.context = context;
        this.trackErrorMetrics(category, code);
        return error;
    }
    trackErrorMetrics(category, code) {
        this.errorMetrics.total++;
        const categoryCount = this.errorMetrics.byCategory.get(category) || 0;
        this.errorMetrics.byCategory.set(category, categoryCount + 1);
        const codeCount = this.errorMetrics.byCode.get(code) || 0;
        this.errorMetrics.byCode.set(code, codeCount + 1);
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
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
        this.app.get('/health', (_req, res) => {
            try {
                const healthMetrics = this.getHealthMetrics();
                const statusCode = healthMetrics.healthy ? 200 : 503;
                res.status(statusCode).json(healthMetrics);
            }
            catch (error) {
                this.log('error', 'Error generating health metrics:', error);
                res.status(500).json({
                    healthy: false,
                    status: 'error',
                    error: 'Failed to generate health metrics',
                    timestamp: new Date().toISOString(),
                });
            }
        });
        this.app.get('/sse', (req, res) => {
            this.handleSSEConnection(req, res);
        });
        this.app.post('/message', (req, res) => {
            this.handleMCPMessage(req.body, res);
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
                    this.log('error', 'HTTP server error:', error);
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
                    this.log('error', 'Error stopping HTTP server:', error);
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
                this.log('error', 'Error during graceful shutdown:', error);
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
        for (const [signal, handler] of Object.entries(this.signalHandlers)) {
            process.removeListener(signal, handler);
        }
        this.signalHandlers = {};
        this.log('debug', 'Signal handlers removed');
    }
    closeAllConnections() {
        this.log('info', `Closing ${this.activeConnections.size} active connections...`);
        for (const connection of this.activeConnections) {
            try {
                connection.end();
            }
            catch (error) {
                this.log('warn', 'Error closing connection:', error);
            }
        }
        this.activeConnections.clear();
        this.connectionCount = 0;
        this.log('info', 'All connections closed');
    }
}
exports.MCPServer = MCPServer;
//# sourceMappingURL=server.js.map