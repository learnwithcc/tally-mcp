import { ServerCapabilities, ClientCapabilities, NegotiatedCapabilities, DEFAULT_SERVER_CAPABILITIES } from '../types/capabilities';
import { StructuredError } from '../types/errors';

/**
 * Check if protocol versions are compatible
 * @param serverVersion Server protocol version
 * @param clientVersion Client protocol version
 * @returns True if versions are compatible
 */
function areVersionsCompatible(serverVersion: string, clientVersion: string): boolean {
  // For now, versions must match exactly. In the future, we can implement semver comparison
  return serverVersion === clientVersion;
}

/**
 * Negotiate capabilities between server and client
 * @param clientCapabilities Optional client capabilities to negotiate with
 * @returns Negotiated capabilities
 * @throws {StructuredError} If protocol versions are incompatible
 */
export function negotiateCapabilities(clientCapabilities?: ClientCapabilities): NegotiatedCapabilities {
  // Start with protocol version
  const negotiatedCapabilities: NegotiatedCapabilities = {
    protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion
  };

  // If no client capabilities provided, copy server defaults
  if (!clientCapabilities) {
    if (DEFAULT_SERVER_CAPABILITIES.tools) {
      negotiatedCapabilities.tools = { ...DEFAULT_SERVER_CAPABILITIES.tools };
    }
    if (DEFAULT_SERVER_CAPABILITIES.resources) {
      negotiatedCapabilities.resources = { ...DEFAULT_SERVER_CAPABILITIES.resources };
    }
    if (DEFAULT_SERVER_CAPABILITIES.prompts) {
      negotiatedCapabilities.prompts = { ...DEFAULT_SERVER_CAPABILITIES.prompts };
    }
    if (DEFAULT_SERVER_CAPABILITIES.logging) {
      negotiatedCapabilities.logging = { ...DEFAULT_SERVER_CAPABILITIES.logging };
    }
    return negotiatedCapabilities;
  }

  // Check protocol version compatibility
  if (!areVersionsCompatible(DEFAULT_SERVER_CAPABILITIES.protocolVersion, clientCapabilities.protocolVersion)) {
    throw new StructuredError({
      code: 'INCOMPATIBLE_PROTOCOL_VERSION',
      message: `Protocol version mismatch. Server: ${DEFAULT_SERVER_CAPABILITIES.protocolVersion}, Client: ${clientCapabilities.protocolVersion}`,
      data: {
        serverVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        clientVersion: clientCapabilities.protocolVersion
      }
    });
  }

  // Negotiate tools capabilities
  if (clientCapabilities.tools && DEFAULT_SERVER_CAPABILITIES.tools) {
    negotiatedCapabilities.tools = {
      call: clientCapabilities.tools.call ?? DEFAULT_SERVER_CAPABILITIES.tools.call ?? false,
      list: clientCapabilities.tools.list ?? DEFAULT_SERVER_CAPABILITIES.tools.list ?? false,
      listChanged: clientCapabilities.tools.listChanged ?? DEFAULT_SERVER_CAPABILITIES.tools.listChanged ?? false,
      subscribe: clientCapabilities.tools.subscribe ?? DEFAULT_SERVER_CAPABILITIES.tools.subscribe ?? false
    };
  }

  // Negotiate resources capabilities
  if (clientCapabilities.resources && DEFAULT_SERVER_CAPABILITIES.resources) {
    negotiatedCapabilities.resources = {
      get: clientCapabilities.resources.get ?? DEFAULT_SERVER_CAPABILITIES.resources.get ?? false,
      put: clientCapabilities.resources.put ?? DEFAULT_SERVER_CAPABILITIES.resources.put ?? false,
      delete: clientCapabilities.resources.delete ?? DEFAULT_SERVER_CAPABILITIES.resources.delete ?? false,
      listChanged: clientCapabilities.resources.listChanged ?? DEFAULT_SERVER_CAPABILITIES.resources.listChanged ?? false,
      subscribe: clientCapabilities.resources.subscribe ?? DEFAULT_SERVER_CAPABILITIES.resources.subscribe ?? false
    };
  }

  // Negotiate prompts capabilities
  if (clientCapabilities.prompts && DEFAULT_SERVER_CAPABILITIES.prompts) {
    negotiatedCapabilities.prompts = {
      get: clientCapabilities.prompts.get ?? DEFAULT_SERVER_CAPABILITIES.prompts.get ?? false,
      list: clientCapabilities.prompts.list ?? DEFAULT_SERVER_CAPABILITIES.prompts.list ?? false,
      listChanged: clientCapabilities.prompts.listChanged ?? DEFAULT_SERVER_CAPABILITIES.prompts.listChanged ?? false,
      subscribe: clientCapabilities.prompts.subscribe ?? DEFAULT_SERVER_CAPABILITIES.prompts.subscribe ?? false
    };
  }

  // Negotiate logging capabilities
  if (clientCapabilities.logging && DEFAULT_SERVER_CAPABILITIES.logging) {
    negotiatedCapabilities.logging = {
      level: clientCapabilities.logging.level ?? DEFAULT_SERVER_CAPABILITIES.logging.level ?? 'info',
      subscribe: clientCapabilities.logging.subscribe ?? DEFAULT_SERVER_CAPABILITIES.logging.subscribe ?? false
    };
  }

  return negotiatedCapabilities;
}

/**
 * Validate client capabilities against server capabilities
 * @param capabilities Client capabilities to validate
 * @returns True if capabilities are valid, false otherwise
 */
export function validateClientCapabilities(capabilities: unknown): capabilities is ClientCapabilities {
  if (!capabilities || typeof capabilities !== 'object') {
    return false;
  }

  const capObj = capabilities as Record<string, unknown>;
  
  // Check for unknown capability categories
  const validCategories = ['tools', 'resources', 'prompts', 'logging'];
  const hasInvalidCategory = Object.keys(capObj).some(key => !validCategories.includes(key));
  
  if (hasInvalidCategory) {
    return false;
  }

  // Validate tools capabilities
  if (capObj.tools && typeof capObj.tools !== 'object') {
    return false;
  }

  // Validate resources capabilities
  if (capObj.resources && typeof capObj.resources !== 'object') {
    return false;
  }

  // Validate prompts capabilities
  if (capObj.prompts && typeof capObj.prompts !== 'object') {
    return false;
  }

  // Validate logging capabilities
  if (capObj.logging) {
    if (typeof capObj.logging !== 'object') {
      return false;
    }
    
    const logging = capObj.logging as Record<string, unknown>;
    if (logging.level && !['debug', 'info', 'warn', 'error'].includes(logging.level as string)) {
      return false;
    }
  }

  return true;
} 