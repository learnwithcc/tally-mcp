/**
 * MCP Server Capability Types
 */

/**
 * Base capability interface with common properties
 */
interface BaseCapability {
  listChanged?: boolean;
  subscribe?: boolean;
}

/**
 * Tools capability configuration
 */
interface ToolsCapability extends BaseCapability {
  // Tool-specific capabilities
  call?: boolean;
  list?: boolean;
}

/**
 * Resources capability configuration
 */
interface ResourcesCapability extends BaseCapability {
  // Resource-specific capabilities
  get?: boolean;
  put?: boolean;
  delete?: boolean;
}

/**
 * Prompts capability configuration
 */
interface PromptsCapability extends BaseCapability {
  // Prompt-specific capabilities
  get?: boolean;
  list?: boolean;
}

/**
 * Logging capability configuration
 */
interface LoggingCapability {
  level?: 'debug' | 'info' | 'warn' | 'error';
  subscribe?: boolean;
}

/**
 * Server capabilities interface
 */
export interface ServerCapabilities {
  protocolVersion: string;
  tools?: ToolsCapability;
  resources?: ResourcesCapability;
  prompts?: PromptsCapability;
  logging?: LoggingCapability;
}

/**
 * Client capabilities interface
 */
export interface ClientCapabilities {
  protocolVersion: string;
  tools?: Partial<ToolsCapability>;
  resources?: Partial<ResourcesCapability>;
  prompts?: Partial<PromptsCapability>;
  logging?: Partial<LoggingCapability>;
}

/**
 * Negotiated capabilities between server and client
 */
export interface NegotiatedCapabilities {
  protocolVersion: string;
  tools?: ToolsCapability;
  resources?: ResourcesCapability;
  prompts?: PromptsCapability;
  logging?: LoggingCapability;
}

/**
 * Default server capabilities
 */
export const DEFAULT_SERVER_CAPABILITIES: ServerCapabilities = {
  protocolVersion: '2024-11-05',
  tools: {
    call: true,
    list: true,
    listChanged: true,
    subscribe: true
  },
  resources: {
    get: true,
    put: true,
    delete: true,
    listChanged: true,
    subscribe: true
  },
  prompts: {
    get: true,
    list: true,
    listChanged: true,
    subscribe: true
  },
  logging: {
    level: 'info',
    subscribe: true
  }
}; 