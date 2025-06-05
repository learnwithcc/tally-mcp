"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getRequiredEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
}
function getOptionalEnvVar(name, defaultValue) {
    return process.env[name] || defaultValue;
}
function getEnvVarAsNumber(name, defaultValue) {
    const value = process.env[name];
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
}
function getEnvVarAsBoolean(name, defaultValue) {
    const value = process.env[name];
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true';
}
exports.config = {
    tally: {
        apiKey: getRequiredEnvVar('TALLY_API_KEY'),
        apiBaseUrl: getOptionalEnvVar('TALLY_API_BASE_URL', 'https://api.tally.so/v1'),
        oauth: {
            clientId: getRequiredEnvVar('TALLY_OAUTH_CLIENT_ID'),
            clientSecret: getRequiredEnvVar('TALLY_OAUTH_CLIENT_SECRET'),
            redirectUri: getOptionalEnvVar('TALLY_OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
        },
    },
    server: {
        port: getEnvVarAsNumber('MCP_SERVER_PORT', 3000),
        host: getOptionalEnvVar('MCP_SERVER_HOST', 'localhost'),
        logLevel: getOptionalEnvVar('MCP_LOG_LEVEL', 'info'),
    },
    security: {
        jwtSecret: getRequiredEnvVar('JWT_SECRET'),
        sessionSecret: getRequiredEnvVar('SESSION_SECRET'),
    },
    rateLimit: {
        windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
        maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    },
    development: {
        nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
        debug: getEnvVarAsBoolean('DEBUG', false),
    },
};
function validateConfig() {
    try {
        exports.config.tally.apiKey;
        exports.config.tally.oauth.clientId;
        exports.config.tally.oauth.clientSecret;
        exports.config.security.jwtSecret;
        exports.config.security.sessionSecret;
        console.log('✅ Configuration validation successful');
    }
    catch (error) {
        console.error('❌ Configuration validation failed:', error);
        process.exit(1);
    }
}
exports.default = exports.config;
//# sourceMappingURL=config.js.map