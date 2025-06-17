import { randomUUID } from 'crypto';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FATAL"] = 0] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 5] = "TRACE";
})(LogLevel || (LogLevel = {}));
export const DEFAULT_LOGGER_CONFIG = {
    level: LogLevel.INFO,
    component: 'MCPServer',
    enableConsole: true,
    enableStructured: true,
    redactSensitive: true,
    sensitiveFields: ['password', 'token', 'key', 'secret', 'authorization', 'cookie', 'api_key', 'apikey'],
    enableTracing: true,
};
export class Logger {
    constructor(config = {}) {
        this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
        this.traceId = randomUUID();
    }
    setTraceId(traceId) {
        this.traceId = traceId;
    }
    getTraceId() {
        return this.traceId;
    }
    child(component, additionalConfig = {}) {
        return new Logger({
            ...this.config,
            ...additionalConfig,
            component,
        });
    }
    fatal(message, context, error, requestId, operation) {
        this.log(LogLevel.FATAL, message, context, error, requestId, operation);
    }
    error(message, context, error, requestId, operation) {
        this.log(LogLevel.ERROR, message, context, error, requestId, operation);
    }
    warn(message, context, error, requestId, operation) {
        this.log(LogLevel.WARN, message, context, error, requestId, operation);
    }
    info(message, context, error, requestId, operation) {
        this.log(LogLevel.INFO, message, context, error, requestId, operation);
    }
    debug(message, context, error, requestId, operation) {
        this.log(LogLevel.DEBUG, message, context, error, requestId, operation);
    }
    trace(message, context, error, requestId, operation) {
        this.log(LogLevel.TRACE, message, context, error, requestId, operation);
    }
    startOperation(operation, context, requestId) {
        const startTime = Date.now();
        this.debug(`Starting operation: ${operation}`, context, undefined, requestId, operation);
        return () => {
            const duration = Date.now() - startTime;
            this.debug(`Completed operation: ${operation}`, { ...context, duration }, undefined, requestId, operation);
        };
    }
    log(level, message, context, error, requestId, operation) {
        if (level > this.config.level)
            return;
        const entry = {
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
            entry.context = this.config.redactSensitive
                ? this.redactSensitiveData(context)
                : context;
        }
        if (this.config.enableStructured) {
            this.outputStructuredLog(entry);
        }
        if (this.config.enableConsole) {
            this.outputConsoleLog(entry);
        }
    }
    outputStructuredLog(entry) {
        console.log(JSON.stringify(entry));
    }
    outputConsoleLog(entry) {
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
    redactSensitiveData(data) {
        const redacted = { ...data };
        const redactValue = (obj, path = []) => {
            if (obj === null || obj === undefined)
                return obj;
            if (Array.isArray(obj)) {
                return obj.map((item, index) => redactValue(item, [...path, index.toString()]));
            }
            if (typeof obj === 'object') {
                const result = {};
                for (const [key, value] of Object.entries(obj)) {
                    const lowerKey = key.toLowerCase();
                    if (this.config.sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
                        result[key] = '[REDACTED]';
                    }
                    else {
                        result[key] = redactValue(value, [...path, key]);
                    }
                }
                return result;
            }
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
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
}
export const createLogger = (component, config) => {
    return new Logger({ ...config, component });
};
export const logger = new Logger();
//# sourceMappingURL=logger.js.map